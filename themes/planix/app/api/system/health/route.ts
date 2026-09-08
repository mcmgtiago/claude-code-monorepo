import { NextResponse } from "next/server";

import { checkDatabaseConnection } from "@/lib/db";
import { verifyMailerConnection } from "@/lib/mailer";

export async function GET() {
  const [database, smtp] = await Promise.allSettled([
    checkDatabaseConnection(),
    verifyMailerConnection(),
  ]);

  const body = {
    ok: database.status === "fulfilled" && smtp.status === "fulfilled",
    database:
      database.status === "fulfilled"
        ? {
            ok: true,
            database: database.value.current_database,
            user: database.value.current_user,
            checkedAt: database.value.now,
          }
        : {
            ok: false,
            error: database.reason instanceof Error ? database.reason.message : "Unknown database error",
          },
    smtp:
      smtp.status === "fulfilled"
        ? {
            ok: true,
            ...smtp.value,
          }
        : {
            ok: false,
            error: smtp.reason instanceof Error ? smtp.reason.message : "Unknown SMTP error",
          },
  };

  return NextResponse.json(body, { status: body.ok ? 200 : 503 });
}
