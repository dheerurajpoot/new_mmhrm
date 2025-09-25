import { type NextRequest, NextResponse } from "next/server"
import { getServerUser } from "@/lib/auth/server"
import { getAllUsers } from "@/lib/mongodb/operations"

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Allow all authenticated users (admin, hr, employee) to search employees
    let employees: any[] = []
    
    try {
      employees = await getAllUsers()
      console.log("Fetched employees from database:", employees.length)
    } catch (dbError) {
      console.error("Database error, using mock data:", dbError)
      // Fallback to mock data if database is not available
      employees = [
        {
          _id: "1",
          email: "admin@mmhrm.com",
          full_name: "System Administrator",
          role: "admin",
          department: "IT",
          position: "System Admin",
          phone: "+1 (555) 123-4567",
          address: "123 Admin St, City, State",
          profile_photo: null,
          birth_date: "1985-01-15",
          hire_date: "2020-01-01",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          _id: "2",
          email: "hr@mmhrm.com",
          full_name: "HR Manager",
          role: "hr",
          department: "Human Resources",
          position: "HR Manager",
          phone: "+1 (555) 234-5678",
          address: "456 HR Ave, City, State",
          profile_photo: null,
          birth_date: "1988-05-20",
          hire_date: "2019-06-15",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          _id: "3",
          email: "employee@mmhrm.com",
          full_name: "John Employee",
          role: "employee",
          department: "Engineering",
          position: "Software Developer",
          phone: "+1 (555) 345-6789",
          address: "789 Dev Blvd, City, State",
          profile_photo: null,
          birth_date: "1990-08-10",
          hire_date: "2021-03-01",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          _id: "4",
          email: "jane.doe@mmhrm.com",
          full_name: "Jane Doe",
          role: "employee",
          department: "Marketing",
          position: "Marketing Specialist",
          phone: "+1 (555) 456-7890",
          address: "321 Marketing St, City, State",
          profile_photo: null,
          birth_date: "1992-12-05",
          hire_date: "2022-01-15",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          _id: "5",
          email: "bob.smith@mmhrm.com",
          full_name: "Bob Smith",
          role: "employee",
          department: "Sales",
          position: "Sales Representative",
          phone: "+1 (555) 567-8901",
          address: "654 Sales Rd, City, State",
          profile_photo: null,
          birth_date: "1987-03-25",
          hire_date: "2020-09-10",
          created_at: new Date(),
          updated_at: new Date(),
        }
      ]
    }

    // Transform the data to match the expected format
    const transformedEmployees = employees.map((emp: any) => ({
      id: emp._id?.toString?.() || emp._id,
      email: emp.email || "",
      full_name: emp.full_name || "",
      role: emp.role || "employee",
      department: emp.department || "",
      position: emp.position || "",
      phone: emp.phone || "",
      address: emp.address || "",
      profile_photo: emp.profile_photo || null,
      birth_date: emp.birth_date || null,
      hire_date: emp.hire_date || null,
      created_at: emp.created_at || new Date(),
      updated_at: emp.updated_at || new Date(),
    }))

    console.log("Returning transformed employees:", transformedEmployees.length)
    return NextResponse.json(transformedEmployees)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
