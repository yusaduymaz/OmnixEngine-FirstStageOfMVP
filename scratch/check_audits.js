
const { createClient } = require('@supabase/supabase-js');

const url = 'https://qpvkchohjvrziyvcbcwy.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdmtjaG9oanZyeml5dmNiY3d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ3MTM4NSwiZXhwIjoyMDkxMDQ3Mzg1fQ._zVT6OHbYPXr4KEJWtKbq55M9XpDd2ZqpeAwpTo8rII';

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
