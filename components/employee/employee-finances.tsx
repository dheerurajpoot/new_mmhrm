"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, CreditCard, TrendingUp, Calendar, Eye, EyeOff, Banknote, PiggyBank, Receipt, Shield, Lock, Unlock } from "lucide-react"
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

interface EmployeeFinancesComponentProps {
  sectionData?: any;
}

export function EmployeeFinancesComponent({ sectionData }: EmployeeFinancesComponentProps) {
  const [finances, setFinances] = useState<EmployeeFinancesType | null>(null)
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showBaseSalary, setShowBaseSalary] = useState(false)
  const [showAnnualSalary, setShowAnnualSalary] = useState(false)

  // Helper function to format currency
  const formatCurrency = (amount: number, currency: string = "USD") => {
    const currencySymbols: { [key: string]: string } = {
      "USD": "$",
      "INR": "₹",
      "EUR": "€",
      "GBP": "£",
      "JPY": "¥",
      "CAD": "C$",
      "AUD": "A$"
    }
    
    const symbol = currencySymbols[currency] || currency
    return `${symbol}${amount.toLocaleString()}`
  }

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
    <div className="space-y-8">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Base Salary Card with Blur Effect */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 border-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-medium text-emerald-700">Base Salary</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-emerald-100"
                    onClick={() => setShowBaseSalary(!showBaseSalary)}
                  >
                    {showBaseSalary ? (
                      <EyeOff className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Eye className="w-3 h-3 text-emerald-600" />
                    )}
                  </Button>
                </div>
                <div className="relative">
                  <p className={`text-2xl font-bold transition-all duration-300 ${
                    showBaseSalary ? 'text-emerald-900' : 'text-emerald-900 blur-sm select-none'
                  }`}>
                    {finances?.base_salary ? formatCurrency(finances.base_salary, finances?.currency) : "Not set"}
                  </p>
                  {!showBaseSalary && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-emerald-500" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-emerald-600 mt-1">Monthly</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Banknote className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Rate Card */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50 via-white to-blue-50/30 border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-700 mb-2">Hourly Rate</p>
                <p className="text-2xl font-bold text-blue-900">
                  {finances?.hourly_rate ? formatCurrency(finances.hourly_rate, finances?.currency) : "Not set"}
                </p>
                <p className="text-xs text-blue-600 mt-1">Per hour</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pay Frequency Card */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-purple-50 via-white to-purple-50/30 border-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-700 mb-2">Pay Frequency</p>
                <p className="text-2xl font-bold text-purple-900 capitalize">{finances?.pay_frequency || "Not set"}</p>
                <p className="text-xs text-purple-600 mt-1">Payment schedule</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currency Card */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-amber-50 via-white to-amber-50/30 border-amber-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-700 mb-2">Currency</p>
                <p className="text-2xl font-bold text-amber-900">{finances?.currency || "USD"}</p>
                <p className="text-xs text-amber-600 mt-1">Payment currency</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <CreditCard className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll History */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 via-white to-slate-50/30 border-slate-100">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-slate-900">Payroll History</CardTitle>
              <CardDescription className="text-slate-600">Your recent payroll records and payments</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {payrollRecords.length > 0 ? (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead className="text-slate-700 font-semibold">Pay Period</TableHead>
                    <TableHead className="hidden md:table-cell text-slate-700 font-semibold">Gross Pay</TableHead>
                    <TableHead className="hidden lg:table-cell text-slate-700 font-semibold">Deductions</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Net Pay</TableHead>
                    <TableHead className="hidden sm:table-cell text-slate-700 font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.map((record, index) => (
                    <TableRow key={record.id} className={`hover:bg-slate-50/50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                    }`}>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-slate-900">{new Date(record.pay_period_start).toLocaleDateString()}</p>
                          <p className="text-slate-500">to {new Date(record.pay_period_end).toLocaleDateString()}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="font-semibold text-slate-900">{formatCurrency(record.gross_pay, finances?.currency)}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="font-medium text-red-600">-{formatCurrency(record.deductions, finances?.currency)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-emerald-600 text-lg">{formatCurrency(record.net_pay, finances?.currency)}</span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className={`${getStatusBadgeColor(record.status)} border-0 shadow-sm`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-600 font-medium">No payroll records found</p>
              <p className="text-sm text-slate-400 mt-2">
                Payroll records will appear here once they are processed by HR.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Information */}
      {finances && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 via-white to-indigo-50/30 border-indigo-100">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 border-b border-indigo-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-indigo-900">Financial Information</CardTitle>
                <CardDescription className="text-indigo-600">Your employment financial details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-slate-600" />
                    <p className="text-sm font-medium text-slate-700">Bank Account</p>
                  </div>
                  <p className="text-slate-900 font-semibold">
                    {finances.bank_account ? `****${finances.bank_account.slice(-4)}` : "Not provided"}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-slate-600" />
                    <p className="text-sm font-medium text-slate-700">Tax ID</p>
                  </div>
                  <p className="text-slate-900 font-semibold">
                    {finances.tax_id ? `****${finances.tax_id.slice(-4)}` : "Not provided"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <p className="text-sm font-medium text-emerald-700">Annual Salary</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-emerald-100"
                      onClick={() => setShowAnnualSalary(!showAnnualSalary)}
                    >
                      {showAnnualSalary ? (
                        <EyeOff className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Eye className="w-3 h-3 text-emerald-600" />
                      )}
                    </Button>
                  </div>
                  <div className="relative">
                    <p className={`text-2xl font-bold transition-all duration-300 ${
                      showAnnualSalary ? 'text-emerald-900' : 'text-emerald-900 blur-sm select-none'
                    }`}>
                      {finances.base_salary ? formatCurrency(finances.base_salary * 12, finances.currency) : "Not calculated"}
                    </p>
                    {!showAnnualSalary && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-emerald-500" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium text-blue-700">Payment Method</p>
                  </div>
                  <p className="text-blue-900 font-semibold">Direct Deposit</p>
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
