import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getLeaveBalancesCollection } from "@/lib/mongodb/collections"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const balanceId = params.id
    
    if (!ObjectId.isValid(balanceId)) {
      return NextResponse.json({ error: "Invalid balance ID" }, { status: 400 })
    }
    
    const leaveBalancesCollection = await getLeaveBalancesCollection()
    
    const result = await leaveBalancesCollection.deleteOne({ _id: new ObjectId(balanceId) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Leave balance not found" }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: "Leave balance deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting leave balance:", error)
    return NextResponse.json({ error: "Failed to delete leave balance" }, { status: 500 })
  }
}
