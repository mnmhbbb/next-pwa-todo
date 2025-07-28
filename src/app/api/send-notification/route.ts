import createClient from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

import webPush from "web-push";

const subject = "https://next-push-test.vercel.app";
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
    const { title, body } = await req.json();
    const supabase = createClient();

    // 현재 요청의 URL에서 origin 추출
    const origin = req.nextUrl.origin;

    const { data, error } = await supabase.from("info").select("subscription_data");

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ message: error.message }, { status: 400 });
    } else {
      const notificationPayload = {
        title,
        body,
        icon: "/assets/icons/icon-192x192.png",
        badge: "/assets/icons/icon-192x192.png",
        link: `${origin}/push`,
      };

      // 모든 구독자에게 알림 전송
      const results = [];

      for (const item of data || []) {
        try {
          const rawPushSubscription = item.subscription_data;

          const pushSubscription: PushSubscriptionType = {
            endpoint: rawPushSubscription.endpoint,
            keys: {
              p256dh: rawPushSubscription.keys.p256dh,
              auth: rawPushSubscription.keys.auth,
            },
            expirationTime: null,
          };

          await webPush.sendNotification(pushSubscription, JSON.stringify(notificationPayload));
          results.push({ success: true, endpoint: rawPushSubscription.endpoint });
        } catch (error) {
          console.error(
            `Failed to send notification to ${item.subscription_data?.endpoint}:`,
            error,
          );
          results.push({
            success: false,
            endpoint: item.subscription_data?.endpoint,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.filter((r) => !r.success).length;

      return NextResponse.json(
        {
          message: `알림 전송 완료: 성공 ${successCount}개, 실패 ${failureCount}개`,
          results,
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}
