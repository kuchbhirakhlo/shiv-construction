# Play Store listing — Shiv Construction

## Files in this folder

| File | Play Console field | Spec |
|---|---|---|
| `icon-512.png` | App icon | 512×512 PNG |
| `feature-graphic-1024x500.png` | Feature graphic | 1024×500 PNG |
| `screenshots/01…07-*.png` | Phone screenshots | 1080×1920 PNG (9:16), 7 images |
| `../build/app/outputs/bundle/release/app-release.aab` | Production / testing release | Signed with the Shiv Construction upload key |

## App details

- **App name** (30 max): `Shiv Construction`
- **Package:** `com.shivconstruction.app`
- **Category:** Business
- **Contact email:** shivconstruction311@gmail.com
- **Phone:** +91 70177 25641
- **Website:** https://shivconstruction-liart.vercel.app/
- **Privacy policy URL:** https://shivconstruction-liart.vercel.app/privacy (see the note below; it needs an app section first)

### Short description (80 max)

```
Rooftop solar, smart meters & construction in Uttar Pradesh. Get a free quote.
```

### Full description

```
Shiv Construction plans and installs dependable rooftop solar systems for homes and businesses across Uttar Pradesh — from the first site visit through installation and support. MNRE & UPNEDA registered, with 13+ years of experience and 500+ installations.

SOLAR SYSTEMS
• On-Grid solar with net metering and subsidy application assistance
• Hybrid solar — solar + battery + grid, with automatic source switching
• Off-Grid solar with battery storage for sites with limited grid supply

PM SURYA GHAR SUBSIDY
Residential systems up to 10 kW can get government subsidy of up to ₹1,08,000. See turnkey 3 kW, 4 kW, 5 kW and 10 kW packages, with the price before and after subsidy.

MORE SERVICES
• Smart meter installation and upgrade consultation
• Construction projects — share your site and scope and book a consultation

FOR CUSTOMERS
• Request a free site survey and solar quote in one tap
• Log in with your mobile number (OTP) to see your installation and raise service requests
• Call or WhatsApp our team directly from the app

FOR SHIV CONSTRUCTION STAFF
• Sales staff portal: daily attendance, enquiries pipeline, customer registration with KYC documents, and instant quotation PDFs
• Engineers: assigned service requests with installation photo upload

Office: 25 near SBI Bank, Vasant Vihar, Naubasta, Near South City Public School, Kanpur 208021
Phone / WhatsApp: +91 70177 25641 · Mon–Sat 9 AM – 6 PM
```

## Before you submit

1. **Update the privacy policy.** The current `/privacy` page only describes the website. Play reviews it against what the app actually does, so add a "Mobile app" section that covers:
   - **Phone number:** customer login uses Firebase phone (OTP) authentication.
   - **Precise location (staff only):** collected while a staff member is signed in and using the app, and shared with the office for field tracking. Never collected from customers.
   - **Photos and documents:** KYC documents (PAN, Aadhaar, electricity bill, bank proof, property papers) and site or installation photos. Staff upload these, and they are stored in Google Firebase Storage.
   - **Contact details:** name, phone, email and address submitted in enquiry and quote forms.
   - **Account deletion:** how a customer or staff member requests deletion. Email shivconstruction311@gmail.com is fine. Play requires a deletion path because the app has accounts.
2. **Data safety form.** Declare the following, all **encrypted in transit** and none **shared** with third parties:

   | Data type | Purpose | Notes |
   |---|---|---|
   | Personal info: name, email, phone number, address | App functionality, Account management | |
   | Location: precise | App functionality | Staff only, optional (they can deny the permission) |
   | Photos and files | App functionality | |
   | Government IDs (PAN / Aadhaar) | App functionality | Declare under "Other info" if Play has no closer category |

3. **App access** (for the reviewer). Give Google a working staff login and the customer test number:
   - Customer: phone `9876543210`, OTP `123456`. This is a Firebase test number, so no real SMS is sent.
   - Staff: create a dedicated reviewer account in the admin panel, then run `node scripts/provision_staff_auth.js`.
4. **Content rating questionnaire:** no user-generated public content and no violence. Expected rating: Everyone.
5. **Target audience:** 18+, which keeps it out of the Families policy.
6. **Signing.** Enrol in **Play App Signing**, and upload `app-release.aab` signed with the upload key in `android/app/upload-keystore.jks`. After enrolment, copy Play's *app signing key* SHA-1 and SHA-256 into `scripts/register_sha.js` and run it. Phone OTP on Play-installed builds needs that fingerprint.
