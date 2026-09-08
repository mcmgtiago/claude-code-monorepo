import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { getStoredProfileImage } from "@/lib/profile-images";
import { canAccessSuperuser } from "@/lib/team";

export async function GET(_request: Request, context: { params: Promise<{ userId: string }> }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await context.params;
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      workspaceId: true,
      workspaceMemberships: {
        where: { workspaceId: currentUser.workspaceId || "__none__" },
        select: { workspaceId: true },
        take: 1
      }
    }
  });

  const canReadPhoto =
    canAccessSuperuser(currentUser.accessRole) ||
    targetUser?.id === currentUser.id ||
    (currentUser.workspaceId &&
      (targetUser?.workspaceId === currentUser.workspaceId || Boolean(targetUser?.workspaceMemberships.length)));

  if (!canReadPhoto) {
    return NextResponse.json({ error: "Profile picture not found." }, { status: 404 });
  }

  const profileImage = await getStoredProfileImage(userId);

  if (!profileImage) {
    return NextResponse.json({ error: "Profile picture not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(profileImage.data), {
    headers: {
      "content-type": profileImage.mimeType,
      "content-length": String(profileImage.sizeBytes),
      "content-disposition": `inline; filename="${profileImage.fileName}"`,
      "cache-control": "private, no-store, max-age=0"
    }
  });
}
