import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

import webPush from "web-push";

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY!;

webPush.setVapidDetails('mailto:rachaenlee@gmail.com', publicVapidKey, privateVapidKey);

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
      console.log('subscription', subscription);
      await webPush.sendNotification(subscription, JSON.stringify(notificationPayload));
      return NextResponse.json({ message: 'success' }, { status: 200 });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
