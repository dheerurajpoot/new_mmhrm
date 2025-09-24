import { type NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerUser } from "@/lib/auth/server";
import { getLeaveTypesCollection } from "@/lib/mongodb/collections";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { name, description, max_days_per_year, carry_forward } = await request.json();
    if (!name || !max_days_per_year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const collection = await getLeaveTypesCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          name,
          description: description || "",
          max_days_per_year: Number(max_days_per_year),
          carry_forward: Boolean(carry_forward),
          updated_at: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Leave type not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const collection = await getLeaveTypesCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Leave type not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
