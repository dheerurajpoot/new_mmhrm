export type UserRole = "admin" | "hr" | "employee"

export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  department: string | null
  position: string | null
  hire_date: string | null
  phone: string | null
  address: string | null
  profile_photo: string | null
  created_at: string
  updated_at: string
}

export type LeaveRequest = {
  id: string
  employee_id: string
  leave_type: "annual" | "sick" | "personal" | "maternity" | "paternity" | "emergency"
  start_date: string
  end_date: string
  days_requested: number
  reason: string | null
  status: "pending" | "approved" | "rejected"
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export type LeaveBalance = {
  id: string
  employee_id: string
  leave_type: "annual" | "sick" | "personal" | "maternity" | "paternity" | "emergency"
  total_days: number
  used_days: number
  remaining_days: number
  year: number
  created_at: string
  updated_at: string
}

export type TimeEntry = {
  id: string
  employee_id: string
  clock_in: string
  clock_out: string | null
  break_duration: number
  total_hours: number
  notes: string | null
  date: string
  created_at: string
  updated_at: string
}

export type WFHRequest = {
  id: string
  employee_id: string
  request_date: string
  reason: string | null
  status: "pending" | "approved" | "rejected"
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export type EmployeeFinances = {
  id: string
  employee_id: string
  base_salary: number | null
  hourly_rate: number | null
  currency: string
  pay_frequency: string
  bank_account: string | null
  tax_id: string | null
  created_at: string
  updated_at: string
}
