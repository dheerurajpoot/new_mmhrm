import { type NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerUser } from "@/lib/auth/server";
import { getUsersCollection } from "@/lib/mongodb/collections";

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    const { full_name, phone, address } = await request.json();

    const collection = await getUsersCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(user._id!.toString()) },
      {
        $set: {
          full_name: full_name || "",
          phone: phone || "",
          address: address || "",
          updated_at: new Date(),
        },
      }
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
