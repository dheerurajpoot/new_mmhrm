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
    
    // Populate employee data for each leave request
    const populatedLeaveRequests = await Promise.all(
      leaveRequests.map(async (request) => {
        const employee = await usersCollection.findOne({ 
          _id: new ObjectId(request.employee_id) 
        })
        
        return {
          ...request,
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
    const timeEntriesCollection = await getTimeEntriesCollection()

    const query: any = { employee_id: new ObjectId(employeeId) }

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate }
    }

    return await timeEntriesCollection.find(query).sort({ clock_in: -1 }).toArray()
  } catch (error) {
    console.error(" Error getting time entries by employee:", error)
    return []
  }
}

export async function createTimeEntry(timeEntryData: {
  employee_id: string
  clock_in: Date
  clock_out?: Date
  break_duration?: number
  notes?: string
}): Promise<{ success: boolean; data?: TimeEntry; error?: string }> {
  try {
    const timeEntriesCollection = await getTimeEntriesCollection()

    const newEntry: TimeEntry = {
      employee_id: new ObjectId(timeEntryData.employee_id),
      clock_in: timeEntryData.clock_in,
      clock_out: timeEntryData.clock_out,
      break_duration: timeEntryData.break_duration || 0,
      notes: timeEntryData.notes,
      date: new Date(timeEntryData.clock_in.toDateString()),
      created_at: new Date(),
      updated_at: new Date(),
    }

    // Calculate total hours if clock_out is provided
    if (newEntry.clock_out) {
      const totalMs = newEntry.clock_out.getTime() - newEntry.clock_in.getTime()
      const totalHours = totalMs / (1000 * 60 * 60) - newEntry.break_duration / 60
      newEntry.total_hours = Math.max(0, totalHours)
    }

    const result = await timeEntriesCollection.insertOne(newEntry)

    return {
      success: true,
      data: { ...newEntry, _id: result.insertedId },
    }
  } catch (error) {
    console.error(" Error creating time entry:", error)
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
