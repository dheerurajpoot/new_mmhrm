import { NextRequest, NextResponse } from "next/server"
import { getCurrentUserServer } from "@/lib/auth/server"
import { 
  getTimeEntriesByEmployee, 
  getAllTimeEntries, 
  clockIn, 
  clockOut, 
  startBreak, 
  endBreak,
  getCurrentTimeEntry 
} from "@/lib/mongodb/operations"

// GET - Get time entries
export async function GET(request: NextRequest) {
  try {
    console.log("[Time Entries API] GET request received");
    const user = await getCurrentUserServer()
    console.log("[Time Entries API] User from auth:", user ? "found" : "not found");
    if (!user) {
      console.log("[Time Entries API] No user - returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user._id?.toString() || '';
    console.log("[Time Entries API] User ID:", userId);
    console.log("[Time Entries API] User role:", user.role);

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employee_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const all = searchParams.get('all') === 'true'

    // Only admins and HR can view all time entries
    if (all && !['admin', 'hr'].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    let timeEntries
    
    if (all) {
      console.log("[Time Entries API] Getting all time entries");
      timeEntries = await getAllTimeEntries()
      console.log("[Time Entries API] All entries count:", timeEntries.length);
    } else {
      const targetEmployeeId = employeeId || userId
      console.log("[Time Entries API] Target employee ID:", targetEmployeeId);
      
      // Only allow employees to view their own entries, or admins/HR to view any
      if (targetEmployeeId !== userId && !['admin', 'hr'].includes(user.role)) {
        console.log("[Time Entries API] Forbidden - insufficient permissions");
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const start = startDate ? new Date(startDate) : undefined
      const end = endDate ? new Date(endDate) : undefined
      
      console.log("[Time Entries API] Getting entries for employee:", targetEmployeeId);
      timeEntries = await getTimeEntriesByEmployee(targetEmployeeId, start, end)
      console.log("[Time Entries API] Employee entries count:", timeEntries.length);
      console.log("[Time Entries API] Sample entries:", timeEntries.slice(0, 2));
    }

    return NextResponse.json({ success: true, data: timeEntries })
  } catch (error) {
    console.error("Error fetching time entries:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Clock in/out, start/end break
export async function POST(request: NextRequest) {
  try {
    console.log("[Time Entries API] POST request received");
    const user = await getCurrentUserServer()
    if (!user) {
      console.log("[Time Entries API] No user found - unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user._id?.toString() || '';
    console.log("[Time Entries API] User:", userId, user.role, typeof userId);
    const body = await request.json()
    const { action, employee_id, location, notes } = body
    console.log("[Time Entries API] Request body:", { action, employee_id, location });
    console.log("[Time Entries API] User ID type:", typeof userId, "Employee ID type:", typeof employee_id);

    // Get client information
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Only allow employees to clock themselves in/out, or admins/HR for any employee
    const targetEmployeeId = employee_id || userId
    console.log("[Time Entries API] Target employee ID:", targetEmployeeId);
    
    if (targetEmployeeId !== userId && !['admin', 'hr'].includes(user.role)) {
      console.log("[Time Entries API] Forbidden - insufficient permissions");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    let result

    switch (action) {
      case 'clock_in':
        console.log("[Time Entries API] Clocking in...");
        result = await clockIn(targetEmployeeId, location, ipAddress, userAgent)
        console.log("[Time Entries API] Clock in result:", result);
        break
      case 'clock_out':
        result = await clockOut(targetEmployeeId)
        break
      case 'start_break':
        result = await startBreak(targetEmployeeId)
        break
      case 'end_break':
        result = await endBreak(targetEmployeeId)
        break
      case 'get_current':
        const currentEntry = await getCurrentTimeEntry(targetEmployeeId)
        result = { success: true, data: currentEntry }
        break
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }

    console.log("[Time Entries API] Final result:", result);
    if (result.success) {
      console.log("[Time Entries API] Returning success response");
      return NextResponse.json(result)
    } else {
      console.log("[Time Entries API] Returning error response:", result.error);
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("[Time Entries API] Error processing time entry action:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
