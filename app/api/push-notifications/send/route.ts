import { NextRequest, NextResponse } from "next/server";

// Dynamic import to avoid build issues
let webpush: any = null;

async function getWebPush() {
  if (!webpush) {
    try {
      webpush = (await import('web-push')).default;
      
      // Configure web-push only if we have valid keys
      const publicKey = process.env.VAPID_PUBLIC_KEY;
      const privateKey = process.env.VAPID_PRIVATE_KEY;
      
      if (publicKey && privateKey && publicKey !== 'your-public-key-here' && privateKey !== 'your-private-key-here') {
        webpush.setVapidDetails(
          process.env.VAPID_SUBJECT || 'mailto:admin@mmhrm.com',
          publicKey,
          privateKey
        );
      } else {
        console.warn('VAPID keys not configured properly for push notifications');
      }
    } catch (error) {
      console.error('Failed to load web-push:', error);
      throw new Error('Push notifications not available');
    }
  }
  return webpush;
}

export async function POST(request: NextRequest) {
  try {
    const { subscription, payload } = await request.json();

    if (!subscription || !payload) {
      return NextResponse.json(
        { error: "Missing subscription or payload" },
        { status: 400 }
      );
    }

    // Check if we're in a build environment
    if (process.env.NODE_ENV === 'production' && !process.env.VAPID_PUBLIC_KEY) {
      console.log('Push notifications not configured in production');
      return NextResponse.json(
        { error: "Push notifications not configured" },
        { status: 503 }
      );
    }

    // Get webpush instance
    const webpushInstance = await getWebPush();
    
    if (!webpushInstance) {
      return NextResponse.json(
        { error: "Push notifications not available" },
        { status: 503 }
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

    await webpushInstance.sendNotification(subscription, notificationPayload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send push notification:", error);
    return NextResponse.json(
      { error: "Failed to send push notification" },
      { status: 500 }
    );
  }
}
