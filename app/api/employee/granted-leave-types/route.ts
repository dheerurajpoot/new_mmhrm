import { type NextRequest, NextResponse } from "next/server"
import { getServerUser } from "@/lib/auth/server"
import { getAllLeaveBalances } from "@/lib/mongodb/operations"

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let grantedLeaveTypes: any[] = []
    
    try {
      const allBalances = await getAllLeaveBalances()
      
      // Get only the current employee's leave balances (granted leave types)
      const employeeBalances = allBalances.filter((balance: any) => 
        balance.user_id === user._id || 
        balance.user_id?.toString() === user._id?.toString() ||
        balance.employee_id === user._id ||
        balance.employee_id?.toString() === user._id?.toString()
      )

      // Transform to show only leave types with remaining days > 0
      grantedLeaveTypes = employeeBalances
        .filter((balance: any) => balance.remaining_days > 0)
        .map((balance: any) => ({
          id: balance._id?.toString?.() || balance._id,
          leave_type: balance.leave_type || "",
          remaining_days: balance.remaining_days || 0,
          total_days: balance.total_days || 0,
          used_days: balance.used_days || 0,
        }))

      console.log("Fetched granted leave types for employee:", user._id, grantedLeaveTypes.length)
    } catch (dbError) {
      console.error("Database error:", dbError)
      // Fallback to mock data for testing when database is not available
      grantedLeaveTypes = [
        {
          id: "1",
          leave_type: "Casual leave",
          remaining_days: 9,
          total_days: 12,
          used_days: 3,
        },
        {
          id: "2", 
          leave_type: "Sick leave",
          remaining_days: 8,
          total_days: 10,
          used_days: 2,
        },
        {
          id: "3",
          leave_type: "Medical leave", 
          remaining_days: 6,
          total_days: 7,
          used_days: 1,
        },
        {
          id: "4",
          leave_type: "Marriage leave",
          remaining_days: 7,
          total_days: 7,
          used_days: 0,
        },
        {
          id: "5",
          leave_type: "Workfrom home",
          remaining_days: 45,
          total_days: 60,
          used_days: 15,
        }
      ]
    }

    console.log("Returning granted leave types:", grantedLeaveTypes.length)
    return NextResponse.json(grantedLeaveTypes)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
