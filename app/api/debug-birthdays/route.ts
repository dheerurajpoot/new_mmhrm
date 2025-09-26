import { NextRequest, NextResponse } from "next/server"
import { getServerUser } from "@/lib/auth/server"
import { getProfilesCollection, getUsersCollection } from "@/lib/mongodb/collections"

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Try profiles collection first
    const profilesCollection = await getProfilesCollection()
    let employees = await profilesCollection.find({}).toArray()
    console.log("Debug: Found profiles:", employees.length)
    
    // If profiles collection is empty, try users collection
    if (employees.length === 0) {
      const usersCollection = await getUsersCollection()
      const users = await usersCollection.find({}).toArray()
      employees = users.map((user: any) => ({
        ...user,
        user_id: user._id,
      }))
      console.log("Debug: Found users:", users.length)
    }

    // Check for birth dates
    const employeesWithBirthDates = employees.filter(emp => emp.birth_date)
    console.log("Debug: Employees with birth dates:", employeesWithBirthDates.length)

    // Sample data
    const sampleEmployees = employees.slice(0, 3).map(emp => ({
      id: emp._id?.toString?.() || emp._id,
      full_name: emp.full_name || emp.email,
      email: emp.email,
      birth_date: emp.birth_date,
      role: emp.role
    }))

    return NextResponse.json({
      totalEmployees: employees.length,
      employeesWithBirthDates: employeesWithBirthDates.length,
      sampleEmployees,
      allEmployees: employees.map(emp => ({
        id: emp._id?.toString?.() || emp._id,
        full_name: emp.full_name || emp.email,
        email: emp.email,
        birth_date: emp.birth_date,
        role: emp.role
      }))
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
