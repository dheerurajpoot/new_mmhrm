import { type NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server";
import { getTimeEntriesCollection, getProfilesCollection } from "@/lib/mongodb/collections";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employee_id');
    const dateFrom = url.searchParams.get('date_from');
    const dateTo = url.searchParams.get('date_to');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    const timeEntriesCollection = await getTimeEntriesCollection();
    
    // Build query
    const query: any = {};
    
    // Filter by employee if provided
    if (employeeId) {
      try {
        console.log("[Time Entries API] Converting employee_id to ObjectId:", {
          employeeId,
          employeeIdType: typeof employeeId,
          employeeIdLength: employeeId.length
        });
        query.employee_id = new ObjectId(employeeId);
        console.log("[Time Entries API] Successfully converted employee_id to ObjectId");
      } catch (error) {
        console.error("[Time Entries API] Invalid employee_id format:", {
          employeeId,
          employeeIdType: typeof employeeId,
          employeeIdLength: employeeId.length,
          error: error instanceof Error ? error.message : String(error)
        });
        return NextResponse.json({ 
          error: "Invalid employee_id format",
          details: `Employee ID '${employeeId}' is not a valid MongoDB ObjectId format. Expected a 24-character hexadecimal string.`
        }, { status: 400 });
      }
    }
    
    // Filter by date range if provided
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) {
        query.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.date.$lte = new Date(dateTo);
      }
    }

    const entries = await timeEntriesCollection
      .find(query)
      .sort({ clock_in: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json(entries);
  } catch (error) {
    console.error("[Time Entries API] Error fetching time entries:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestBody = await request.json();
    const { action, employee_id, break_duration, notes } = requestBody;
    
    if (!action || !employee_id) {
      return NextResponse.json({ error: "Action and employee_id are required" }, { status: 400 });
    }

    const timeEntriesCollection = await getTimeEntriesCollection();
    
    // Validate and convert employee_id to ObjectId
    let employeeObjectId;
    try {
      employeeObjectId = new ObjectId(employee_id);
    } catch (error) {
      console.error("[Time Entries API] Invalid employee_id format:", employee_id, error);
      return NextResponse.json({ 
        error: "Invalid employee_id format" 
      }, { status: 400 });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    if (action === "clock_in") {
      // Check if already clocked in today
      const existingEntry = await timeEntriesCollection.findOne({
        employee_id: employeeObjectId,
        date: { $gte: today, $lte: endOfDay },
        clock_out: { $exists: false }
      });

      if (existingEntry) {
        return NextResponse.json({ 
          error: "You are already clocked in today" 
        }, { status: 400 });
      }

      // Create new time entry
      const timeEntry = {
        employee_id: employeeObjectId,
        clock_in: new Date(),
        break_duration: break_duration || 0,
        notes: notes || "",
        date: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await timeEntriesCollection.insertOne(timeEntry);
      
      return NextResponse.json({
        success: true,
        message: "Clocked in successfully",
        entry: { ...timeEntry, _id: result.insertedId }
      });

    } else if (action === "clock_out") {
      // Find active time entry for today
      const activeEntry = await timeEntriesCollection.findOne({
        employee_id: employeeObjectId,
        date: { $gte: today, $lte: endOfDay },
        clock_out: { $exists: false }
      });

      if (!activeEntry) {
        return NextResponse.json({ 
          error: "No active clock-in found for today" 
        }, { status: 400 });
      }

      // Calculate total hours
      const clockOutTime = new Date();
      const clockInTime = new Date(activeEntry.clock_in);
      const totalMs = clockOutTime.getTime() - clockInTime.getTime();
      const totalHours = Math.max(0, (totalMs / (1000 * 60 * 60)) - (activeEntry.break_duration || 0) / 60);

      // Update the entry
      const result = await timeEntriesCollection.updateOne(
        { _id: activeEntry._id },
        {
          $set: {
            clock_out: clockOutTime,
            total_hours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
            updated_at: new Date(),
            notes: notes || activeEntry.notes
          }
        }
      );

      if (result.modifiedCount === 0) {
        return NextResponse.json({ 
          error: "Failed to clock out" 
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Clocked out successfully",
        total_hours: Math.round(totalHours * 10) / 10
      });

    } else {
      return NextResponse.json({ 
        error: "Invalid action. Use 'clock_in' or 'clock_out'" 
      }, { status: 400 });
    }

  } catch (error) {
    console.error("[Time Entries API] Error processing time entry:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { entry_id, break_duration, notes } = await request.json();
    
    if (!entry_id) {
      return NextResponse.json({ error: "Entry ID is required" }, { status: 400 });
    }

    const timeEntriesCollection = await getTimeEntriesCollection();
    const entryObjectId = new ObjectId(entry_id);

    // Check if entry exists and belongs to user (or user is admin/hr)
    const entry = await timeEntriesCollection.findOne({ _id: entryObjectId });
    if (!entry) {
      return NextResponse.json({ error: "Time entry not found" }, { status: 404 });
    }

    // Check permissions
    if (user.role === "employee" && !entry.employee_id.equals(user._id)) {
      return NextResponse.json({ error: "Unauthorized to modify this entry" }, { status: 403 });
    }

    // Recalculate total hours if break duration changed and entry is complete
    let updateData: any = {
      updated_at: new Date()
    };

    if (break_duration !== undefined) {
      updateData.break_duration = break_duration;
      
      // Recalculate total hours if entry is complete
      if (entry.clock_out) {
        const clockInTime = new Date(entry.clock_in);
        const clockOutTime = new Date(entry.clock_out);
        const totalMs = clockOutTime.getTime() - clockInTime.getTime();
        const totalHours = Math.max(0, (totalMs / (1000 * 60 * 60)) - break_duration / 60);
        updateData.total_hours = Math.round(totalHours * 10) / 10;
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const result = await timeEntriesCollection.updateOne(
      { _id: entryObjectId },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Time entry updated successfully"
    });

  } catch (error) {
    console.error("Error updating time entry:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}