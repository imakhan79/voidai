-- VOID AI — 0003_fix_is_org_member_grant
-- 0001_init revoked EXECUTE on private.is_org_member from authenticated,
-- which broke every RLS policy that calls it (RLS policies run as the
-- querying role and need EXECUTE to invoke the function at all, even though
-- SECURITY DEFINER changes what role runs *inside* it). The `private` schema
-- is not in PostgREST's exposed schema list, so it was never reachable as a
-- direct API call anyway — the revoke bought no real protection and just
-- broke org-scoped reads for every authenticated user.

grant execute on function private.is_org_member(uuid) to authenticated;
