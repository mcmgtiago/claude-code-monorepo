import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

type UserPeopleFieldPrefsRow = {
  peoplePrivateFieldsJson: string | null;
  peopleDisplayedFieldsJson: string | null;
};

type WorkspacePeopleFieldsRow = {
  peopleFieldsJson: string | null;
};

type ContactCustomFieldRow = {
  id: string;
  customFieldsJson: string | null;
};

export async function getWorkspacePeopleFieldsJson(workspaceId: string) {
  const rows = await prisma.$queryRaw<WorkspacePeopleFieldsRow[]>`
    SELECT "peopleFieldsJson"
    FROM "WorkspaceSetting"
    WHERE "workspaceId" = ${workspaceId}
    LIMIT 1
  `;

  return rows[0]?.peopleFieldsJson || null;
}

export async function getUserPeopleFieldPrefs(userId: string) {
  const rows = await prisma.$queryRaw<UserPeopleFieldPrefsRow[]>`
    SELECT "peoplePrivateFieldsJson", "peopleDisplayedFieldsJson"
    FROM "User"
    WHERE "id" = ${userId}
    LIMIT 1
  `;

  return {
    peoplePrivateFieldsJson: rows[0]?.peoplePrivateFieldsJson || null,
    peopleDisplayedFieldsJson: rows[0]?.peopleDisplayedFieldsJson || null
  };
}

export async function saveWorkspacePeopleFieldsJson(workspaceId: string, peopleFieldsJson: string | null) {
  const id = randomUUID();

  await prisma.$executeRaw`
    INSERT INTO "WorkspaceSetting" ("id", "workspaceId", "peopleFieldsJson", "createdAt", "updatedAt")
    VALUES (${id}, ${workspaceId}, ${peopleFieldsJson}, NOW(), NOW())
    ON CONFLICT ("workspaceId")
    DO UPDATE SET
      "peopleFieldsJson" = EXCLUDED."peopleFieldsJson",
      "updatedAt" = NOW()
  `;
}

export async function saveUserPeopleFieldPrefs(
  userId: string,
  values: {
    peoplePrivateFieldsJson?: string | null;
    peopleDisplayedFieldsJson?: string | null;
  }
) {
  if (values.peoplePrivateFieldsJson !== undefined) {
    await prisma.$executeRaw`
      UPDATE "User"
      SET "peoplePrivateFieldsJson" = ${values.peoplePrivateFieldsJson},
          "updatedAt" = NOW()
      WHERE "id" = ${userId}
    `;
  }

  if (values.peopleDisplayedFieldsJson !== undefined) {
    await prisma.$executeRaw`
      UPDATE "User"
      SET "peopleDisplayedFieldsJson" = ${values.peopleDisplayedFieldsJson},
          "updatedAt" = NOW()
      WHERE "id" = ${userId}
    `;
  }
}

export async function getContactCustomFieldsJsonByIds(contactIds: string[]) {
  if (!contactIds.length) {
    return new Map<string, string | null>();
  }

  const rows = await prisma.$queryRaw<ContactCustomFieldRow[]>`
    SELECT "id", "customFieldsJson"
    FROM "Contact"
    WHERE "id" IN (${Prisma.join(contactIds)})
  `;

  return new Map(rows.map((row) => [row.id, row.customFieldsJson]));
}

export async function saveContactCustomFieldsJson(contactId: string, customFieldsJson: string | null) {
  await prisma.$executeRaw`
    UPDATE "Contact"
    SET "customFieldsJson" = ${customFieldsJson},
        "updatedAt" = NOW()
    WHERE "id" = ${contactId}
  `;
}

export async function getContactCustomFieldsJson(contactId: string) {
  const rows = await prisma.$queryRaw<ContactCustomFieldRow[]>`
    SELECT "id", "customFieldsJson"
    FROM "Contact"
    WHERE "id" = ${contactId}
    LIMIT 1
  `;

  return rows[0]?.customFieldsJson || null;
}
