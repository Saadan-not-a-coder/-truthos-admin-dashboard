# PR #2: Organizations, directory, and member invitations

## Summary

Adds organization creation (type-specific validation via Edge Function), directory view with member counts, organization detail with invite form, and `invite-member` Edge Function with duplicate-email prevention.

## How to test

1. Sign in as admin.
2. Create a School org — confirm district field is required.
3. Verify org appears in directory without full page reload.
4. Open org detail and invite `test@example.com`.
5. Confirm member shows as **Invited**; duplicate invite returns an error.
6. Create Nonprofit and Business orgs to verify conditional fields and badges.
