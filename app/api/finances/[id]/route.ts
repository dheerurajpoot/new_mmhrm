import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getEmployeeFinancesCollection } from "@/lib/mongodb/collections"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const financeId = params.id
    
    if (!ObjectId.isValid(financeId)) {
      return NextResponse.json({ error: "Invalid finance ID" }, { status: 400 })
    }
    
    const employeeFinancesCollection = await getEmployeeFinancesCollection()
    
    const result = await employeeFinancesCollection.deleteOne({ _id: new ObjectId(financeId) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Finance record not found" }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: "Finance record deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting finance record:", error)
    return NextResponse.json({ error: "Failed to delete finance record" }, { status: 500 })
  }
}
