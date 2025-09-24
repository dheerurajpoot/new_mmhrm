import { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  password: string
  full_name?: string
  role: "admin" | "hr" | "employee"
  department?: string
  position?: string
  hire_date?: Date
  birth_date?: Date
  phone?: string
  address?: string
  profile_photo?: string
  created_at: Date
  updated_at: Date
}

export interface Profile {
  _id?: ObjectId
  user_id: ObjectId
  email: string
  full_name?: string
  role: "admin" | "hr" | "employee"
  department?: string
  position?: string
  hire_date?: Date
  birth_date?: Date
  phone?: string
  address?: string
  profile_photo?: string
  created_at: Date
  updated_at: Date
}

export interface LeaveRequest {
  _id?: ObjectId
  employee_id: ObjectId
  leave_type: string
  start_date: Date
  end_date: Date
  days_requested: number
  reason?: string
  status: "pending" | "approved" | "rejected"
  approved_by?: ObjectId
  approved_at?: Date
  created_at: Date
  updated_at: Date
}

export interface LeaveBalance {
  _id?: ObjectId
  employee_id: ObjectId
  leave_type: string
  year: number
  total_days: number
  used_days: number
  remaining_days: number
  created_at: Date
  updated_at: Date
}

export interface LeaveType {
  _id?: ObjectId
  name: string
  description?: string
  max_days_per_year: number
  carry_forward: boolean
  created_at: Date
  updated_at: Date
}

export interface TimeEntry {
  _id?: ObjectId
  employee_id: ObjectId
  clock_in: Date
  clock_out?: Date
  break_duration: number
  total_hours?: number
  notes?: string
  date: Date
  created_at: Date
  updated_at: Date
}

export interface WFHRequest {
  _id?: ObjectId
  employee_id: ObjectId
  request_date: Date
  reason?: string
  status: "pending" | "approved" | "rejected"
  approved_by?: ObjectId
  approved_at?: Date
  created_at: Date
  updated_at: Date
}

export interface EmployeeFinance {
  _id?: ObjectId
  employee_id: ObjectId
  base_salary?: number
  hourly_rate?: number
  currency: string
  pay_frequency: string
  bank_account?: string
  tax_id?: string
  created_at: Date
  updated_at: Date
}

export interface PayrollRecord {
  _id?: ObjectId
  employee_id: ObjectId
  pay_period_start: Date
  pay_period_end: Date
  gross_pay: number
  deductions: number
  net_pay: number
  status: "pending" | "paid" | "cancelled"
  created_at: Date
  updated_at: Date
}

export interface Session {
  _id?: ObjectId
  user_id: ObjectId
  token: string
  expires_at: Date
  created_at: Date
}

export interface WebsiteSettings {
  _id?: ObjectId
  site_name: string
  site_title: string
  site_logo?: string
  primary_color: string
  secondary_color: string
  theme: "light" | "dark" | "auto"
  footer_text?: string
  contact_email?: string
  contact_phone?: string
  created_at: Date
  updated_at: Date
}

export interface EmailVerificationToken {
  _id?: ObjectId
  email: string
  token: string
  full_name: string
  role: "admin" | "hr" | "employee"
  expires_at: Date
  used: boolean
  created_at: Date
}

export interface Team {
  _id?: ObjectId
  name: string
  leader_id: ObjectId
  member_ids: ObjectId[]
  created_at: Date
  updated_at: Date
}