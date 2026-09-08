import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import {
  getStoredProfileImage,
  removeLegacyProfileImage,
  removeStoredProfileImage,
  saveProfileImage
} from "@/lib/profile-images";

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileImage = await getStoredProfileImage(currentUser.id);

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

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Profile picture file is required." }, { status: 400 });
    }

    const current = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { profileImageUrl: true }
    });

    const profileImageUrl = await saveProfileImage(currentUser.id, file);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { profileImageUrl }
    });

    await removeLegacyProfileImage(current?.profileImageUrl);

    const response = NextResponse.json({ profileImageUrl });
    const sessionToken = await createSessionToken({
      userId: currentUser.id,
      email: currentUser.email,
      fullName: currentUser.fullName,
      sessionVersion: currentUser.sessionVersion,
      onboardingCompleted: currentUser.onboardingCompleted,
      profileImageUrl
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to upload profile picture." }, { status: 400 });
  }
}

export async function DELETE() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { profileImageUrl: true }
  });

  await Promise.all([removeStoredProfileImage(currentUser.id), removeLegacyProfileImage(user?.profileImageUrl)]);

  await prisma.user.update({
    where: { id: currentUser.id },
    data: { profileImageUrl: null }
  });

  const response = NextResponse.json({ ok: true, profileImageUrl: "" });
  const sessionToken = await createSessionToken({
    userId: currentUser.id,
    email: currentUser.email,
    fullName: currentUser.fullName,
    sessionVersion: currentUser.sessionVersion,
    onboardingCompleted: currentUser.onboardingCompleted,
    profileImageUrl: null
  });

  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });

  return response;
}
