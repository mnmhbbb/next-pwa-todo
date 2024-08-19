import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

import webPush from "web-push";

const subject = "https://next-pwa-todo.vercel.app";
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY!;

webPush.setVapidDetails(subject, publicVapidKey, privateVapidKey);

interface PushSubscriptionType {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime: null;
}

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    const supabase = createClient(true);

    const { data: subscription, error } = await supabase.from("user").select("pushSubscription").eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ message: error.message }, { status: 400 });
    } else {
      const notificationPayload = {
        title: "Hello from PWA",
        body: "This is a test push notification",
        icon: "/assets/icons/icon-192x192.png",
        badge: "/assets/icons/icon-192x192.png",
      };

      const rawPushSubscription = JSON.parse(subscription?.[0].pushSubscription);

      const pushSubscription: PushSubscriptionType = {
        endpoint: rawPushSubscription.endpoint,
        keys: {
          p256dh: rawPushSubscription.keys.p256dh,
          auth: rawPushSubscription.keys.auth,
        },
        expirationTime: null,
      };

      await webPush.sendNotification(pushSubscription, JSON.stringify(notificationPayload));
      return NextResponse.json({ message: "success" }, { status: 200 });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}
