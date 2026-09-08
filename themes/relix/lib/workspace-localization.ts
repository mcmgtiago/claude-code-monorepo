import "server-only";

import { cache } from "react";
import { getCurrentUser } from "@/lib/auth-server";
import { normalizeLocalizationSettings } from "@/lib/localization";
import { prisma } from "@/lib/prisma";

export const getWorkspaceLocalizationSettings = cache(async () => {
  const currentUser = await getCurrentUser();
  const settings = currentUser?.workspaceId
    ? await prisma.workspaceSetting.findFirst({
        where: { workspaceId: currentUser.workspaceId },
        select: {
          countryCode: true,
          timezone: true,
          currencyCode: true,
          locale: true,
          dateFormat: true,
          timeFormat: true,
          weekStartsOn: true
        }
      })
    : null;

  return normalizeLocalizationSettings(settings);
});
