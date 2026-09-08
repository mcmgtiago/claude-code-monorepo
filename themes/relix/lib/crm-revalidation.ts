import { revalidatePath } from "next/cache";

const crmDataPaths = [
  "/",
  "/analytics",
  "/companies",
  "/contacts",
  "/leads",
  "/pipeline",
  "/tasks"
];

export function revalidateCrmDataPaths(...extraPaths: string[]) {
  for (const path of [...crmDataPaths, ...extraPaths]) {
    if (!path) {
      continue;
    }

    revalidatePath(path);
  }
}
