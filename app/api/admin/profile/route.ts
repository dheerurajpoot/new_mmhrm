import { type NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerUser } from "@/lib/auth/server";
import { getUsersCollection } from "@/lib/mongodb/collections";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const collection = await getUsersCollection();
    const profile = await collection.findOne({ _id: new ObjectId(user._id!.toString()) });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const payload = {
      id: (profile as any)._id?.toString?.() || (profile as any)._id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      department: profile.department,
      position: profile.position,
      hire_date: profile.hire_date,
      birth_date: profile.birth_date,
      phone: profile.phone,
      address: profile.address,
      profile_photo: profile.profile_photo,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { 
      full_name, 
      email, 
      phone, 
      address, 
      birth_date, 
      department, 
      position, 
      hire_date, 
      role, 
      password 
    } = await request.json();

    const collection = await getUsersCollection();
    
    // Prepare update data
    const updateData: any = {
      full_name: full_name || "",
      email: email || "",
      phone: phone || "",
      address: address || "",
      department: department || "",
      position: position || "",
      role: role || "admin",
      updated_at: new Date(),
    };

    // Handle dates
    if (birth_date) {
      updateData.birth_date = new Date(birth_date);
    }
    if (hire_date) {
      updateData.hire_date = new Date(hire_date);
    }

    // Handle password if provided
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 12);
      updateData.password = hashedPassword;
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(user._id!.toString()) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
