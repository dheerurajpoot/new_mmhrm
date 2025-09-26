import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getLeaveRequestsCollection, getLeaveBalancesCollection, getProfilesCollection } from "@/lib/mongodb/collections"
import { getServerUser } from "@/lib/auth/server"
import { sendLeaveStatusNotification } from "@/lib/services/email"

export async function PATCH(
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

    const requestId = params.id
    const body = await request.json()
    
    if (!ObjectId.isValid(requestId)) {
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 })
    }
    
    const leaveRequestsCollection = await getLeaveRequestsCollection()
    
    const updatePayload: any = {
      ...body,
      updated_at: new Date(),
    }

    if (body.approved_by) {
      updatePayload.approved_by = new ObjectId(body.approved_by)
    }

    if (body.status === "approved") {
      updatePayload.approved_at = new Date()
    }

    const result = await leaveRequestsCollection.findOneAndUpdate(
      { _id: new ObjectId(requestId) },
      { $set: updatePayload },
      { returnDocument: "after" }
    )

    if (!result) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 })
    }

    // If approved, update leave balance
    if (body.status === "approved") {
      const leaveBalancesCollection = await getLeaveBalancesCollection()

      await leaveBalancesCollection.updateOne(
        {
          employee_id: result.employee_id,
          leave_type: result.leave_type,
          year: new Date(result.start_date).getFullYear(),
        },
        {
          $inc: { used_days: result.days_requested },
          $set: { updated_at: new Date() },
        }
      )

      // Recalculate remaining days
      await leaveBalancesCollection.updateOne(
        {
          employee_id: result.employee_id,
          leave_type: result.leave_type,
          year: new Date(result.start_date).getFullYear(),
        },
        [
          {
            $set: {
              remaining_days: {
                $subtract: ["$total_days", "$used_days"],
              },
            },
          },
        ]
      )
    }

    // Send email notification to employee about status change
    try {
      if (body.status === "approved" || body.status === "rejected") {
        console.log('Starting leave status email notification...');
        const profilesCollection = await getProfilesCollection();
        const employeeProfile = await profilesCollection.findOne({ _id: result.employee_id });
        
        console.log('Employee profile found:', !!employeeProfile);
        if (employeeProfile) {
          console.log('Employee email:', employeeProfile.email);
          console.log('Employee name:', employeeProfile.full_name);
          
          const approverProfile = await profilesCollection.findOne({ _id: new ObjectId(user._id!.toString()) });
          console.log('Approver profile found:', !!approverProfile);
          
          console.log('Sending leave status notification...');
          const emailResult = await sendLeaveStatusNotification(
            employeeProfile.email,
            employeeProfile.full_name || employeeProfile.email || 'Employee',
            {
              leaveType: result.leave_type,
              startDate: result.start_date.toISOString(),
              endDate: result.end_date.toISOString(),
              daysRequested: result.days_requested,
              status: body.status,
              adminNotes: body.admin_notes,
              approvedBy: approverProfile?.full_name || approverProfile?.email || 'Admin'
            }
          );
          console.log('Email notification result:', emailResult);
        } else {
          console.log('Employee profile not found, skipping email notification');
        }
      }
    } catch (emailError) {
      console.error('Failed to send leave status notification:', emailError);
      // Don't fail the request if email fails
    }
    
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error("Error updating leave request:", error)
    return NextResponse.json({ error: "Failed to update leave request" }, { status: 500 })
  }
}

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
