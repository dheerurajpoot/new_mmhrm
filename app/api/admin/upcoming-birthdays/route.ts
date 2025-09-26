import { NextRequest, NextResponse } from "next/server"
import { getServerUser } from "@/lib/auth/server"
import { getProfilesCollection } from "@/lib/mongodb/collections"

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user || !["admin", "hr"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      console.log("Starting to fetch upcoming birthdays...")
      const profilesCollection = await getProfilesCollection()
      const today = new Date()
      const currentYear = today.getFullYear()
      
      // Get all employees with birth dates
      const employees = await profilesCollection
        .find({ 
          birth_date: { $exists: true, $ne: null, $ne: "" },
          role: { $in: ["employee", "hr"] } // Include employees and HR, exclude admin
        })
        .toArray()
      
      console.log("Found employees with birth dates:", employees.length)
      console.log("Employee details:", employees.map(emp => ({
        name: emp.full_name || emp.email,
        birth_date: emp.birth_date,
        role: emp.role
      })))

      // Calculate upcoming birthdays
      const birthdayData = employees
        .map(emp => {
          try {
            const birthDate = new Date(emp.birth_date)
            
            // Validate birth date
            if (isNaN(birthDate.getTime())) {
              console.log("Invalid birth date for employee:", emp.full_name || emp.email, emp.birth_date)
              return null
            }
            
            const birthMonth = birthDate.getMonth()
            const birthDay = birthDate.getDate()
            
            // Calculate this year's birthday
            let thisYearBirthday = new Date(currentYear, birthMonth, birthDay)
            
            // If birthday has passed this year, use next year's date
            if (thisYearBirthday < today) {
              thisYearBirthday = new Date(currentYear + 1, birthMonth, birthDay)
            }
            
            const daysUntilBirthday = Math.ceil(
              (thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            )
            
            const age = currentYear - birthDate.getFullYear()
            const monthNames = [
              'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ]
            
            return {
              id: emp._id.toString(),
              full_name: emp.full_name || emp.email,
              email: emp.email,
              department: emp.department || 'Not specified',
              position: emp.position || 'Not specified',
              profile_photo: emp.profile_photo,
              birth_date: emp.birth_date,
              role: emp.role,
              daysUntilBirthday,
              birthdayMonth: monthNames[birthMonth],
              birthdayDay: birthDay,
              age: thisYearBirthday.getFullYear() === currentYear ? age : age + 1
            }
          } catch (error) {
            console.error("Error processing birthday for employee:", emp.full_name || emp.email, error)
            return null
          }
        })
        .filter(Boolean) // Remove null entries
        .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday) // Sort by closest birthday
        .slice(0, 4) // Get only 4 upcoming birthdays

      console.log("Birthday data calculated:", birthdayData.length)
      console.log("Birthdays:", birthdayData.map(b => ({ name: b.full_name, days: b.daysUntilBirthday, date: `${b.birthdayMonth} ${b.birthdayDay}` })))

      return NextResponse.json(birthdayData)
    } catch (dbError) {
      console.error("Database error:", dbError)
      // Return empty array instead of mock data
      return NextResponse.json([])
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
