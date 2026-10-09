const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function main() {
  const serviceContent = fs.readFileSync('src/services/supabaseService.ts', 'utf8');
  const urlMatch = serviceContent.match(/SUPABASE_URL = '([^']+)'/);
  const keyMatch = serviceContent.match(/SUPABASE_ANON_KEY = '([^']+)'/);
  const client = createClient(urlMatch[1], keyMatch[1]);

  const { data: sheets } = await client.from('scoresheets').select('match_id, has_scoresheet, updated_at').order('updated_at', { ascending: false });
  console.log('Súmulas ordenadas por updated_at:');
  sheets.forEach(s => console.log(`${s.match_id}: ${s.updated_at}`));
}

main();
