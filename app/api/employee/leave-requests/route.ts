import { type NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerUser } from "@/lib/auth/server";
import { getLeaveRequestsCollection, getProfilesCollection } from "@/lib/mongodb/collections";
import { sendLeaveRequestNotification, getAdminAndHREmails } from "@/lib/services/email";

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const collection = await getLeaveRequestsCollection();
    const docs = await collection
      .find({ employee_id: new ObjectId(user._id!.toString()) })
      .sort({ created_at: -1 })
      .toArray();

    const payload = docs.map((r) => ({
      id: (r as any)._id?.toString?.() || (r as any)._id,
      employee_id: r.employee_id.toString(),
      leave_type: r.leave_type,
      start_date: r.start_date,
      end_date: r.end_date,
      days_requested: r.days_requested,
      status: r.status,
      reason: r.reason,
      approved_by: r.approved_by?.toString?.() || r.approved_by,
      approved_at: r.approved_at,
      created_at: r.created_at,
    }));

    return NextResponse.json(payload);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { leave_type, start_date, end_date, days_requested, reason } = await request.json();
    if (!leave_type || !start_date || !end_date || !days_requested) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const collection = await getLeaveRequestsCollection();
    const doc = {
      employee_id: new ObjectId(user._id!.toString()),
      leave_type,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      days_requested: Number(days_requested),
      reason: reason || "",
      status: "pending" as const,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await collection.insertOne(doc);

    // Send email notification to admins/HR
    try {
      console.log('Starting email notification process...');
      const profilesCollection = await getProfilesCollection();
      const employeeProfile = await profilesCollection.findOne({ _id: new ObjectId(user._id!.toString()) });
      
      console.log('Employee profile found:', !!employeeProfile);
      if (employeeProfile) {
        console.log('Employee email:', employeeProfile.email);
        console.log('Employee name:', employeeProfile.full_name);
        
        const adminEmails = await getAdminAndHREmails();
        console.log('Admin emails retrieved:', adminEmails);
        
        if (adminEmails.length > 0) {
          console.log('Sending leave request notification...');
          const emailResult = await sendLeaveRequestNotification(
            adminEmails,
            employeeProfile.full_name || employeeProfile.email || 'Unknown Employee',
            employeeProfile.email,
            {
              leaveType: leave_type,
              startDate: start_date,
              endDate: end_date,
              daysRequested: Number(days_requested),
              reason: reason || undefined
            }
          );
          console.log('Email notification result:', emailResult);
        } else {
          console.log('No admin/HR emails configured, skipping notification');
        }
      } else {
        console.log('Employee profile not found, skipping email notification');
      }
    } catch (emailError) {
      console.error('Failed to send leave request notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true, id: result.insertedId.toString() });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


