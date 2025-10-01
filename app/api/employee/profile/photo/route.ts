import { type NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerUser } from "@/lib/auth/server";
import { getUsersCollection } from "@/lib/mongodb/collections";
import { writeFile, mkdir, access } from "fs/promises";
import { join } from "path";
import { constants } from "fs";

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

    // Step 4: Convert file to buffer
    let bytes, buffer;
    try {
      bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      console.log(`[Photo Upload] File converted to buffer: ${buffer.length} bytes`);
    } catch (err) {
      console.error("[Photo Upload] Failed to convert file to buffer:", err);
      return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
    }

    // Step 5: Prepare file system
    const uploadsDir = join(process.cwd(), "public", "uploads", "profiles");
    console.log(`[Photo Upload] Upload directory: ${uploadsDir}`);

    try {
      // Check if directory exists and is writable
      try {
        await access(uploadsDir, constants.W_OK);
        console.log("[Photo Upload] Directory exists and is writable");
      } catch {
        console.log("[Photo Upload] Creating directory...");
        await mkdir(uploadsDir, { recursive: true });
        console.log("[Photo Upload] Directory created successfully");
      }
    } catch (err) {
      console.error("[Photo Upload] Failed to create/access directory:", err);
      return NextResponse.json({ 
        error: "File system error - unable to create upload directory" 
      }, { status: 500 });
    }

    // Step 6: Generate filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "jpg";
    const filename = `profile_${user._id}_${timestamp}.${extension}`;
    const filepath = join(uploadsDir, filename);
    console.log(`[Photo Upload] Target file: ${filepath}`);

    // Step 7: Save file
    try {
      await writeFile(filepath, buffer);
      console.log("[Photo Upload] File saved successfully");
      
      // Verify file was written
      await access(filepath, constants.R_OK);
      console.log("[Photo Upload] File verified");
    } catch (err) {
      console.error("[Photo Upload] Failed to save file:", err);
      return NextResponse.json({ 
        error: "Failed to save file to server" 
      }, { status: 500 });
    }

    // Step 8: Update database
    const photoUrl = `/uploads/profiles/${filename}`;
    try {
      const collection = await getUsersCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(user._id!.toString()) },
        {
          $set: {
            profile_photo: photoUrl,
            updated_at: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        console.error("[Photo Upload] User not found in database");
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      console.log(`[Photo Upload] Database updated successfully: ${photoUrl}`);
    } catch (err) {
      console.error("[Photo Upload] Database update failed:", err);
      return NextResponse.json({ 
        error: "Failed to update profile in database" 
      }, { status: 500 });
    }

    console.log("[Photo Upload] Upload completed successfully");
    return NextResponse.json({ success: true, photoUrl });
  } catch (error) {
    console.error("[Photo Upload] Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      error: "Internal server error", 
      details: errorMessage 
    }, { status: 500 });
  }
}
