import { prisma } from "@/lib/prisma";

const transparentGif = Buffer.from("R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==", "base64");

export async function GET(_request: Request, context: { params: Promise<{ trackingToken: string }> }) {
  const { trackingToken } = await context.params;

  await prisma.emailMessage.updateMany({
    where: {
      trackingToken,
      direction: "outbound",
      openedAt: null,
      bouncedAt: null
    },
    data: {
      openedAt: new Date()
    }
  });

  return new Response(transparentGif, {
    headers: {
      "content-type": "image/gif",
      "cache-control": "no-store, max-age=0"
    }
  });
}
