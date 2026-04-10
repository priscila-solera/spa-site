/**
 * Patch all services with therapistBooking array based on their duration.
 * Run: node scripts/patch-therapists.mjs
 */

const TOKEN = process.env.SANITY_TOKEN; // Set via: SANITY_TOKEN=xxx node scripts/patch-therapists.mjs
const PROJECT_ID = 'du617ir5';
const DATASET = 'production';

// Therapist Sanity IDs
const THERAPISTS = {
  yalile:    'f5b2c8f6-135f-4e52-a269-1c659e538bdd',
  alina:     'dc763cfe-3d39-47ca-bc74-8b6270c1c52a',
  jaqueline: '8f463d9c-0271-45dd-9d8a-a3bd29ff0af7',
  priscila:  '7d7070e3-9c4f-4768-a949-b02a8c339caa',
};

// Parse duration string → minutes
function parseDuration(str) {
  if (!str) return null;
  const s = str.replace(/\s/g, '').toLowerCase();
  // e.g. "1h&40min", "90min", "2h", "30min"
  const hoursMatch = s.match(/(\d+)h/);
  const minsMatch  = s.match(/(\d+)min/);
  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const mins  = minsMatch  ? parseInt(minsMatch[1])  : 0;
  return hours * 60 + mins || null;
}

// Build therapistBooking array for a given duration in minutes
function buildBooking(minutes) {
  const names = ['yalile', 'alina', 'jaqueline', 'priscila'];
  return names.map((name) => ({
    _key: name,
    _type: 'object',
    therapist: { _type: 'reference', _ref: THERAPISTS[name] },
    calLink: `/blue-royale-spa/appointment-with-${name}-${minutes}`,
  }));
}

async function main() {
  // 1. Fetch all services (exclude drafts)
  const query = encodeURIComponent(`*[_type=='service' && !(_id in path('drafts.**'))]{_id,duration}`);
  const res = await fetch(
    `https://${PROJECT_ID}.api.sanity.io/v2023-08-01/data/query/${DATASET}?query=${query}`,
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  );
  const { result: services } = await res.json();

  console.log(`Found ${services.length} services`);

  // 2. Build mutations
  const mutations = [];
  const skipped = [];

  for (const svc of services) {
    const minutes = parseDuration(svc.duration);
    if (!minutes) {
      skipped.push({ id: svc._id, duration: svc.duration });
      continue;
    }
    mutations.push({
      patch: {
        id: svc._id,
        set: { therapistBooking: buildBooking(minutes) },
      },
    });
  }

  if (skipped.length) {
    console.log('\nSkipped (could not parse duration):');
    skipped.forEach(s => console.log(` - ${s.id}: "${s.duration}"`));
  }

  console.log(`\nPatching ${mutations.length} services...`);

  // 3. Send mutations in batches of 20
  const BATCH = 20;
  for (let i = 0; i < mutations.length; i += BATCH) {
    const batch = mutations.slice(i, i + BATCH);
    const r = await fetch(
      `https://${PROJECT_ID}.api.sanity.io/v2023-08-01/data/mutate/${DATASET}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mutations: batch }),
      }
    );
    const json = await r.json();
    if (!r.ok) {
      console.error('Error in batch:', JSON.stringify(json, null, 2));
    } else {
      console.log(`Batch ${Math.floor(i / BATCH) + 1}: ${batch.length} services updated ✓`);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
