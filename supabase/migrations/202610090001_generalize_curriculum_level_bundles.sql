alter table public.payment_settings add column if not exists bundle_price numeric;
update public.payment_settings set bundle_price = 2000 where bundle_price is null;

CREATE OR REPLACE FUNCTION public.admin_approve_payment_request(p_request_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
declare
  v_admin_id uuid := auth.uid();
  v_request public.payment_requests%rowtype;
  v_item record;
  v_subscription public.student_subscriptions%rowtype;
  v_count integer := 0;
  v_start timestamptz;
  v_end timestamptz;
  v_items_total numeric := 0;
  v_bundle_price numeric;
  v_bundle_currency text;
begin
  if v_admin_id is null then raise exception 'Authentication required'; end if;
  if not exists(select 1 from public.profiles where id=v_admin_id and role='admin' and is_active=true) then raise exception 'Admin access required'; end if;
  select * into v_request from public.payment_requests where id=p_request_id for update;
  if not found then raise exception 'Payment request not found'; end if;
  if v_request.status <> 'pending' then raise exception 'Payment request is already %',v_request.status; end if;

  if v_request.plan_type='premium' then
    if exists(select 1 from public.payment_request_items where payment_request_id=v_request.id) then raise exception 'Premium payment request must not contain subject items'; end if;
    select * into v_subscription from public.student_subscriptions where user_id=v_request.user_id and plan_type='premium' and status='active' order by ends_at desc nulls last limit 1 for update;
    v_start:=now();
    if found and v_subscription.ends_at is not null and v_subscription.ends_at>now() then
      v_start:=v_subscription.ends_at; v_end:=v_subscription.ends_at+interval '30 days';
      update public.student_subscriptions set ends_at=v_end,updated_at=now() where id=v_subscription.id;
    else
      v_end:=now()+interval '30 days';
      insert into public.student_subscriptions(user_id,plan_type,curriculum_id,level_id,subject_id,status,starts_at,ends_at)
      values(v_request.user_id,'premium',null,null,null,'active',v_start,v_end);
    end if;
    v_count:=1;

  elsif v_request.plan_type='bundle' then
    if v_request.curriculum_id is null or v_request.level_id is null then raise exception 'Bundle payment request is missing curriculum and level'; end if;
    if exists(select 1 from public.payment_request_items where payment_request_id=v_request.id) then raise exception 'Bundle payment request must not contain subject items'; end if;
    if not exists(select 1 from public.curriculums c join public.levels l on l.curriculum_id=c.id where c.id=v_request.curriculum_id and l.id=v_request.level_id and c.is_active and l.is_active) then raise exception 'Invalid curriculum and level combination'; end if;
    select bundle_price,currency into v_bundle_price,v_bundle_currency from public.payment_settings order by created_at asc limit 1;
    if coalesce(v_bundle_price,0)<=0 then raise exception 'Bundle pricing is currently unavailable'; end if;
    if v_request.currency <> coalesce(v_bundle_currency,'LKR') or v_request.amount <> v_bundle_price then raise exception 'Bundle payment amount no longer matches the current bundle price'; end if;
    select * into v_subscription from public.student_subscriptions where user_id=v_request.user_id and plan_type='bundle' and curriculum_id=v_request.curriculum_id and level_id=v_request.level_id and status='active' order by ends_at desc nulls last limit 1 for update;
    v_start:=now();
    if found and v_subscription.ends_at is not null and v_subscription.ends_at>now() then
      v_start:=v_subscription.ends_at; v_end:=v_subscription.ends_at+interval '30 days';
      update public.student_subscriptions set ends_at=v_end,updated_at=now() where id=v_subscription.id;
    else
      v_end:=now()+interval '30 days';
      insert into public.student_subscriptions(user_id,plan_type,curriculum_id,level_id,subject_id,status,starts_at,ends_at)
      values(v_request.user_id,'bundle',v_request.curriculum_id,v_request.level_id,null,'active',v_start,v_end);
    end if;
    v_count:=1;

  elsif v_request.plan_type='subject' then
    if not exists(select 1 from public.payment_request_items where payment_request_id=v_request.id) then raise exception 'Subject payment request has no items'; end if;
    if exists(select 1 from public.payment_request_items where payment_request_id=v_request.id group by curriculum_id,level_id,subject_id having count(*)>1) then raise exception 'Subject payment request contains duplicate selections'; end if;
    select coalesce(sum(amount),0) into v_items_total from public.payment_request_items where payment_request_id=v_request.id;
    if v_items_total<>coalesce(v_request.amount,0) then raise exception 'Payment total does not match the selected subjects'; end if;
    for v_item in select curriculum_id,level_id,subject_id from public.payment_request_items where payment_request_id=v_request.id loop
      if not exists(select 1 from public.curriculums c join public.levels l on l.curriculum_id=c.id join public.subjects s on s.level_id=l.id where c.id=v_item.curriculum_id and l.id=v_item.level_id and s.id=v_item.subject_id and c.is_active and l.is_active and s.is_active) then raise exception 'Invalid curriculum, level and subject combination in payment request'; end if;
      select * into v_subscription from public.student_subscriptions where user_id=v_request.user_id and plan_type='subject' and curriculum_id=v_item.curriculum_id and level_id=v_item.level_id and subject_id=v_item.subject_id and status='active' order by ends_at desc nulls last limit 1 for update;
      if found and v_subscription.ends_at is not null and v_subscription.ends_at>now() then
        update public.student_subscriptions set ends_at=v_subscription.ends_at+interval '30 days',updated_at=now() where id=v_subscription.id;
      else
        insert into public.student_subscriptions(user_id,plan_type,curriculum_id,level_id,subject_id,status,starts_at,ends_at)
        values(v_request.user_id,'subject',v_item.curriculum_id,v_item.level_id,v_item.subject_id,'active',now(),now()+interval '30 days');
      end if;
      v_count:=v_count+1;
    end loop;
  else
    raise exception 'Unsupported payment plan: %',v_request.plan_type;
  end if;

  update public.payment_requests set status='approved',reviewed_by=v_admin_id,reviewed_at=now(),paid_at=now() where id=v_request.id;
  return jsonb_build_object('success',true,'request_id',v_request.id,'subscriptions_created_or_extended',v_count);
end;
$function$;