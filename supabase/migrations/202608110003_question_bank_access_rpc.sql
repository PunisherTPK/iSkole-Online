create or replace function public.get_question_bank_access(
  p_user_id uuid,
  p_subject_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  result text;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    return 'free';
  end if;

  select 'premium'
    into result
  from public.student_subscriptions ss
  where ss.user_id = p_user_id
    and ss.plan_type = 'premium'
    and ss.status = 'active'
    and ss.starts_at <= now()
    and (ss.ends_at is null or ss.ends_at > now())
  limit 1;

  if result = 'premium' then
    return result;
  end if;

  select 'subject'
    into result
  from public.student_subscriptions ss
  where ss.user_id = p_user_id
    and ss.plan_type = 'subject'
    and ss.subject_id = p_subject_id
    and ss.status = 'active'
    and ss.starts_at <= now()
    and (ss.ends_at is null or ss.ends_at > now())
  limit 1;

  if result = 'subject' then
    return result;
  end if;

  return 'free';
end;
$$;

revoke all on function public.get_question_bank_access(uuid, uuid) from public;
grant execute on function public.get_question_bank_access(uuid, uuid) to authenticated;
