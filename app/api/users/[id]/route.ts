import { type NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerUser } from "@/lib/auth/server";
import { getUsersCollection } from "@/lib/mongodb/collections";

// Update user (role or profile fields)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const current = await getServerUser();
    if (!current || !["admin", "hr"].includes(current.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const allowed: Record<string, unknown> = {};
    const updatable = [
      "full_name",
      "email",
      "role",
      "department",
      "position",
      "phone",
      "address",
      "hire_date",
      "birth_date",
    ];
    for (const key of updatable) {
      if (key in body) allowed[key] = body[key];
    }
    if ("hire_date" in allowed && allowed.hire_date) {
      allowed.hire_date = new Date(String(allowed.hire_date));
    }
    if ("birth_date" in allowed && allowed.birth_date) {
      allowed.birth_date = new Date(String(allowed.birth_date));
    }
    allowed["updated_at"] = new Date();

    const users = await getUsersCollection();
    const result = await users.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: allowed }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Delete user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const current = await getServerUser();
    if (!current || current.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const users = await getUsersCollection();
    const result = await users.deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


