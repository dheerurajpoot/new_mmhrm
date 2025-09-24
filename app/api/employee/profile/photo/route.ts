import { type NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerUser } from "@/lib/auth/server";
import { getUsersCollection } from "@/lib/mongodb/collections";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("profile_photo") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "profiles");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `profile_${user._id}_${timestamp}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    // Update user profile with photo URL
    const photoUrl = `/uploads/profiles/${filename}`;
    const collection = await getUsersCollection();
    await collection.updateOne(
      { _id: new ObjectId(user._id!.toString()) },
      {
        $set: {
          profile_photo: photoUrl,
          updated_at: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true, photoUrl });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
