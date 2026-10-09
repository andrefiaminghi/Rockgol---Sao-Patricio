const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function main() {
  const serviceContent = fs.readFileSync('src/services/supabaseService.ts', 'utf8');
  const urlMatch = serviceContent.match(/SUPABASE_URL = '([^']+)'/);
  const keyMatch = serviceContent.match(/SUPABASE_ANON_KEY = '([^']+)'/);
  const client = createClient(urlMatch[1], keyMatch[1]);

  console.log('Tentando deletar sf1...');
  const { data, error } = await client.from('scoresheets').delete().eq('match_id', 'sf1').select();
  console.log('Error:', error);
  console.log('Deleted rows:', data);
}

main();
