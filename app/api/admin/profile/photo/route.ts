import { type NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerUser } from "@/lib/auth/server";
import { getUsersCollection } from "@/lib/mongodb/collections";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const formData = await request.formData();
    const photo = formData.get("photo") as File;

    if (!photo) {
      return NextResponse.json({ error: "No photo provided" }, { status: 400 });
    }

    // Validate file type
    if (!photo.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (photo.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "profiles");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = photo.name.split('.').pop();
    const filename = `admin_${user._id}_${timestamp}.${fileExtension}`;
    const filepath = join(uploadsDir, filename);

    // Save file
    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Update user profile with new photo path
    const collection = await getUsersCollection();
    const photoPath = `/uploads/profiles/${filename}`;
    
    await collection.updateOne(
      { _id: new ObjectId(user._id!.toString()) },
      { 
        $set: { 
          profile_photo: photoPath,
          updated_at: new Date()
        } 
      }
    );

    return NextResponse.json({ 
      success: true, 
      photo_path: photoPath 
    });
  } catch (error) {
    console.error("Photo upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
