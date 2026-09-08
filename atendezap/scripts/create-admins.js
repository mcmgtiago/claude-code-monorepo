// Cria/atualiza as contas super_admin do VeloHUB.
// Uso: ADMIN_PWD='senha' bun scripts/create-admins.js
// As credenciais do Supabase vêm do .env (carregado automaticamente pelo Bun).
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.ADMIN_PWD;

if (!url || !serviceKey) { console.error("Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no .env"); process.exit(1); }
if (!password) { console.error("Passe a senha: ADMIN_PWD='...' bun scripts/create-admins.js"); process.exit(1); }

const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

const EMAILS = [
  "mcmgtiago@gmail.com",
  "veloadmin@velocitycompany.com.br",
  "tiagoadmin@velocitycompany.com.br",
  "tiagomartins@velocitycompany.com.br",
];

async function findUserId(email) {
  // 1) via tabela profiles (email -> user_id)
  const { data: prof } = await admin.from("profiles").select("user_id").eq("email", email).maybeSingle();
  if (prof?.user_id) return prof.user_id;
  // 2) varre auth.users paginado
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) break;
    const hit = (data?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === email.toLowerCase());
    if (hit) return hit.id;
    if (!data?.users?.length || data.users.length < 200) break;
  }
  return null;
}

for (const email of EMAILS) {
  const username = email.split("@")[0].toLowerCase(); // veloadmin, tiagoadmin, mcmgtiago...
  let userId = await findUserId(email);

  if (userId) {
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password, email_confirm: true, user_metadata: { username },
    });
    if (error) { console.error(`✗ ${email}: ${error.message}`); continue; }
    console.log(`↻ ${email} (usuário: ${username}) — atualizado`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { username },
    });
    if (error || !data.user) { console.error(`✗ ${email}: ${error?.message}`); continue; }
    userId = data.user.id;
    console.log(`✓ ${email} (usuário: ${username}) — criado`);
  }

  // Grava username em profiles (coluna pode não existir ainda — tenta com, senão sem)
  const { error: upErr } = await admin.from("profiles").upsert({ user_id: userId, email, username }, { onConflict: "user_id" });
  if (upErr) await admin.from("profiles").upsert({ user_id: userId, email }, { onConflict: "user_id" });
  await admin.from("user_roles").upsert({ user_id: userId, role: "super_admin" }, { onConflict: "user_id,role" });
}

// Registra todos como super admin no app_config
const { error: cfgErr } = await admin.from("app_config").upsert({ id: true, super_admin_emails: EMAILS });
if (cfgErr) console.error(`app_config: ${cfgErr.message}`);
else console.log(`\nsuper_admin_emails atualizado: ${EMAILS.join(", ")}`);

console.log("\nPronto. Logins habilitados como super admin.");
