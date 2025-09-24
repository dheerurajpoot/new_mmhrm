import { type NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerUser } from "@/lib/auth/server";
import { getLeaveBalancesCollection } from "@/lib/mongodb/collections";

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const collection = await getLeaveBalancesCollection();
    const balances = await collection
      .find({ employee_id: new ObjectId(user._id!.toString()) })
      .toArray();

    const payload = balances.map((b) => ({
      id: (b as any)._id?.toString?.() || (b as any)._id,
      employee_id: b.employee_id.toString(),
      leave_type: b.leave_type,
      year: b.year,
      total_days: b.total_days,
      used_days: b.used_days,
      remaining_days: b.remaining_days,
    }));

    return NextResponse.json(payload);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


