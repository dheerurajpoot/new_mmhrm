import { type NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerUser } from "@/lib/auth/server";
import { getLeaveBalancesCollection, getLeaveRequestsCollection, getTimeEntriesCollection } from "@/lib/mongodb/collections";
import { getEmployeeFinances } from "@/lib/mongodb/operations";

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = new ObjectId(user._id!.toString());
    const currentYear = new Date().getFullYear();
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const [leaveBalances, leaveRequests, timeEntries, finances] = await Promise.all([
      getLeaveBalancesCollection().then(c => c.find({ employee_id: userId, year: currentYear }).toArray()),
      getLeaveRequestsCollection().then(c => c.find({ employee_id: userId, status: "pending" }).toArray()),
      getTimeEntriesCollection().then(c => c.find({ employee_id: userId }).toArray()),
      getEmployeeFinances(user._id!.toString()),
    ]);

    // Calculate total remaining leaves
    const totalRemainingLeaves = leaveBalances.reduce((sum, balance) => sum + balance.remaining_days, 0);

    // Calculate hours this week
    const weekEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfWeek;
    });
    const hoursThisWeek = weekEntries.reduce((sum, entry) => sum + (entry.total_hours || 0), 0);

    // Calculate today's hours
    const todayEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= today && entryDate <= endOfToday;
    });
    const todayHours = todayEntries.reduce((sum, entry) => sum + (entry.total_hours || 0), 0);

    // Check if currently clocked in (has entry today without clock_out)
    const isCurrentlyClockedIn = todayEntries.some(entry => !entry.clock_out);

    const stats = {
      remainingLeaves: totalRemainingLeaves,
      hoursThisWeek: Math.round(hoursThisWeek * 100) / 100,
      pendingRequests: leaveRequests.length,
      currentSalary: finances?.base_salary || 0,
      isCurrentlyClockedIn,
      todayHours: Math.round(todayHours * 100) / 100,
      leaveBalances: leaveBalances.map(balance => ({
        id: (balance as any)._id?.toString?.() || (balance as any)._id,
        leave_type: balance.leave_type,
        remaining_days: balance.remaining_days,
        total_days: balance.total_days,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
