require('dns').setDefaultResultOrder('ipv4first');
/**
 * Registers the local debug keystore's SHA-1/SHA-256 fingerprints against the
 * Android app in Firebase — needed for Phone Auth's Play-Integrity-based
 * silent verification (without this, Android falls back to a reCAPTCHA flow).
 * Safe to re-run (Firebase de-dupes identical fingerprints).
 *
 * Run: node scripts/register_sha.js
 */
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

const PROJECT_ID = 'shivconstruction-ad026';
// The Android app under ad026 (matches android/app/google-services.json).
const ANDROID_APP_ID = '1:1080264611967:android:b11e56675b066d0b4c074a';

const FINGERPRINTS = [
  // Debug keystore (%USERPROFILE%\.android\debug.keystore) — local dev builds.
  { sha: '95F7E024BFA8242DEBDC5DF65C4C601F8E6EB237', type: 'SHA_1' },
  { sha: '8C4F6A4EC39452B594A10FF3EA9190EC62A99A8C85EA467A587B95C2DF4B41E6', type: 'SHA_256' },
  // Release/upload keystore (android/app/upload-keystore.jks, alias
  // shivconstruction-upload, CN=Shiv Construction) — generated 2026-10-19.
  { sha: 'A4709D076257F29E3BCA13EC69583DEFDE9550A4', type: 'SHA_1' },
  { sha: '2C88B021D34E15B43256273A47104C937EF1095A58055260F5734CAE04D83BB7', type: 'SHA_256' },
];

async function main() {
  const auth = new GoogleAuth({
    keyFile: path.join(__dirname, 'serviceAccountKey.json'),
    scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/firebase'],
  });
  const client = await auth.getClient();
  const base = `https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}/androidApps/${ANDROID_APP_ID}`;

  const existing = await client.request({ url: `${base}/sha` });
  console.log('Existing fingerprints:', JSON.stringify(existing.data));

  for (const fp of FINGERPRINTS) {
    const already = (existing.data.certificates || []).some(
      (c) => c.shaHash.toUpperCase() === fp.sha.toUpperCase()
    );
    if (already) {
      console.log(`Already registered: ${fp.type} ${fp.sha}`);
      continue;
    }
    const res = await client.request({
      url: `${base}/sha`,
      method: 'POST',
      data: { shaHash: fp.sha, certType: fp.type },
    });
    console.log(`Registered ${fp.type}:`, JSON.stringify(res.data));
  }
}

main().catch((err) => {
  console.error('register_sha failed:', err.response ? JSON.stringify(err.response.data) : err);
  process.exit(1);
});
