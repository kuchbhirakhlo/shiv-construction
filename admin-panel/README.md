# Admin panel fix: `auth/invalid-credential` when adding staff

The live site ([shivconstruction-liart.vercel.app](https://shivconstruction-liart.vercel.app)) provisions staff login **in the browser** before writing Firestore. When `<employeeId>@staff.shivconstruction.app` is already registered with a **different** password, `signInWithEmailAndPassword` fails with `auth/invalid-credential` and **no staff doc is saved**.

The mobile app expects `staff/{docId}` where **doc id = Firebase Auth uid** (see `scripts/provision_staff_auth.js`).

## Fix (recommended)

1. **Deploy Cloud Functions** from this repo (not deployed yet — `provisionStaffLogin` returns 404):

   ```bash
   cd functions && npm ci
   firebase deploy --only functions:provisionStaffLogin,functions:onStaffWritten --project shivconstruction-ad026
   ```

2. **Publish Firestore `counters` rule** if employee ID allocation fails with permission denied:

   ```bash
   cd scripts && npm ci
   node add_counters_rule.js --apply
   ```

3. **Patch the Vercel admin app** (copy the snippets below into your website repo’s `src/firebase/` and `src/components/AdminStaff.tsx`, then redeploy).

### `src/firebase/staffAuthProvision.ts`

Copy from [`staff-auth-provision.ts`](./staff-auth-provision.ts) (adjust the `app` import path).

### Replace `createOrVerifyStaffAuthAccount` in `src/firebase/config.ts`

Delete the secondary-app `createUser` / `signIn` flow. Use the snippet in [`config.staff-auth.ts`](./config.staff-auth.ts).

### `AdminStaff.tsx` — `handleSubmit` (after `generateEmployeeId`)

Use the flow in [`AdminStaff.handleSubmit.tsx`](./AdminStaff.handleSubmit.tsx): pick `staffId = crypto.randomUUID()`, call `provisionStaffLoginCall`, then `addStaffWithId(staffId, payload)`.

## Workaround without redeploying the website

- In [Firebase Console → Authentication](https://console.firebase.google.com/project/shivconstruction-ad026/authentication/users), search for `<employeeId>@staff.shivconstruction.app` and **delete** the user, then add staff again with the password you want.

- Or run (requires `scripts/serviceAccountKey.json`):

  ```bash
  node scripts/delete_staff_auth_by_employee_id.js SWT-SM-0002
  ```

After a staff doc exists without auth, run:

```bash
node scripts/provision_staff_auth.js
```