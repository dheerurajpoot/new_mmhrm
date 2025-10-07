import { ObjectId } from "mongodb"
import {
  getUsersCollection,
  getLeaveRequestsCollection,
  getLeaveBalancesCollection,
  getTimeEntriesCollection,
  getEmployeeFinancesCollection,
  getPayrollRecordsCollection,
} from "./collections"
import type { User, LeaveRequest, LeaveBalance, TimeEntry, EmployeeFinance, PayrollRecord } from "./models"

// User operations
export async function getAllUsers(): Promise<User[]> {
  try {
    const usersCollection = await getUsersCollection()
    const users = await usersCollection.find({}).toArray()
    console.log("getAllUsers: Found", users.length, "users")
    console.log("Sample user:", users[0])
    console.log("Users with birth dates:", users.filter(user => user.birth_date).length)
    return users
  } catch (error) {
    console.error(" Error getting all users:", error)
    return []
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const usersCollection = await getUsersCollection()
    return await usersCollection.findOne({ _id: new ObjectId(userId) })
  } catch (error) {
    console.error(" Error getting user by ID:", error)
    return null
  }
}

export async function getUsersByRole(role: "admin" | "hr" | "employee"): Promise<User[]> {
  try {
    const usersCollection = await getUsersCollection()
    return await usersCollection.find({ role }).toArray()
  } catch (error) {
    console.error(" Error getting users by role:", error)
    return []
  }
}

// Leave operations
export async function getLeaveRequestsByEmployee(employeeId: string): Promise<LeaveRequest[]> {
  try {
    const leaveRequestsCollection = await getLeaveRequestsCollection()
    return await leaveRequestsCollection
      .find({ employee_id: new ObjectId(employeeId) })
      .sort({ created_at: -1 })
      .toArray()
  } catch (error) {
    console.error(" Error getting leave requests by employee:", error)
    return []
  }
}

export async function getAllLeaveRequests(): Promise<LeaveRequest[]> {
  try {
    const leaveRequestsCollection = await getLeaveRequestsCollection()
    const usersCollection = await getUsersCollection()
    
    const leaveRequests = await leaveRequestsCollection.find({}).sort({ created_at: -1 }).toArray()
    
    // Populate employee and approver data for each leave request
    const populatedLeaveRequests = await Promise.all(
      leaveRequests.map(async (request) => {
        // Get employee data
        const employee = await usersCollection.findOne({ 
          _id: new ObjectId(request.employee_id) 
        })
        
        // Get approver data if approved_by exists
        let approvedBy = null
        if (request.approved_by) {
          approvedBy = await usersCollection.findOne({ 
            _id: new ObjectId(request.approved_by) 
          })
        }
        
        return {
          ...request,
          employee: employee ? {
            id: employee._id.toString(),
            full_name: employee.full_name || employee.name || "",
            email: employee.email || "",
            department: employee.department || "",
            position: employee.position || "",
            profile_photo: employee.profile_photo || "",
          } : null,
          approved_by: approvedBy ? {
            id: approvedBy._id.toString(),
            full_name: approvedBy.full_name || approvedBy.name || "",
            email: approvedBy.email || "",
            role: approvedBy.role || "",
            profile_photo: approvedBy.profile_photo || "",
          } : null
        }
      })
    )
    
    return populatedLeaveRequests
  } catch (error) {
    console.error(" Error getting all leave requests:", error)
    return []
  }
}

export async function getLeaveBalancesByEmployee(employeeId: string): Promise<LeaveBalance[]> {
  try {
    const leaveBalancesCollection = await getLeaveBalancesCollection()
    return await leaveBalancesCollection.find({ employee_id: new ObjectId(employeeId) }).toArray()
  } catch (error) {
    console.error(" Error getting leave balances by employee:", error)
    return []
  }
}

export async function getAllLeaveBalances(): Promise<LeaveBalance[]> {
  try {
    const leaveBalancesCollection = await getLeaveBalancesCollection()
    const usersCollection = await getUsersCollection()
    
    const leaveBalances = await leaveBalancesCollection.find({}).toArray()
    
    // Populate employee data for each leave balance
    const populatedLeaveBalances = await Promise.all(
      leaveBalances.map(async (balance) => {
        const employee = await usersCollection.findOne({ 
          _id: new ObjectId(balance.employee_id) 
        })
        
        return {
          ...balance,
          employee: employee ? {
            id: employee._id.toString(),
            full_name: employee.full_name || employee.name || "",
            email: employee.email || "",
            department: employee.department || "",
            position: employee.position || "",
            profile_photo: employee.profile_photo || "",
          } : null
        }
      })
    )
    
    return populatedLeaveBalances
  } catch (error) {
    console.error(" Error getting all leave balances:", error)
    return []
  }
}

// Time tracking operations
export async function getTimeEntriesByEmployee(
  employeeId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<TimeEntry[]> {
  try {
    console.log("[getTimeEntriesByEmployee] Starting with employeeId:", employeeId, typeof employeeId);
    const timeEntriesCollection = await getTimeEntriesCollection()

    // Handle ObjectId conversion safely
    let employeeObjectId;
    if (employeeId instanceof ObjectId) {
      employeeObjectId = employeeId;
    } else if (ObjectId.isValid(employeeId)) {
      employeeObjectId = new ObjectId(employeeId);
    } else {
      console.error("[getTimeEntriesByEmployee] Invalid ObjectId format:", employeeId);
      return [];
    }

    const query: any = { employee_id: employeeObjectId }
    console.log("[getTimeEntriesByEmployee] Query:", query);

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate }
    }

    const entries = await timeEntriesCollection.find(query).sort({ clock_in: -1 }).toArray()
    console.log("[getTimeEntriesByEmployee] Found entries:", entries.length);
    
    return entries
  } catch (error) {
    console.error("[getTimeEntriesByEmployee] Error getting time entries by employee:", error)
    return []
  }
}

export async function getAllTimeEntries(): Promise<any[]> {
  try {
    const timeEntriesCollection = await getTimeEntriesCollection()
    const usersCollection = await getUsersCollection()
    
    // Use aggregation to join time entries with user data
    const timeEntries = await timeEntriesCollection.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'employee_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $unwind: {
          path: '$employee',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { clock_in: -1 }
      },
      {
        $project: {
          _id: 1,
          employee_id: { $toString: '$employee_id' },
          clock_in: 1,
          clock_out: 1,
          break_start: 1,
          break_end: 1,
          total_hours: 1,
          break_duration: 1,
          notes: 1,
          date: 1,
          status: 1,
          location: 1,
          ip_address: 1,
          device_info: 1,
          created_at: 1,
          updated_at: 1,
          employee: {
            $cond: {
              if: { $ne: ['$employee', null] },
              then: {
                id: { $toString: '$employee._id' },
                full_name: '$employee.full_name',
                email: '$employee.email',
                department: '$employee.department',
                profile_photo: '$employee.profile_photo'
              },
              else: null
            }
          }
        }
      }
    ]).toArray()
    
    return timeEntries
  } catch (error) {
    console.error("[getAllTimeEntries] Error getting all time entries:", error)
    return []
  }
}

export async function getCurrentTimeEntry(employeeId: string): Promise<TimeEntry | null> {
  try {
    const timeEntriesCollection = await getTimeEntriesCollection()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Handle ObjectId conversion safely
    let employeeObjectId;
    if (employeeId instanceof ObjectId) {
      employeeObjectId = employeeId;
    } else if (ObjectId.isValid(employeeId)) {
      employeeObjectId = new ObjectId(employeeId);
    } else {
      console.error("Invalid employeeId format:", employeeId);
      return null;
    }
    
    return await timeEntriesCollection.findOne({
      employee_id: employeeObjectId,
      date: { $gte: today },
      status: { $in: ['active', 'break'] }
    })
  } catch (error) {
    console.error(" Error getting current time entry:", error)
    return null
  }
}

export async function clockIn(employeeId: string, location?: string, ipAddress?: string, deviceInfo?: string): Promise<{ success: boolean; data?: TimeEntry; error?: string }> {
  try {
    console.log("[Clock In] Starting clock in for employee:", employeeId);
    const timeEntriesCollection = await getTimeEntriesCollection()
    
    // Validate employeeId format
    if (!ObjectId.isValid(employeeId)) {
      console.error("[Clock In] Invalid employeeId format:", employeeId);
      return {
        success: false,
        error: "Invalid employee ID format"
      }
    }
    
    // Check if already clocked in today
    const existingEntry = await getCurrentTimeEntry(employeeId)
    if (existingEntry) {
      console.log("[Clock In] Employee already clocked in today");
      return {
        success: false,
        error: "Already clocked in for today"
      }
    }

    const now = new Date()
    const today = new Date(now.toDateString())
    
    const newEntry: TimeEntry = {
      employee_id: new ObjectId(employeeId),
      clock_in: now,
      break_duration: 0,
      date: today,
      status: 'active',
      location,
      ip_address: ipAddress,
      device_info: deviceInfo,
      created_at: now,
      updated_at: now,
    }

    console.log("[Clock In] Inserting new time entry:", newEntry);
    const result = await timeEntriesCollection.insertOne(newEntry)
    console.log("[Clock In] Insert result:", result);

    return {
      success: true,
      data: { ...newEntry, _id: result.insertedId },
    }
  } catch (error) {
    console.error(" Error clocking in:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function clockOut(employeeId: string): Promise<{ success: boolean; data?: TimeEntry; error?: string }> {
  try {
    const timeEntriesCollection = await getTimeEntriesCollection()
    
    const currentEntry = await getCurrentTimeEntry(employeeId)
    if (!currentEntry) {
      return {
        success: false,
        error: "No active time entry found"
      }
    }

    const now = new Date()
    const totalMs = now.getTime() - currentEntry.clock_in.getTime()
    const breakMs = currentEntry.break_duration * 60 * 1000
    const totalHours = Math.max(0, (totalMs - breakMs) / (1000 * 60 * 60))

    const updatedEntry = await timeEntriesCollection.findOneAndUpdate(
      { _id: currentEntry._id },
      {
        $set: {
          clock_out: now,
          total_hours: totalHours,
          status: 'completed',
          updated_at: now,
        }
      },
      { returnDocument: 'after' }
    )

    return {
      success: true,
      data: updatedEntry,
    }
  } catch (error) {
    console.error(" Error clocking out:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function startBreak(employeeId: string): Promise<{ success: boolean; data?: TimeEntry; error?: string }> {
  try {
    const timeEntriesCollection = await getTimeEntriesCollection()
    
    const currentEntry = await getCurrentTimeEntry(employeeId)
    if (!currentEntry) {
      return {
        success: false,
        error: "No active time entry found"
      }
    }

    if (currentEntry.status === 'break') {
      return {
        success: false,
        error: "Already on break"
      }
    }

    const now = new Date()
    const updatedEntry = await timeEntriesCollection.findOneAndUpdate(
      { _id: currentEntry._id },
      {
        $set: {
          break_start: now,
          status: 'break',
          updated_at: now,
        }
      },
      { returnDocument: 'after' }
    )

    return {
      success: true,
      data: updatedEntry,
    }
  } catch (error) {
    console.error(" Error starting break:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function endBreak(employeeId: string): Promise<{ success: boolean; data?: TimeEntry; error?: string }> {
  try {
    const timeEntriesCollection = await getTimeEntriesCollection()
    
    const currentEntry = await getCurrentTimeEntry(employeeId)
    if (!currentEntry) {
      return {
        success: false,
        error: "No active time entry found"
      }
    }

    if (currentEntry.status !== 'break' || !currentEntry.break_start) {
      return {
        success: false,
        error: "Not currently on break"
      }
    }

    const now = new Date()
    const breakDuration = now.getTime() - currentEntry.break_start.getTime()
    const totalBreakMs = currentEntry.break_duration * 60 * 1000 + breakDuration
    const totalBreakMinutes = totalBreakMs / (1000 * 60)

    const updatedEntry = await timeEntriesCollection.findOneAndUpdate(
      { _id: currentEntry._id },
      {
        $set: {
          break_end: now,
          break_duration: totalBreakMinutes,
          status: 'active',
          updated_at: now,
        }
      },
      { returnDocument: 'after' }
    )

    return {
      success: true,
      data: updatedEntry,
    }
  } catch (error) {
    console.error(" Error ending break:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Finance operations
export async function getEmployeeFinances(employeeId: string): Promise<EmployeeFinance | null> {
  try {
    const employeeFinancesCollection = await getEmployeeFinancesCollection()
    return await employeeFinancesCollection.findOne({ employee_id: new ObjectId(employeeId) })
  } catch (error) {
    console.error(" Error getting employee finances:", error)
    return null
  }
}

export async function getAllEmployeeFinances(): Promise<EmployeeFinance[]> {
  try {
    const employeeFinancesCollection = await getEmployeeFinancesCollection()
    const usersCollection = await getUsersCollection()
    
    const finances = await employeeFinancesCollection.find({}).toArray()
    
    // Populate employee data for each finance record
    const populatedFinances = await Promise.all(
      finances.map(async (finance) => {
        const employee = await usersCollection.findOne({ 
          _id: new ObjectId(finance.employee_id) 
        })
        
        return {
          ...finance,
          employee: employee ? {
            id: employee._id.toString(),
            full_name: employee.full_name || employee.name || "",
            email: employee.email || "",
            department: employee.department || "",
            position: employee.position || "",
            profile_photo: employee.profile_photo || "",
          } : null
        }
      })
    )
    
    return populatedFinances
  } catch (error) {
    console.error(" Error getting all employee finances:", error)
    return []
  }
}

export const getAllFinances = getAllEmployeeFinances

export async function getPayrollRecordsByEmployee(employeeId: string): Promise<PayrollRecord[]> {
  try {
    const payrollRecordsCollection = await getPayrollRecordsCollection()
    return await payrollRecordsCollection
      .find({ employee_id: new ObjectId(employeeId) })
      .sort({ pay_period_end: -1 })
      .toArray()
  } catch (error) {
    console.error(" Error getting payroll records by employee:", error)
    return []
  }
}

export async function getAllPayrollRecords(): Promise<PayrollRecord[]> {
  try {
    const payrollRecordsCollection = await getPayrollRecordsCollection()
    const usersCollection = await getUsersCollection()
    
    const payrollRecords = await payrollRecordsCollection.find({}).sort({ pay_period_end: -1 }).toArray()
    
    // Populate employee data for each payroll record
    const populatedPayrollRecords = await Promise.all(
      payrollRecords.map(async (record) => {
        const employee = await usersCollection.findOne({ 
          _id: new ObjectId(record.employee_id) 
        })
        
        return {
          ...record,
          employee: employee ? {
            id: employee._id.toString(),
            full_name: employee.full_name || employee.name || "",
            email: employee.email || "",
            department: employee.department || "",
            position: employee.position || "",
            profile_photo: employee.profile_photo || "",
          } : null
        }
      })
    )
    
    return populatedPayrollRecords
  } catch (error) {
    console.error(" Error getting all payroll records:", error)
    return []
  }
}

// Statistics operations
export async function getEmployeeStats() {
  try {
    const usersCollection = await getUsersCollection()
    const leaveRequestsCollection = await getLeaveRequestsCollection()
    const timeEntriesCollection = await getTimeEntriesCollection()

    const [totalEmployees, pendingLeaveRequests, todayAttendance] = await Promise.all([
      usersCollection.countDocuments({ role: { $in: ["hr", "employee"] } }),
      leaveRequestsCollection.countDocuments({ status: "pending" }),
      timeEntriesCollection.countDocuments({
        date: new Date(new Date().toDateString()),
      }),
    ])

    return {
      totalEmployees,
      pendingLeaveRequests,
      todayAttendance,
    }
  } catch (error) {
    console.error(" Error getting employee stats:", error)
    return {
      totalEmployees: 0,
      pendingLeaveRequests: 0,
      todayAttendance: 0,
    }
  }
}
