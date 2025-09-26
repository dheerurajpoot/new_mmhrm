import { NextRequest, NextResponse } from "next/server"
import { getServerUser } from "@/lib/auth/server"
import { sendLeaveRequestNotification, sendLeaveStatusNotification, testEmailConnection } from "@/lib/services/email"

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user || !["admin", "hr"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type, testData } = await request.json()

    if (type === "test-connection") {
      const isConnected = await testEmailConnection()
      return NextResponse.json({ 
        success: isConnected, 
        message: isConnected ? "Email connection successful" : "Email connection failed" 
      })
    }

    if (type === "test-leave-request") {
      const result = await sendLeaveRequestNotification(
        [user.email], // Send to current user for testing
        testData?.employeeName || "Test Employee",
        testData?.employeeEmail || "test@example.com",
        {
          leaveType: testData?.leaveType || "Annual Leave",
          startDate: testData?.startDate || new Date().toISOString(),
          endDate: testData?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          daysRequested: testData?.daysRequested || 5,
          reason: testData?.reason || "Test leave request notification"
        }
      )
      return NextResponse.json(result)
    }

    if (type === "test-leave-status") {
      const result = await sendLeaveStatusNotification(
        testData?.employeeEmail || user.email,
        testData?.employeeName || "Test Employee",
        {
          leaveType: testData?.leaveType || "Annual Leave",
          startDate: testData?.startDate || new Date().toISOString(),
          endDate: testData?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          daysRequested: testData?.daysRequested || 5,
          status: testData?.status || "approved",
          adminNotes: testData?.adminNotes || "Test approval notification",
          approvedBy: testData?.approvedBy || "Test Admin"
        }
      )
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: "Invalid test type" }, { status: 400 })
  } catch (error) {
    console.error("Email test error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Test failed" 
    }, { status: 500 })
  }
}
