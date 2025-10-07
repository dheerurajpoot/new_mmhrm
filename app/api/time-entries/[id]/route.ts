import { NextRequest, NextResponse } from "next/server"
import { getCurrentUserServer } from "@/lib/auth/server"
import { getTimeEntriesCollection } from "@/lib/mongodb/collections"
import { ObjectId } from "mongodb"

// GET - Get specific time entry
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserServer()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const timeEntriesCollection = await getTimeEntriesCollection()
    const timeEntry = await timeEntriesCollection.findOne({
      _id: new ObjectId(params.id)
    })

    if (!timeEntry) {
      return NextResponse.json({ error: "Time entry not found" }, { status: 404 })
    }

    // Only allow employees to view their own entries, or admins/HR to view any
    const userId = user._id?.toString() || '';
    if (timeEntry.employee_id.toString() !== userId && !['admin', 'hr'].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: timeEntry })
  } catch (error) {
    console.error("Error fetching time entry:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update time entry (admin/HR only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserServer()
    if (!user || !['admin', 'hr'].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { clock_in, clock_out, notes, status } = body

    const timeEntriesCollection = await getTimeEntriesCollection()
    
    const updateData: any = {
      updated_at: new Date()
    }

    if (clock_in) updateData.clock_in = new Date(clock_in)
    if (clock_out) updateData.clock_out = new Date(clock_out)
    if (notes !== undefined) updateData.notes = notes
    if (status) updateData.status = status

    // Recalculate total hours if clock_in and clock_out are provided
    if (clock_in && clock_out) {
      const clockInTime = new Date(clock_in)
      const clockOutTime = new Date(clock_out)
      const totalMs = clockOutTime.getTime() - clockInTime.getTime()
      updateData.total_hours = Math.max(0, totalMs / (1000 * 60 * 60))
    }

    const result = await timeEntriesCollection.findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json({ error: "Time entry not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Error updating time entry:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete time entry (admin/HR only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserServer()
    if (!user || !['admin', 'hr'].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const timeEntriesCollection = await getTimeEntriesCollection()
    const result = await timeEntriesCollection.deleteOne({
      _id: new ObjectId(params.id)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Time entry not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Time entry deleted" })
  } catch (error) {
    console.error("Error deleting time entry:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
