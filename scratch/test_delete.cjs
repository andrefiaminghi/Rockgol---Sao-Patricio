const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function testDelete() {
  const serviceContent = fs.readFileSync('src/services/supabaseService.ts', 'utf8');
  const urlMatch = serviceContent.match(/SUPABASE_URL = '([^']+)'/);
  const keyMatch = serviceContent.match(/SUPABASE_ANON_KEY = '([^']+)'/);
  const client = createClient(urlMatch[1], keyMatch[1]);

  // Vamos inserir um registro de teste
  const testId = 'test_match_999';
  console.log('1. Inserindo registro de teste...');
  const { error: insertErr } = await client.from('scoresheets').upsert({
    match_id: testId,
    has_scoresheet: true,
    goals: [],
    cards: [],
    observations: 'teste',
    updated_at: new Date().toISOString()
  });
  console.log('Insert error:', insertErr);

  console.log('2. Tentando deletar registro de teste...');
  const { data: deleteData, error: deleteErr } = await client
    .from('scoresheets')
    .delete()
    .eq('match_id', testId)
    .select();

  console.log('Delete error:', deleteErr);
  console.log('Delete data:', deleteData);
}

testDelete();
