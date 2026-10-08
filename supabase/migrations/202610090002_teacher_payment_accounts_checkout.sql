alter table public.profiles add column if not exists is_head_mentor boolean not null default false;
update public.profiles set is_head_mentor = true where id = '5d78b037-a1ca-484c-bb27-a0fc301b4f33';
create unique index if not exists profiles_single_head_mentor_idx on public.profiles (is_head_mentor) where is_head_mentor = true;

create table if not exists public.teacher_payment_accounts (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null unique references public.profiles(id) on delete cascade,
  bank_name text not null,
  account_name text not null,
  account_number text not null,
  branch_name text,
  instructions text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.teacher_payment_accounts enable row level security;
drop policy if exists "teachers manage own payment account" on public.teacher_payment_accounts;
create policy "teachers manage own payment account" on public.teacher_payment_accounts for all to authenticated using (teacher_id=auth.uid()) with check (teacher_id=auth.uid() and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='teacher' and p.is_active));

alter table public.payment_requests add column if not exists recipient_teacher_id uuid references public.profiles(id), add column if not exists recipient_account_name text, add column if not exists recipient_bank_name text, add column if not exists recipient_account_number text, add column if not exists recipient_branch_name text, add column if not exists recipient_instructions text;
alter table public.payment_request_items add column if not exists teacher_id uuid references public.profiles(id), add column if not exists recipient_account_name text, add column if not exists recipient_bank_name text, add column if not exists recipient_account_number text, add column if not exists recipient_branch_name text, add column if not exists recipient_instructions text;

create or replace function public.get_checkout_payment_accounts(p_plan_type text,p_subject_ids uuid[] default null)
returns table(teacher_id uuid,teacher_name text,bank_name text,account_name text,account_number text,branch_name text,instructions text)
language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if p_plan_type in ('premium','bundle') then
  return query select p.id,p.full_name,a.bank_name,a.account_name,a.account_number,a.branch_name,a.instructions from public.profiles p join public.teacher_payment_accounts a on a.teacher_id=p.id where p.role='teacher' and p.is_active and p.is_head_mentor and a.is_active order by p.full_name limit 1;
 elsif p_plan_type='subject' then
  if coalesce(array_length(p_subject_ids,1),0)=0 then return; end if;
  return query select distinct p.id,p.full_name,a.bank_name,a.account_name,a.account_number,a.branch_name,a.instructions from public.teacher_subjects ts join public.profiles p on p.id=ts.teacher_id join public.teacher_payment_accounts a on a.teacher_id=p.id where ts.subject_id=any(p_subject_ids) and ts.is_active and p.role='teacher' and p.is_active and a.is_active order by p.full_name;
 else raise exception 'Unsupported payment plan: %',p_plan_type; end if;
end; $$;
revoke all on function public.get_checkout_payment_accounts(text,uuid[]) from public;
grant execute on function public.get_checkout_payment_accounts(text,uuid[]) to authenticated;

create or replace function public.submit_payment_request(p_plan_type text,p_curriculum_id uuid,p_level_id uuid,p_amount numeric,p_currency text,p_payment_reference text,p_proof_image_url text,p_items jsonb default '[]'::jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare
 v_user_id uuid:=auth.uid(); v_request_id uuid; v_item jsonb; v_subject_id uuid; v_item_curriculum_id uuid; v_item_level_id uuid; v_item_amount numeric; v_teacher_id uuid; v_teacher_count integer; v_item_total numeric:=0; v_subject_price numeric; v_bundle_price numeric; v_premium_price numeric; v_currency text; v_account public.teacher_payment_accounts%rowtype; v_profile public.profiles%rowtype;
begin
 if v_user_id is null then raise exception 'Authentication required'; end if;
 if trim(coalesce(p_payment_reference,''))='' then raise exception 'Payment reference is required'; end if;
 select currency,subject_price,bundle_price,premium_price into v_currency,v_subject_price,v_bundle_price,v_premium_price from public.payment_settings order by created_at asc limit 1;
 if p_currency<>coalesce(v_currency,'LKR') then raise exception 'Invalid payment currency'; end if;
 if p_plan_type='premium' then
  if p_amount<>coalesce(v_premium_price,0) or p_amount<=0 then raise exception 'Invalid premium amount'; end if;
  select p.id,p.full_name into v_profile.id,v_profile.full_name from public.profiles p join public.teacher_payment_accounts a on a.teacher_id=p.id where p.role='teacher' and p.is_active and p.is_head_mentor and a.is_active order by p.full_name limit 1;
  if v_profile.id is null then raise exception 'Head mentor payment account has not been configured'; end if;
  select * into v_account from public.teacher_payment_accounts where teacher_id=v_profile.id and is_active;
  insert into public.payment_requests(user_id,plan_type,amount,currency,payment_reference,proof_image_url,status,recipient_teacher_id,recipient_account_name,recipient_bank_name,recipient_account_number,recipient_branch_name,recipient_instructions) values(v_user_id,'premium',p_amount,p_currency,trim(p_payment_reference),p_proof_image_url,'pending',v_profile.id,v_account.account_name,v_account.bank_name,v_account.account_number,v_account.branch_name,v_account.instructions) returning id into v_request_id; return v_request_id;
 end if;
 if p_plan_type='bundle' then
  if p_curriculum_id is null or p_level_id is null then raise exception 'Bundle requires a curriculum and level'; end if;
  if p_amount<>coalesce(v_bundle_price,0) or p_amount<=0 then raise exception 'Invalid bundle amount'; end if;
  if not exists(select 1 from public.curriculums c join public.levels l on l.curriculum_id=c.id where c.id=p_curriculum_id and l.id=p_level_id and c.is_active and l.is_active) then raise exception 'Invalid curriculum and level'; end if;
  select p.id,p.full_name into v_profile.id,v_profile.full_name from public.profiles p join public.teacher_payment_accounts a on a.teacher_id=p.id where p.role='teacher' and p.is_active and p.is_head_mentor and a.is_active order by p.full_name limit 1;
  if v_profile.id is null then raise exception 'Head mentor payment account has not been configured'; end if;
  select * into v_account from public.teacher_payment_accounts where teacher_id=v_profile.id and is_active;
  insert into public.payment_requests(user_id,plan_type,curriculum_id,level_id,amount,currency,payment_reference,proof_image_url,status,recipient_teacher_id,recipient_account_name,recipient_bank_name,recipient_account_number,recipient_branch_name,recipient_instructions) values(v_user_id,'bundle',p_curriculum_id,p_level_id,p_amount,p_currency,trim(p_payment_reference),p_proof_image_url,'pending',v_profile.id,v_account.account_name,v_account.bank_name,v_account.account_number,v_account.branch_name,v_account.instructions) returning id into v_request_id; return v_request_id;
 end if;
 if p_plan_type<>'subject' then raise exception 'Unsupported payment plan: %',p_plan_type; end if;
 if coalesce(jsonb_array_length(p_items),0)=0 then raise exception 'Select at least one subject'; end if;
 insert into public.payment_requests(user_id,plan_type,amount,currency,payment_reference,proof_image_url,status) values(v_user_id,'subject',p_amount,p_currency,trim(p_payment_reference),p_proof_image_url,'pending') returning id into v_request_id;
 for v_item in select value from jsonb_array_elements(p_items) loop
  v_subject_id:=(v_item->>'subject_id')::uuid; v_item_curriculum_id:=(v_item->>'curriculum_id')::uuid; v_item_level_id:=(v_item->>'level_id')::uuid; v_item_amount:=(v_item->>'amount')::numeric;
  if v_item_amount<>coalesce(v_subject_price,0) or v_item_amount<=0 then raise exception 'Invalid subject price'; end if;
  if not exists(select 1 from public.curriculums c join public.levels l on l.curriculum_id=c.id join public.subjects s on s.level_id=l.id where c.id=v_item_curriculum_id and l.id=v_item_level_id and s.id=v_subject_id and c.is_active and l.is_active and s.is_active) then raise exception 'Invalid subject selection'; end if;
  select count(distinct teacher_id),min(teacher_id) into v_teacher_count,v_teacher_id from public.teacher_subjects where subject_id=v_subject_id and is_active;
  if v_teacher_count<>1 then raise exception 'A subject must have exactly one active teacher before it can be purchased'; end if;
  select * into v_account from public.teacher_payment_accounts where teacher_id=v_teacher_id and is_active;
  if not found then raise exception 'The selected teacher has not configured a payment account'; end if;
  v_item_total:=v_item_total+v_item_amount;
  insert into public.payment_request_items(payment_request_id,curriculum_id,level_id,subject_id,amount,teacher_id,recipient_account_name,recipient_bank_name,recipient_account_number,recipient_branch_name,recipient_instructions) values(v_request_id,v_item_curriculum_id,v_item_level_id,v_subject_id,v_item_amount,v_teacher_id,v_account.account_name,v_account.bank_name,v_account.account_number,v_account.branch_name,v_account.instructions);
 end loop;
 if v_item_total<>p_amount then raise exception 'Payment total does not match selected subjects'; end if;
 return v_request_id;
end; $$;
revoke all on function public.submit_payment_request(text,uuid,uuid,numeric,text,text,text,jsonb) from public;
grant execute on function public.submit_payment_request(text,uuid,uuid,numeric,text,text,text,jsonb) to authenticated;
