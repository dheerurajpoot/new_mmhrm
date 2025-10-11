import { NextRequest, NextResponse } from "next/server";
import webpush from 'web-push';

// Configure web-push
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@mmhrm.com',
  process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI8F7V1jH0nZswz6ebJOTsr6bFizAAxYtR4xkxQJ2edL9F8a8l4mUyXp4E',
  process.env.VAPID_PRIVATE_KEY || 'your-private-key-here'
);

export async function POST(request: NextRequest) {
  try {
    const { subscription, payload } = await request.json();

    if (!subscription || !payload) {
      return NextResponse.json(
        { error: "Missing subscription or payload" },
        { status: 400 }
      );
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/placeholder-logo.png',
      badge: payload.badge || '/placeholder-logo.png',
      tag: payload.tag || 'mmhrm-notification',
      url: payload.url || '/',
      type: payload.type || 'general',
      payload: payload.payload || {},
      requireInteraction: payload.requireInteraction || false
    });

    await webpush.sendNotification(subscription, notificationPayload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send push notification:", error);
    return NextResponse.json(
      { error: "Failed to send push notification" },
      { status: 500 }
    );
  }
}
