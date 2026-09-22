revoke execute on function public.get_budget_by_slug(text), public.get_my_permissions(), public.get_my_roles(), public.handle_new_user(), public.has_role(uuid, app_role), public.is_admin(uuid), public.is_staff(uuid), public.set_budget_status(text, budget_status) from public, anon, authenticated;

grant execute on function public.get_budget_by_slug(text) to anon, authenticated;
grant execute on function public.get_my_permissions() to authenticated;
grant execute on function public.get_my_roles() to authenticated;
grant execute on function public.has_role(uuid, app_role) to authenticated;
grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.is_staff(uuid) to authenticated;
grant execute on function public.set_budget_status(text, budget_status) to authenticated;