
/**
 * Bu scripti çalıştırmak için: 
 * node --env-file=.env.local scratch/check_audits.js
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Hata: NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY environment variable olarak bulunamadı!');
  console.error('Çalıştırmak için: node --env-file=.env.local scratch/check_audits.js');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function checkAudits() {
  console.log('--- AUDIT CHECK START ---');

  // 1. All Audits
  const { data: audits, error: auditErr } = await supabase
    .from('audits')
    .select('id, user_id, product_name, created_at')
    .order('created_at', { ascending: false });

  if (auditErr) {
    console.error('Audit Fetch Error:', auditErr);
    return;
  }

  console.log(`Total audits found: ${audits.length}`);
  audits.forEach(a => {
    console.log(`Audit: ${a.product_name} | ID: ${a.id} | UserID: ${a.user_id}`);
  });

  // 2. All Users
  const { data: users, error: userErr } = await supabase
    .from('users')
    .select('id, clerk_id, email');

  if (userErr) {
    console.error('User Fetch Error:', userErr);
    return;
  }

  console.log(`Total users found: ${users.length}`);
  users.forEach(u => {
    console.log(`User: ${u.email} | UUID: ${u.id} | ClerkID: ${u.clerk_id}`);
  });

  console.log('--- AUDIT CHECK END ---');
}

checkAudits();
