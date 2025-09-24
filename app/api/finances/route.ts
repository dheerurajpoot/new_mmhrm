import { type NextRequest, NextResponse } from "next/server"
import { getServerUser } from "@/lib/auth/server"
import { getAllFinances } from "@/lib/mongodb/operations"

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!["admin", "hr"].includes(user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const finances = await getAllFinances()

    return NextResponse.json(finances)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
