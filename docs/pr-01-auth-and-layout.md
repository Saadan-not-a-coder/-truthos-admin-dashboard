# PR #1: Admin authentication and app shell

## Summary

Adds Supabase email/password auth restricted to admin users, protected routing, auth layout pages (sign-in / sign-up), and the main app chrome with sign-out and dark mode.

## How to test

1. Run migrations and deploy `promote-to-admin` Edge Function.
2. `npm run dev` and open `/sign-in`.
3. Sign in with seeded admin credentials — should land on organization directory.
4. Sign out and confirm protected routes redirect to `/sign-in`.
5. Sign up with invalid admin code — should be rejected.
6. Sign up with valid `ADMIN_SIGNUP_CODE` secret — should gain admin access.
