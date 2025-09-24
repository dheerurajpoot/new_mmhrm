"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, CreditCard, TrendingUp, Calendar } from "lucide-react"
import type { EmployeeFinances as EmployeeFinancesType } from "@/lib/types"

interface PayrollRecord {
  id: string
  pay_period_start: string
  pay_period_end: string
  gross_pay: number
  deductions: number
  net_pay: number
  overtime_hours: number
  overtime_pay: number
  bonus: number
  status: string
  created_at: string
}

export function EmployeeFinancesComponent() {
  const [finances, setFinances] = useState<EmployeeFinancesType | null>(null)
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFinancialData()
  }, [])

  const fetchFinancialData = async () => {
    try {
      const [financesResponse, payrollResponse] = await Promise.all([
        fetch("/api/employee/finances"),
        fetch("/api/employee/payroll"),
      ])

      if (financesResponse.ok) {
        const financeData = await financesResponse.json()
        setFinances(financeData)
      }

      if (payrollResponse.ok) {
        const payrollData = await payrollResponse.json()
        setPayrollRecords(payrollData || [])
      }
    } catch (error) {
      console.error("Error fetching financial data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "processed":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "pending":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Base Salary</p>
                <p className="text-2xl font-bold text-gray-900">
                  {finances?.base_salary ? `$${finances.base_salary.toLocaleString()}` : "Not set"}
                </p>
                <p className="text-xs text-gray-500">Monthly</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hourly Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {finances?.hourly_rate ? `$${finances.hourly_rate}` : "Not set"}
                </p>
                <p className="text-xs text-gray-500">Per hour</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pay Frequency</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{finances?.pay_frequency || "Not set"}</p>
                <p className="text-xs text-gray-500">Payment schedule</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Currency</p>
                <p className="text-2xl font-bold text-gray-900">{finances?.currency || "USD"}</p>
                <p className="text-xs text-gray-500">Payment currency</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll History */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll History</CardTitle>
          <CardDescription>Your recent payroll records and payments</CardDescription>
        </CardHeader>
        <CardContent>
          {payrollRecords.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pay Period</TableHead>
                    <TableHead className="hidden md:table-cell">Gross Pay</TableHead>
                    <TableHead className="hidden lg:table-cell">Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(record.pay_period_start).toLocaleDateString()}</p>
                          <p className="text-gray-500">to {new Date(record.pay_period_end).toLocaleDateString()}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="font-medium">${record.gross_pay.toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-red-600">-${record.deductions.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-blue-600">${record.net_pay.toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className={getStatusBadgeColor(record.status)}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No payroll records found.</p>
              <p className="text-sm text-gray-400 mt-2">
                Payroll records will appear here once they are processed by HR.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Information */}
      {finances && (
        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
            <CardDescription>Your employment financial details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Bank Account</p>
                  <p className="text-gray-900">
                    {finances.bank_account ? `****${finances.bank_account.slice(-4)}` : "Not provided"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Tax ID</p>
                  <p className="text-gray-900">
                    {finances.tax_id ? `****${finances.tax_id.slice(-4)}` : "Not provided"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-800">Annual Salary</p>
                  <p className="text-2xl font-bold text-red-900">
                    {finances.base_salary ? `$${(finances.base_salary * 12).toLocaleString()}` : "Not calculated"}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Payment Method</p>
                  <p className="text-blue-900">Direct Deposit</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { EmployeeFinancesComponent as EmployeeFinances }
