import process from "node:process";

import { createClient } from "@supabase/supabase-js";
import pg from "pg";

const { Client } = pg;

const email = process.env.DEMO_USER_EMAIL?.trim() || "demo@planique.app";
const password = process.env.DEMO_USER_PASSWORD?.trim() || "PlaniqueDemo@123";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const databaseUrl = process.env.DATABASE_URL?.trim();

if (!supabaseUrl || !serviceRoleKey || !databaseUrl) {
  throw new Error("Missing required env for demo user creation.");
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const client = new Client({
  connectionString: databaseUrl,
});

async function main() {
  try {
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listError) {
      throw listError;
    }

    let user = usersData.users.find((entry) => entry.email?.toLowerCase() === email);

    if (!user) {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: "Demo",
          last_name: "User",
          full_name: "Demo User",
          phone: "",
        },
      });

      if (error) {
        throw error;
      }

      user = data.user;
      console.log("Created demo auth user");
    } else {
      const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
        password,
        email_confirm: true,
        user_metadata: {
          first_name: "Demo",
          last_name: "User",
          full_name: "Demo User",
          phone: "",
        },
      });

      if (error) {
        throw error;
      }

      user = data.user;
      console.log("Updated existing demo auth user");
    }

    if (!user) {
      throw new Error("Demo user could not be created.");
    }

    await client.connect();
    await client.query("begin");

    await client.query(
      `
        insert into public.user_profiles (id, email, first_name, last_name, full_name, phone)
        values ($1, $2, $3, $4, $5, $6)
        on conflict (id)
        do update set
          email = excluded.email,
          first_name = excluded.first_name,
          last_name = excluded.last_name,
          full_name = excluded.full_name,
          phone = excluded.phone
      `,
      [user.id, email, "Demo", "User", "Demo User", ""],
    );

    const membership = await client.query(
      `
        select workspace_id
        from public.workspace_members
        where user_id = $1
        order by created_at asc
        limit 1
      `,
      [user.id],
    );

    if (membership.rows.length === 0) {
      const workspaceName = "Demo Workspace";
      const workspaceSlug = `${slugify(workspaceName)}-${user.id.slice(0, 8)}`;
      const workspace = await client.query(
        `
          insert into public.workspaces (
            name,
            slug,
            support_email,
            timezone,
            region,
            invite_policy,
            approval_flow,
            digest,
            owner_user_id
          )
          values ($1, $2, $3, $4, $5, 'admins-only', true, true, $6)
          returning id
        `,
        [workspaceName, workspaceSlug, email, "Asia/Kolkata", "India", user.id],
      );

      await client.query(
        `
          insert into public.workspace_members (workspace_id, user_id, role, status)
          values ($1, $2, 'owner', 'active')
        `,
        [workspace.rows[0].id, user.id],
      );
    }

    await client.query("commit");

    console.log(
      JSON.stringify(
        {
          email,
          password,
          userId: user.id,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    try {
      await client.query("rollback");
    } catch {}

    throw error;
  } finally {
    try {
      await client.end();
    } catch {}
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
