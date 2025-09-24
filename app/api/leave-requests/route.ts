import { type NextRequest, NextResponse } from "next/server"
import { getServerUser } from "@/lib/auth/server"
import { getAllLeaveRequests } from "@/lib/mongodb/operations"

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!["admin", "hr"].includes(user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const requests = await getAllLeaveRequests()

    return NextResponse.json(requests)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
