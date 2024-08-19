import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

import webPush from "web-push";

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY!;

webPush.setVapidDetails('mailto:mnmhb64@gmail.com', publicVapidKey, privateVapidKey);

interface SubscriptionType {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };

export async function POST(req: NextRequest) {

  try {
    const { id } = await req.json();
    const supabase = createClient(true);

    const { data: subscription, error } = await supabase.from('user').select('subscription').eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ message: error.message }, { status: 400 });
    } else {
      const notificationPayload = {
        title: 'Hello from PWA',
        body: 'This is a test push notification',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-192x192.png',
      };
      const rawSubscription = subscription[0].subscription;

      // 데이터가 PushSubscription 타입에 부합하는지 확인합니다.
      const pushSubscription: SubscriptionType = {
        endpoint: rawSubscription.endpoint,
        keys: {
          p256dh: rawSubscription.keys.p256dh,
          auth: rawSubscription.keys.auth,
        },
      };
        
        console.log('subscription', subscription);
        await webPush.sendNotification(pushSubscription, JSON.stringify(notificationPayload));
        return NextResponse.json({ message: 'success' }, { status: 200 });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
