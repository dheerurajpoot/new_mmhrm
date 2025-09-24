import { type NextRequest, NextResponse } from "next/server";
import { getWebsiteSettingsCollection } from "@/lib/mongodb/collections";

export async function GET(request: NextRequest) {
  try {
    const collection = await getWebsiteSettingsCollection();
    const settings = await collection.findOne({});

    // Return default settings if none exist
    const defaultSettings = {
      site_name: "MMHRM",
      site_title: "Modern HR Management System",
      site_logo: "/placeholder-logo.png",
      primary_color: "#dc2626",
      secondary_color: "#2563eb",
      theme: "light",
      footer_text: "© 2024 MMHRM. All rights reserved.",
      contact_email: "admin@mmhrm.com",
      contact_phone: "+1 (555) 123-4567",
    };

    if (!settings) {
      return NextResponse.json(defaultSettings);
    }

    const payload = {
      id: (settings as any)._id?.toString?.() || (settings as any)._id,
      site_name: settings.site_name,
      site_title: settings.site_title,
      site_logo: settings.site_logo,
      primary_color: settings.primary_color,
      secondary_color: settings.secondary_color,
      theme: settings.theme,
      footer_text: settings.footer_text,
      contact_email: settings.contact_email,
      contact_phone: settings.contact_phone,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
