import { type NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server";
import { getWebsiteSettingsCollection } from "@/lib/mongodb/collections";

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
      footer_text: "Made with ❤️ by Chandu © 2025 HRMS. All rights reserved.",
      contact_email: "admin@mmhrm.com",
      contact_phone: "+1 (555) 123-4567",
    };

    if (!settings) {
      // Create default settings
      await collection.insertOne({
        ...defaultSettings,
        created_at: new Date(),
        updated_at: new Date(),
      });
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

export async function PUT(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const {
      site_name,
      site_title,
      site_logo,
      primary_color,
      secondary_color,
      theme,
      footer_text,
      contact_email,
      contact_phone,
    } = await request.json();


    if (!site_name || !site_title) {
      return NextResponse.json({ error: "Site name and title are required" }, { status: 400 });
    }

    const collection = await getWebsiteSettingsCollection();
    
    const updateData = {
      site_name,
      site_title,
      site_logo: site_logo && site_logo.trim() !== "" ? site_logo : "/placeholder-logo.png",
      primary_color: primary_color || "#dc2626",
      secondary_color: secondary_color || "#2563eb",
      theme: theme || "light",
      footer_text: footer_text || "",
      contact_email: contact_email || "",
      contact_phone: contact_phone || "",
      updated_at: new Date(),
    };

    // Update or create settings
    const result = await collection.findOneAndUpdate(
      {},
      { $set: updateData },
      { upsert: true, returnDocument: "after" }
    );

    return NextResponse.json({ success: true, settings: result });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
