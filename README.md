# Shiv Construction

This is the Flutter app for **Shiv Construction**, a Kanpur solar EPC company that is MNRE & UPNEDA registered. It also handles smart meter installation and construction projects.

The app was cloned from the Solar Universe app and rebranded. The reference website is https://shivconstruction-liart.vercel.app/. `CLONING_GUIDE.md` is the clone/rebrand playbook used to produce it.

| | |
|---|---|
| Package / bundle ID | `com.shivconstruction.app` |
| Firebase project | **`shivconstruction-ad026`** (Android app `1:1080264611967:android:b11e56675b066d0b4c074a`) |
| Office | 25 near SBI Bank, Vasant Vihar, Naubasta, Near South City Public School, Kanpur 208021 |
| Phone / WhatsApp | +91 70177 25641 |
| Email | shivconstruction311@gmail.com |
| GSTN | 09ALEPY2620D1Z6 |
| Vendor code | FZD2609113257 |
| Hours | Mon–Sat 9 AM – 6 PM |

The palette comes from the website: deep green `#1D5A3C` / `#173C2B`, gold `#BD8B21`, cream `#FFFEFB`, and slate text `#0F172A`. All of it is defined in `lib/core/constants/app_color_constants.dart`. The font is REM, which is bundled with the app.

## What the app does

- **Public marketing app.** The home page mirrors the website section by section:
  - hero
  - partner-logo marquee
  - On-Grid / Hybrid / Off-Grid solutions
  - Smart Meter and Construction
  - About, with stats
  - why-us
  - pricing
  - projects
  - contact, with a lead form
  - footer

  Every CTA opens the enquiry sheet with the matching system type already selected. Enquiries are written to the Firestore `enquiries` collection.
- **Staff CRM portal.** Staff sign in with Employee ID and password, using the synthetic email domain `staff.shivconstruction.app`. The portal covers enquiries, customers, quick quotation (with a PDF), attendance and GPS tracking. Engineers get a service-request screen.
- **Customer portal.** Customers sign in with phone OTP. They see their profile and can raise service requests.

## Data sources

- **Pricing** comes live from Firestore `pricing`. If that collection is empty or can't be read, the home page falls back to the website's four packages (3/4/5/10 kW), defined in `lib/features/home/domain/home_content.dart`.
- **Projects** come live from Firestore `projects`. The section is hidden when there are none.
- **Company info, solutions and partner logos** are static in the app:
  - company info and solutions: `static_content_data.dart` and `home_content.dart`
  - partner logos: `assets/images/brands/`
  - service illustrations: `assets/svg/`

On 2026-10-18, `shivconstruction-ad026` already held admin-managed `pricing` and `projects` documents, and the app read them fine. The project documents look like the website's demo content: Pune addresses and a stock rocket image. Fix them in the admin panel, not in the app.

## Platform status

- **Android: working.** `android/app/google-services.json` and `lib/firebase_options.dart` both point at ad026.
- **iOS and web: not configured.** ad026 has no iOS or web app registered yet, so `DefaultFirebaseOptions` throws a clear `UnsupportedError` on those platforms. To set them up:
  1. Register the apps in the Firebase console, or run `scripts/register_apps.js`.
  2. Add `ios/Runner/GoogleService-Info.plist`.
  3. Fill in the `ios` and `web` options.

## Firebase setup (verified 2026-10-18)

The admin key lives at `scripts/serviceAccountKey.json` (gitignored). `ad026` is shared with the website's admin and sales portals, and those portals own most of its data.

**Firestore rules.** `firestore.rules` is the live ruleset that was already deployed (`scripts/live_firestore.rules` is a snapshot of it), plus one added rule:
- `staff_locations`: a staff member can write only their own document, and anyone signed in can read.

Deploy with `node scripts/deploy_firestore_rules.js`. Always start from the live rules; don't overwrite them. The website uses collections the app never touches: `invoices`, `construction_work`, `smart_meter_installations` and `admin_quotations`.

**Indexes.** None are needed. The service account isn't allowed to create indexes (403), so the per-staff lists for enquiries, customers, quotations and service requests filter on one field and sort on the device.

**Staff login.** Staff accounts come from the `staff` docs that the website's admin panel creates. **After adding staff or changing a password there, run:**

```bash
node scripts/provision_staff_auth.js
```

Then check them with `node scripts/check_staff_login.js`. SWT-SM-0001 is provisioned and verified. (The `SWT-` prefix comes from the admin panel's template.)

If the admin panel logs `counters/staffId_*` permission errors, publish the `counters` rule: `node scripts/add_counters_rule.js --apply` (see `firestore.rules`). For `auth/invalid-credential` on add-staff, see `admin-panel/README.md` (deploy `provisionStaffLogin`, patch Vercel admin app, or delete the conflicting Auth user with `node scripts/delete_staff_auth_by_employee_id.js <employeeId>`).

**Phone auth.** Phone sign-in is enabled. The test number is `+91 98765 43210`, with OTP `123456`, so no real SMS is sent. The debug keystore's and the release upload key's SHA-1 and SHA-256 are registered (`scripts/register_sha.js`). After enrolling in Play App Signing, add Play's app-signing key fingerprints there too and re-run the script.

**Cloud Storage (Blaze, enabled 2026-10-19).** The bucket is `shivconstruction-ad026.firebasestorage.app`. `storage.rules` lets staff and admins (via custom claims from `provision_staff_auth.js`) upload images and PDFs under 10 MB to three paths:
- `customers/` — KYC documents
- `enquiries/` — site photos
- `service_requests/` — installation photos

Everything else is denied. Deploy with `node scripts/deploy_storage_rules.js`.

Uploads were verified two ways:
- **REST:** staff uploads to all 3 paths succeed. Uploads are denied for anonymous users, for non-image/PDF files, and for paths outside those three.
- **In the app:** a PAN document uploaded and its link was saved on the customer.

`AppConfig.storageUploadsEnabled = true`, so KYC documents are required and upload errors are shown. The enquiry site photo stays optional.

**Release signing.** `android/app/upload-keystore.jks` is the Shiv Construction upload key (`CN=Shiv Construction`, alias `shivconstruction-upload`, created 2026-10-19). Its password is in `android/key.properties`. Both files are gitignored. **Back them up somewhere safe**: losing them means you can't publish updates without a key reset through Play support. The old inherited keys are kept as `*-leftover.jks` but not used.

**Play Store.** `play_store_assets/` holds the listing assets:
- 512 px icon
- 1024×500 feature graphic
- 7 phone screenshots
- `store_listing.md` with the listing text, the Data Safety answers and a pre-submit checklist

Build the release bundle with:

```bash
flutter build appbundle --release
```

It is written to `build/app/outputs/bundle/release/app-release.aab`. Version is `1.0.0+1`.

**Other scripts.** `node scripts/inspect_firestore.js` (read-only) lists every collection and its field shapes. `node scripts/sanity_check.js` prints the rules, auth config and document counts.

## Tested on the emulator (2026-10-18)

| Area | What was tested | Result |
|---|---|---|
| Customer | OTP login → profile setup → raise a service request → see it listed | Pass |
| Staff | Login → attendance → enquiries list and create → customers list and register → quick quote saved as `SHC-Q-xxxx` → logout | Pass |
| Public | Lead form create, which needs no login | Pass |

All test data was deleted afterwards.

## Known gaps

- **Staff passwords are publicly readable.** The live rules allow `staff` read access to anyone, and the website stores staff passwords in plain text there. Its sales portal logs in that way, so tightening the rule needs a matching change on the website. Don't tighten it from here alone.
- **Privacy policy.** The policy at https://shivconstruction-liart.vercel.app/privacy only covers the website. Add an app section before submitting to Play: phone number, staff location, KYC documents and account deletion. See `play_store_assets/store_listing.md`.
- **Quotation PDF signature.** The PDF prints a blank signatory space. Add the signature as `assets/images/shivconstructionsign.png` and it is picked up automatically.
- **iOS and web are not registered** on ad026 (see Platform status above).

## Verify

```bash
flutter analyze
flutter test
flutter build apk --debug
```

`test/quotation_pdf_test.dart` generates a sample quotation PDF. To write it to disk for inspection, set the `QUOTE_PDF_OUT` environment variable to an output path.
