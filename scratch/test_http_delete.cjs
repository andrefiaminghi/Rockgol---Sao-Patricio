const SUPABASE_URL = 'https://ihegprwkrmybdrpgodnf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_zHKJEkKskBcBNzbU5vwWrA_9vRfLieO';

async function testFetchDelete() {
  console.log('1. Inserindo via fetch...');
  const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/scoresheets`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      match_id: 'test_http_123',
      has_scoresheet: true,
      goals: [],
      cards: [],
      observations: 'teste fetch'
    })
  });
  console.log('Insert status:', insertRes.status);
  const insertJson = await insertRes.json();
  console.log('Insert body:', insertJson);

  console.log('2. Deletando via fetch...');
  const deleteRes = await fetch(`${SUPABASE_URL}/rest/v1/scoresheets?match_id=eq.test_http_123`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=representation'
    }
  });
  console.log('Delete status:', deleteRes.status);
  const deleteJson = await deleteRes.json();
  console.log('Delete body:', deleteJson);
}

testFetchDelete();
