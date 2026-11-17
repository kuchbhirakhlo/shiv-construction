require('dns').setDefaultResultOrder('ipv4first');
/**
 * Adds the `counters` rule to the Firestore rules CURRENTLY DEPLOYED on the
 * project, without touching anything else. The admin panel allocates employee
 * IDs via counters/staffId_<code> and quotation numbers via counters/quotationCounter;
 * without this block every such read/write is default-deny.
 *
 * Run:  node scripts/add_counters_rule.js          (dry run)
 *       node scripts/add_counters_rule.js --apply
 */
const { GoogleAuth } = require('google-auth-library');
const sa = require('./serviceAccountKey.json');

const PROJECT_ID = sa.project_id;
const APPLY = process.argv.includes('--apply');

const BLOCK = `
    // Sequential IDs for quotations and staff — admin panel (Firebase Auth).
    match /counters/{document} {
      allow read, write: if request.auth != null && request.auth.token.email != null;
    }
`;

(async () => {
  const client = await new GoogleAuth({
    credentials: sa,
    scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/firebase'],
  }).getClient();

  const rel = (await client.request({
    url: `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/releases/cloud.firestore`,
  })).data;
  const rs = (await client.request({ url: `https://firebaserules.googleapis.com/v1/${rel.rulesetName}` })).data;
  const file = rs.source.files[0];
  const live = file.content;
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Live ruleset: ${rel.rulesetName}  (${live.length} chars)`);

  if (/match\s+\/counters\//.test(live)) {
    console.log('counters is already covered by the live rules - nothing to do.');
    return;
  }

  const idx = live.lastIndexOf('}', live.lastIndexOf('}') - 1);
  if (idx === -1) throw new Error('Could not locate the end of the documents block');
  const updated = live.slice(0, idx) + BLOCK + live.slice(idx);

  console.log('\n--- block that will be added ---' + BLOCK + '--------------------------------');
  console.log(`New ruleset size: ${updated.length} chars (+${updated.length - live.length}).`);
  const matches = (src) => (src.match(/match\s+\/[^\s{]+/g) || []).sort();
  const before = matches(live), after = matches(updated);
  console.log(`match blocks before: ${before.length}, after: ${after.length}`);
  const missing = before.filter((m) => !after.includes(m));
  if (missing.length) throw new Error('Refusing to publish: lost blocks ' + missing.join(', '));

  if (!APPLY) {
    console.log('\nDry run only. Re-run with --apply to publish.');
    return;
  }

  const created = (await client.request({
    url: `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/rulesets`,
    method: 'POST',
    data: { source: { files: [{ name: file.name, content: updated }] } },
  })).data;
  await client.request({
    url: `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/releases/cloud.firestore`,
    method: 'PATCH',
    data: { release: { name: `projects/${PROJECT_ID}/releases/cloud.firestore`, rulesetName: created.name } },
  });
  console.log('\nPublished:', created.name);
})().catch((e) => {
  console.error('FAILED:', e.response ? JSON.stringify(e.response.data) : e);
  process.exit(1);
});