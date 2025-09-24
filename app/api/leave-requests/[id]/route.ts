import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getLeaveRequestsCollection } from "@/lib/mongodb/collections"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id
    
    if (!ObjectId.isValid(requestId)) {
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 })
    }
    
    const leaveRequestsCollection = await getLeaveRequestsCollection()
    
    const result = await leaveRequestsCollection.deleteOne({ _id: new ObjectId(requestId) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: "Leave request deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting leave request:", error)
    return NextResponse.json({ error: "Failed to delete leave request" }, { status: 500 })
  }
}
