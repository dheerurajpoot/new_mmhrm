import { getDatabase } from "./connection"
import type {
  User,
  Profile,
  LeaveRequest,
  LeaveBalance,
  LeaveType,
  TimeEntry,
  WFHRequest,
  EmployeeFinance,
  PayrollRecord,
  Session,
  EmailVerificationToken,
} from "./models"

export async function getUsersCollection() {
  const db = await getDatabase()
  return db.collection<User>("users")
}

export async function getProfilesCollection() {
  const db = await getDatabase()
  return db.collection<Profile>("profiles")
}

export async function getLeaveRequestsCollection() {
  const db = await getDatabase()
  return db.collection<LeaveRequest>("leave_requests")
}

export async function getLeaveBalancesCollection() {
  const db = await getDatabase()
  return db.collection<LeaveBalance>("leave_balances")
}

export async function getLeaveTypesCollection() {
  const db = await getDatabase()
  return db.collection<LeaveType>("leave_types")
}

export async function getTimeEntriesCollection() {
  const db = await getDatabase()
  return db.collection<TimeEntry>("time_entries")
}

export async function getWFHRequestsCollection() {
  const db = await getDatabase()
  return db.collection<WFHRequest>("wfh_requests")
}

export async function getEmployeeFinancesCollection() {
  const db = await getDatabase()
  return db.collection<EmployeeFinance>("employee_finances")
}

export async function getPayrollRecordsCollection() {
  const db = await getDatabase()
  return db.collection<PayrollRecord>("payroll_records")
}

export async function getSessionsCollection() {
  const db = await getDatabase()
  return db.collection<Session>("sessions")
}

export async function getWebsiteSettingsCollection() {
  const db = await getDatabase()
  return db.collection("websiteSettings")
}

export async function getEmailVerificationTokensCollection() {
  const db = await getDatabase()
  return db.collection<EmailVerificationToken>("emailVerificationTokens")
}

// Initialize database indexes
export async function initializeIndexes() {
  try {
    const usersCollection = await getUsersCollection()
    const profilesCollection = await getProfilesCollection()
    const leaveRequestsCollection = await getLeaveRequestsCollection()
    const leaveBalancesCollection = await getLeaveBalancesCollection()
    const timeEntriesCollection = await getTimeEntriesCollection()
    const sessionsCollection = await getSessionsCollection()

    // Create indexes for better performance
    await usersCollection.createIndex({ email: 1 }, { unique: true })
    await profilesCollection.createIndex({ user_id: 1 }, { unique: true })
    await profilesCollection.createIndex({ email: 1 }, { unique: true })
    await leaveRequestsCollection.createIndex({ employee_id: 1 })
    await leaveRequestsCollection.createIndex({ status: 1 })
    await leaveBalancesCollection.createIndex({ employee_id: 1, leave_type: 1, year: 1 }, { unique: true })
    await timeEntriesCollection.createIndex({ employee_id: 1 })
    await timeEntriesCollection.createIndex({ date: 1 })
    await sessionsCollection.createIndex({ token: 1 }, { unique: true })
    await sessionsCollection.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })

    console.log(" Database indexes initialized successfully")
  } catch (error) {
    console.error(" Error initializing database indexes:", error)
  }
}
