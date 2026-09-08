import { NextResponse } from "next/server";

import {
  getDemoNotificationsData,
  markAllDemoNotificationsRead,
  markDemoNotificationRead,
  removeDemoNotification,
  snoozeDemoNotification,
} from "@/lib/template-demo-store";

type NotificationsPatchBody =
  | {
      action: "set-read";
      projectRef: string;
      notificationId: string;
      unread: boolean;
    }
  | {
      action: "set-snoozed";
      projectRef: string;
      notificationId: string;
      snoozed: boolean;
    }
  | {
      action: "remove";
      projectRef: string;
      notificationId: string;
    }
  | {
      action: "mark-all-read";
    };

export async function GET() {
  return NextResponse.json({ ok: true, data: getDemoNotificationsData(), mode: "remote" });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as NotificationsPatchBody;

  let data = getDemoNotificationsData();

  if (body.action === "set-read") {
    data = markDemoNotificationRead(body.projectRef, body.notificationId, body.unread);
  } else if (body.action === "set-snoozed") {
    data = snoozeDemoNotification(body.projectRef, body.notificationId, body.snoozed);
  } else if (body.action === "remove") {
    data = removeDemoNotification(body.projectRef, body.notificationId);
  } else if (body.action === "mark-all-read") {
    data = markAllDemoNotificationsRead();
  }

  return NextResponse.json({ ok: true, data, mode: "remote" });
}
