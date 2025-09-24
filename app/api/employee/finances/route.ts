import { type NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server";
import { getEmployeeFinances } from "@/lib/mongodb/operations";

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const finances = await getEmployeeFinances(user._id!.toString());
    if (!finances) return NextResponse.json(null);

    // Normalize id fields to strings for the client
    const payload = {
      id: (finances as any)._id?.toString?.() || (finances as any)._id,
      employee_id: finances.employee_id.toString(),
      base_salary: finances.base_salary ?? null,
      hourly_rate: finances.hourly_rate ?? null,
      currency: finances.currency,
      pay_frequency: finances.pay_frequency,
      bank_account: finances.bank_account ?? null,
      tax_id: finances.tax_id ?? null,
      created_at: finances.created_at?.toISOString?.() || finances.created_at,
      updated_at: finances.updated_at?.toISOString?.() || finances.updated_at,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


