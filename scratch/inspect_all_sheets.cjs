const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function main() {
  const serviceContent = fs.readFileSync('src/services/supabaseService.ts', 'utf8');
  const urlMatch = serviceContent.match(/SUPABASE_URL = '([^']+)'/);
  const keyMatch = serviceContent.match(/SUPABASE_ANON_KEY = '([^']+)'/);
  const client = createClient(urlMatch[1], keyMatch[1]);

  const { data: sheets } = await client.from('scoresheets').select('*').order('match_id');
  sheets.forEach(s => {
    const goalsCount = s.goals ? s.goals.length : 0;
    console.log(`Match: ${s.match_id.padEnd(6)} | has_scoresheet: ${s.has_scoresheet} | goals: ${goalsCount} | updated_at: ${s.updated_at}`);
  });
}

main();
