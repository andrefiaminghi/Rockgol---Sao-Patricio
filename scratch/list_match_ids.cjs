const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function main() {
  const serviceContent = fs.readFileSync('src/services/supabaseService.ts', 'utf8');
  const urlMatch = serviceContent.match(/SUPABASE_URL = '([^']+)'/);
  const keyMatch = serviceContent.match(/SUPABASE_ANON_KEY = '([^']+)'/);
  const client = createClient(urlMatch[1], keyMatch[1]);

  const { data: sheets } = await client.from('scoresheets').select('match_id, has_scoresheet, updated_at');
  console.log('Total de registros:', sheets ? sheets.length : 0);
  console.log('Match IDs no Supabase:', sheets ? sheets.map(s => s.match_id) : []);
}

main();
