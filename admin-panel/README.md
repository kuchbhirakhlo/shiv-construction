# Shiv Construction — admin staff panel (Vercel website)

Drop-in sources for the **Staff & HR** page on [shivconstruction-liart.vercel.app](https://shivconstruction-liart.vercel.app). Based on Solar Universe’s `AdminStaff.tsx`, adapted for:

- Firebase project **`shivconstruction-ad026`**
- Staff Auth email domain **`staff.shivconstruction.app`** (must match the Flutter app)
- Employee ID prefix **`SWT`** (e.g. `SWT-SM-0001`)
- **`provisionStaffLogin`** Cloud Function (Admin SDK) instead of browser `createUserWithEmailAndPassword`

**Do not edit Solar Universe** — only copy from here into your website repo.

## Files

| This repo | Copy to website |
|-----------|-----------------|
| `src/components/AdminStaff.tsx` | `src/components/AdminStaff.tsx` |
| `src/firebase/config.ts` | Merge into `src/firebase/config.ts` (`provisionStaffLoginCall`, `staffAuthEmail`, domain) |
| `src/firebase/db.staff.ts` | Merge exports into `src/firebase/db.ts` (or re-export) |
| `src/types/staff.ts` | Ensure `Staff` includes `authEmail` (merge into `src/types.ts`) |
| `src/utils/exportExcel.ts` | Same path if missing |

## Before staff add works end-to-end

1. Deploy functions (once per project):

   ```bash
   cd functions && npm ci
   firebase deploy --only functions:provisionStaffLogin,functions:onStaffWritten --project shivconstruction-ad026
   ```

2. If employee ID counters fail with permission denied:

   ```bash
   cd scripts && node add_counters_rule.js --apply
   ```

3. Redeploy the Vercel site after copying these files.

## Auth conflicts

If you see `auth/invalid-credential` on an **old** deployment that still uses browser sign-up, delete the conflicting user in Firebase Authentication or run:

```bash
node scripts/delete_staff_auth_by_employee_id.js <employeeId>
```

Fallback after bulk imports:

```bash
node scripts/provision_staff_auth.js
```