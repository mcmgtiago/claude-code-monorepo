import { z } from "zod";
import {
  parseDisplayedPeopleFieldIds,
  parsePeopleFieldDefinitions,
  serializeDisplayedPeopleFieldIds,
  serializePeopleFieldDefinitions
} from "@/lib/people-fields";
import {
  getUserPeopleFieldPrefs,
  getWorkspacePeopleFieldsJson,
  saveUserPeopleFieldPrefs,
  saveWorkspacePeopleFieldsJson
} from "@/lib/people-field-storage";
import { requireWorkspaceContext } from "@/lib/workspace";

const peopleFieldTypeSchema = z.enum([
  "singleLineText",
  "multiLineText",
  "number",
  "singleSelect",
  "multiPicklist",
  "date",
  "dateTime",
  "checkbox",
  "userLookup"
]);

const peopleFieldDefinitionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: peopleFieldTypeSchema,
  scope: z.enum(["global", "private"]).optional(),
  builtIn: z.boolean().optional(),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional()
});

const fieldPreferencesSchema = z.object({
  globalFields: z.array(peopleFieldDefinitionSchema).optional(),
  privateFields: z.array(peopleFieldDefinitionSchema).optional(),
  displayedFieldIds: z.array(z.string()).optional()
});

export async function GET() {
  const { user, workspace } = await requireWorkspaceContext();

  const [workspacePeopleFieldsJson, currentUser] = await Promise.all([
    getWorkspacePeopleFieldsJson(workspace.id),
    getUserPeopleFieldPrefs(user.id)
  ]);

  return Response.json({
    globalFields: parsePeopleFieldDefinitions(workspacePeopleFieldsJson),
    privateFields: parsePeopleFieldDefinitions(currentUser?.peoplePrivateFieldsJson || null),
    displayedFieldIds: parseDisplayedPeopleFieldIds(currentUser?.peopleDisplayedFieldsJson || null)
  });
}

export async function PUT(request: Request) {
  try {
    const { user, workspace } = await requireWorkspaceContext();
    const payload = fieldPreferencesSchema.parse(await request.json());

    const globalFields = payload.globalFields ? parsePeopleFieldDefinitions(JSON.stringify(payload.globalFields)) : undefined;
    const privateFields = payload.privateFields ? parsePeopleFieldDefinitions(JSON.stringify(payload.privateFields)) : undefined;
    const displayedFieldIds = payload.displayedFieldIds ? parseDisplayedPeopleFieldIds(JSON.stringify(payload.displayedFieldIds)) : undefined;

    if (globalFields !== undefined) {
      await saveWorkspacePeopleFieldsJson(workspace.id, serializePeopleFieldDefinitions(globalFields));
    }

    if (privateFields !== undefined || displayedFieldIds !== undefined) {
      await saveUserPeopleFieldPrefs(user.id, {
        ...(privateFields !== undefined ? { peoplePrivateFieldsJson: serializePeopleFieldDefinitions(privateFields) } : {}),
        ...(displayedFieldIds !== undefined ? { peopleDisplayedFieldsJson: serializeDisplayedPeopleFieldIds(displayedFieldIds) } : {})
      });
    }

    return Response.json({
      globalFields: globalFields ?? [],
      privateFields: privateFields ?? [],
      displayedFieldIds: displayedFieldIds ?? []
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid people field preferences", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to save field preferences" }, { status: 500 });
  }
}
