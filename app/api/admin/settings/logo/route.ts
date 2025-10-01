import { type NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server";

export async function POST(request: NextRequest) {
  try {
    console.log("[Logo Upload] Starting upload process...");
    
    const user = await getServerUser();
    if (!user) {
      console.error("[Logo Upload] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (user.role !== "admin") {
      console.error("[Logo Upload] Forbidden - user is not admin");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log(`[Logo Upload] Admin user authenticated: ${user._id}`);

    const formData = await request.formData();
    const file = formData.get("logo") as File;

    if (!file) {
      console.error("[Logo Upload] No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(`[Logo Upload] File received: ${file.name}, size: ${file.size}, type: ${file.type}`);

    if (file.size > 2 * 1024 * 1024) {
      console.error(`[Logo Upload] File too large: ${file.size} bytes`);
      return NextResponse.json({ error: "File size must be less than 2MB" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      console.error(`[Logo Upload] Invalid file type: ${file.type}`);
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Convert file to base64
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;
      
      console.log(`[Logo Upload] File converted to base64: ${buffer.length} bytes`);
      console.log("[Logo Upload] Upload completed successfully");
      
      return NextResponse.json({ success: true, logoUrl: base64String });
    } catch (err) {
      console.error("[Logo Upload] Failed to convert file to base64:", err);
      return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
    }
  } catch (error) {
    console.error("[Logo Upload] Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      error: "Internal server error", 
      details: errorMessage 
    }, { status: 500 });
  }
}
