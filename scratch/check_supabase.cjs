const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ihegprwkrmybdrpgodnf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZWdwcndrcm15YmRycGdvZG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjg3MzAsImV4cCI6MjA3NTYwNDczMH0.k1k0sV6T2pYvjL10L4pQo0L10L4pQo0L10L4pQo0L10';

async function main() {
  // Vamos buscar a anon key real do projeto em src/services/supabaseService.ts
  const fs = require('fs');
  const serviceContent = fs.readFileSync('src/services/supabaseService.ts', 'utf8');
  const keyMatch = serviceContent.match(/SUPABASE_ANON_KEY = '([^']+)'/);
  const realKey = keyMatch ? keyMatch[1] : supabaseKey;

  const client = createClient(supabaseUrl, realKey);
  const { data: sheets, error: sheetsErr } = await client.from('scoresheets').select('*');
  console.log('--- SCORESHEETS NO SUPABASE ---');
  if (sheetsErr) {
    console.error('Erro:', sheetsErr);
  } else {
    console.log(JSON.stringify(sheets, null, 2));
  }
}

main();
