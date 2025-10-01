import { type NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerUser } from "@/lib/auth/server";
import { getUsersCollection } from "@/lib/mongodb/collections";

export async function POST(request: NextRequest) {
  try {
    console.log("[Photo Upload] Starting upload process...");
    
    // Step 1: Authenticate user
    const user = await getServerUser();
    if (!user) {
      console.error("[Photo Upload] Unauthorized - no user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(`[Photo Upload] User authenticated: ${user._id}`);

    // Step 2: Parse form data
    let formData;
    try {
      formData = await request.formData();
    } catch (err) {
      console.error("[Photo Upload] Failed to parse form data:", err);
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const file = formData.get("profile_photo") as File;

    if (!file) {
      console.error("[Photo Upload] No file provided in form data");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(`[Photo Upload] File received: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // Step 3: Validate file
    if (file.size > 5 * 1024 * 1024) {
      console.error(`[Photo Upload] File too large: ${file.size} bytes`);
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      console.error(`[Photo Upload] Invalid file type: ${file.type}`);
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Step 4: Convert file to base64
    let base64String;
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      base64String = `data:${file.type};base64,${buffer.toString('base64')}`;
      console.log(`[Photo Upload] File converted to base64: ${buffer.length} bytes`);
    } catch (err) {
      console.error("[Photo Upload] Failed to convert file to base64:", err);
      return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
    }

    // Step 5: Update database with base64 string
    try {
      const collection = await getUsersCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(user._id!.toString()) },
        {
          $set: {
            profile_photo: base64String,
            updated_at: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        console.error("[Photo Upload] User not found in database");
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      console.log(`[Photo Upload] Database updated successfully with base64 image`);
    } catch (err) {
      console.error("[Photo Upload] Database update failed:", err);
      return NextResponse.json({ 
        error: "Failed to update profile in database" 
      }, { status: 500 });
    }

    console.log("[Photo Upload] Upload completed successfully");
    return NextResponse.json({ success: true, photoUrl: base64String });
  } catch (error) {
    console.error("[Photo Upload] Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      error: "Internal server error", 
      details: errorMessage 
    }, { status: 500 });
  }
}
