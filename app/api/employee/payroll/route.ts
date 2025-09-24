import { type NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerUser } from "@/lib/auth/server";
import { getPayrollRecordsCollection } from "@/lib/mongodb/collections";

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payrollCollection = await getPayrollRecordsCollection();
    const records = await payrollCollection
      .find({ employee_id: new ObjectId(user._id!.toString()) })
      .sort({ pay_period_end: -1 })
      .toArray();

    const payload = records.map((r) => ({
      id: (r as any)._id?.toString?.() || (r as any)._id,
      employee_id: r.employee_id.toString(),
      pay_period_start: r.pay_period_start,
      pay_period_end: r.pay_period_end,
      gross_pay: r.gross_pay,
      deductions: r.deductions,
      net_pay: r.net_pay,
      overtime_hours: r.overtime_hours ?? 0,
      overtime_pay: r.overtime_pay ?? 0,
      bonus: r.bonus ?? 0,
      status: r.status,
      created_at: r.created_at,
    }));

    return NextResponse.json(payload);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


