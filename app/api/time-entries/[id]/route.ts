import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getTimeEntriesCollection } from "@/lib/mongodb/collections"
import { getServerUser } from "@/lib/auth/server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!["admin", "hr"].includes(user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const entryId = params.id
    
    if (!ObjectId.isValid(entryId)) {
      return NextResponse.json({ error: "Invalid entry ID" }, { status: 400 })
    }
    
    const timeEntriesCollection = await getTimeEntriesCollection()
    
    const result = await timeEntriesCollection.deleteOne({ _id: new ObjectId(entryId) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Time entry not found" }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: "Time entry deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting time entry:", error)
    return NextResponse.json({ error: "Failed to delete time entry" }, { status: 500 })
  }
}
