/**
 * Read-only: lists every top-level Firestore collection with its doc count
 * and the union of field names/types seen (plus one sample doc id), and
 * saves the currently deployed Firestore rules to live_firestore.rules.
 * Makes no writes to Firebase.
 *
 * Run: node scripts/inspect_firestore.js
 */
require('dns').setDefaultResultOrder('ipv4first');
const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { GoogleAuth } = require('google-auth-library');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

function typeOf(v) {
  if (v === null) return 'null';
  if (v instanceof Timestamp) return 'timestamp';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}

async function main() {
  const cols = await db.listCollections();
  for (const col of cols) {
    const snap = await col.get();
    const fields = {};
    snap.docs.forEach((d) => {
      Object.entries(d.data()).forEach(([k, v]) => {
        fields[k] = fields[k] || new Set();
        fields[k].add(typeOf(v));
      });
    });
    console.log(`\n## ${col.id} (${snap.size} docs)${snap.size ? ' e.g. ' + snap.docs[0].id : ''}`);
    console.log(
      Object.entries(fields)
        .map(([k, t]) => `${k}:${[...t].join('|')}`)
        .sort()
        .join(', '),
    );
  }

  const gAuth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await gAuth.getClient();
  const rel = await client.request({
    url: `https://firebaserules.googleapis.com/v1/projects/${serviceAccount.project_id}/releases/cloud.firestore`,
  });
  const rs = await client.request({ url: `https://firebaserules.googleapis.com/v1/${rel.data.rulesetName}` });
  const out = path.join(__dirname, 'live_firestore.rules');
  fs.writeFileSync(out, rs.data.source.files[0].content);
  console.log(`\nLive rules saved to ${out} (ruleset ${rel.data.rulesetName}, released ${rel.data.updateTime})`);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
