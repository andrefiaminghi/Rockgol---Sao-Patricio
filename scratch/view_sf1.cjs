const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function main() {
  const serviceContent = fs.readFileSync('src/services/supabaseService.ts', 'utf8');
  const urlMatch = serviceContent.match(/SUPABASE_URL = '([^']+)'/);
  const keyMatch = serviceContent.match(/SUPABASE_ANON_KEY = '([^']+)'/);
  const client = createClient(urlMatch[1], keyMatch[1]);

  const { data: sheet } = await client.from('scoresheets').select('*').eq('match_id', 'sf1').single();
  console.log('SF1 no Supabase:', JSON.stringify(sheet, null, 2));
}

main();
