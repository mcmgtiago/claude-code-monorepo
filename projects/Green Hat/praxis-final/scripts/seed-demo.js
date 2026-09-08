const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:euamoabrenda3005@db.pxnjyarmemyelsjynvck.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();

  const adminId = '36d3eb43-a795-4ce0-a646-e98e67cf2666';
  const clientId = '963f2e85-5c14-4b64-9691-d0849f6ce634';
  const orgId = '00000000-0000-4000-8000-000000000001';

  // 1. Organização
  await client.query(
    `INSERT INTO organizations (id, slug, display_name, legal_name, status, timezone, locale, settings)
     VALUES ($1, 'dr-carlos', 'Dr. Carlos Mendes - Urologista', 'Dr. Carlos Mendes Urologia LTDA', 'active', 'America/Sao_Paulo', 'pt-BR', '{"specialty": "urologia"}')
     ON CONFLICT (id) DO NOTHING`,
    [orgId]
  );
  console.log('✅ Organização criada');

  // 2. Perfis
  await client.query(
    `INSERT INTO profiles (id, full_name) VALUES ($1, 'Admin Práxis') ON CONFLICT (id) DO UPDATE SET full_name = 'Admin Práxis'`,
    [adminId]
  );
  await client.query(
    `INSERT INTO profiles (id, full_name) VALUES ($1, 'Dr. Carlos Mendes') ON CONFLICT (id) DO UPDATE SET full_name = 'Dr. Carlos Mendes'`,
    [clientId]
  );
  console.log('✅ Perfis criados');

  // 3. Membros
  await client.query(
    `INSERT INTO organization_members (organization_id, user_id, role) VALUES ($1, $2, 'admin') ON CONFLICT DO NOTHING`,
    [orgId, adminId]
  );
  await client.query(
    `INSERT INTO organization_members (organization_id, user_id, role) VALUES ($1, $2, 'admin') ON CONFLICT DO NOTHING`,
    [orgId, clientId]
  );
  console.log('✅ Membros vinculados');

  // 4. Pipeline urologia
  const pRes = await client.query(
    `INSERT INTO crm_pipelines (organization_id, name, is_default, vocabulary)
     VALUES ($1, 'Fluxo de Atendimento', true, '{"lead":"Paciente","deal":"Consulta","won":"Atendido","lost":"Cancelado"}')
     ON CONFLICT DO NOTHING RETURNING id`,
    [orgId]
  );

  if (pRes.rows.length > 0) {
    const pid = pRes.rows[0].id;
    console.log('✅ Pipeline criado:', pid);

    const stages = [
      ['Triagem', 0.1, 'open'],
      ['Qualificado', 0.2, 'open'],
      ['Agendado', 0.3, 'open'],
      ['Confirmado', 0.4, 'open'],
      ['Atendido', 0.5, 'won'],
      ['No-show', 0.6, 'lost'],
      ['Cancelado', 0.7, 'lost'],
    ];

    for (const [name, pos, type] of stages) {
      await client.query(
        `INSERT INTO crm_stages (pipeline_id, organization_id, name, position_in_pipeline, stage_type)
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
        [pid, orgId, name, pos, type]
      );
    }
    console.log('✅ 7 stages criados');
  }

  // 5. Super admin (tenta user_roles, senão profiles.is_platform_admin)
  try {
    await client.query(
      `INSERT INTO user_roles (user_id, role) VALUES ($1, 'super_admin') ON CONFLICT DO NOTHING`,
      [adminId]
    );
    console.log('✅ Admin é super_admin (via user_roles)');
  } catch (e) {
    try {
      await client.query(`UPDATE profiles SET is_platform_admin = true WHERE id = $1`, [adminId]);
      console.log('✅ Admin é super_admin (via profiles)');
    } catch (e2) {
      console.log('⚠️ Não conseguiu setar super_admin:', e2.message);
    }
  }

  console.log('\n════════════════════════════════════');
  console.log('PRÁXIS — BANCO CONFIGURADO!');
  console.log('════════════════════════════════════');
  console.log('ADMIN:   admin@praxis.app / Praxis@2026!');
  console.log('CLIENTE: drcarlos@praxis.app / Carlos@2026!');
  console.log('ORG:     Dr. Carlos Mendes - Urologista');
  console.log('════════════════════════════════════');

  await client.end();
}

run().catch(e => { console.log('❌ Fatal:', e.message); process.exit(1); });
