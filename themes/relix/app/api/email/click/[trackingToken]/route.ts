import { prisma } from "@/lib/prisma";

function safeRedirectTarget(url: string | null) {
  if (!url) {
    return null;
  }

  try {
    const target = new URL(url);
    return target.protocol === "http:" || target.protocol === "https:" ? target.toString() : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request, context: { params: Promise<{ trackingToken: string }> }) {
  const { trackingToken } = await context.params;
  const targetUrl = safeRedirectTarget(new URL(request.url).searchParams.get("url"));
  const clickedAt = new Date();

  await prisma.emailMessage.updateMany({
    where: {
      trackingToken,
      direction: "outbound",
      bouncedAt: null
    },
    data: {
      clickedAt,
      openedAt: clickedAt,
      clickCount: {
        increment: 1
      }
    }
  });

  if (!targetUrl) {
    return Response.redirect(new URL("/inbox", request.url), 302);
  }

  return Response.redirect(targetUrl, 302);
}
