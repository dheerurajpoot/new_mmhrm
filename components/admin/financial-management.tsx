"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Edit, Plus, Trash2, Calculator } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  updateEmployeeFinances,
  createPayrollRecord,
  updatePayrollRecord,
  deletePayrollRecord,
} from "@/app/actions/admin"

interface Employee {
  id: string
  full_name: string
  email: string
  department: string
  position: string
}

interface EmployeeFinance {
  id: string
  employee_id: string
  base_salary: number
  hourly_rate: number
  pay_frequency: string
  bank_account: string
  tax_id: string
  currency: string
  employee: Employee
}

interface PayrollRecord {
  id: string
  employee_id: string
  pay_period_start: string
  pay_period_end: string
  gross_pay: number
  deductions: number
  net_pay: number
  overtime_hours: number
  overtime_pay: number
  bonus: number
  status: string
  employee: Employee
}

export function FinancialManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeFinances, setEmployeeFinances] = useState<EmployeeFinance[]>([])
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isFinanceDialogOpen, setIsFinanceDialogOpen] = useState(false)
  const [isPayrollDialogOpen, setIsPayrollDialogOpen] = useState(false)
  const [editingFinance, setEditingFinance] = useState<EmployeeFinance | null>(null)
  const [editingPayroll, setEditingPayroll] = useState<PayrollRecord | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")

  const [financeFormData, setFinanceFormData] = useState({
    employee_id: "",
    base_salary: "",
    hourly_rate: "",
    pay_frequency: "monthly",
    bank_account: "",
    tax_id: "",
    currency: "USD",
  })

  const [payrollFormData, setPayrollFormData] = useState({
    employee_id: "",
    pay_period_start: "",
    pay_period_end: "",
    gross_pay: "",
    deductions: "",
    net_pay: "",
    overtime_hours: "",
    overtime_pay: "",
    bonus: "",
    status: "pending",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [employeesRes, financesRes, payrollRes] = await Promise.all([
        fetch("/api/employees"),
        fetch("/api/finances"),
        fetch("/api/payroll"),
      ])

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json()
        // Normalize Mongo docs to component Employee shape
        const mappedEmployees: Employee[] = (employeesData || []).map((u: any) => ({
          id: u._id?.toString?.() || u._id || u.id,
          full_name: u.full_name || u.name || "",
          email: u.email,
          department: u.department || "",
          position: u.position || "",
        }))
        setEmployees(mappedEmployees)
      }

      if (financesRes.ok) {
        const financesData = await financesRes.json()
        // Normalize and enrich with employee display where possible
        const mappedFinances: EmployeeFinance[] = (financesData || []).map((f: any) => {
          const employeeId = f.employee_id?.toString?.() || f.employee_id
          const employee = employees.find((e) => e.id === employeeId)
          return {
            id: f._id?.toString?.() || f._id || f.id,
            employee_id: employeeId,
            base_salary: f.base_salary ?? 0,
            hourly_rate: f.hourly_rate ?? 0,
            pay_frequency: f.pay_frequency || "monthly",
            bank_account: f.bank_account || "",
            tax_id: f.tax_id || "",
            currency: f.currency || "USD",
            employee: employee || ({ id: employeeId, full_name: f.employee_name || "", email: "", department: "", position: "" } as any),
          }
        })
        setEmployeeFinances(mappedFinances)
      }

      if (payrollRes.ok) {
        const payrollData = await payrollRes.json()
        setPayrollRecords(payrollData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch financial data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFinanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateEmployeeFinances(
        editingFinance ? editingFinance.employee_id : financeFormData.employee_id,
        {
          base_salary: Number.parseFloat(financeFormData.base_salary) || 0,
          hourly_rate: Number.parseFloat(financeFormData.hourly_rate) || 0,
          pay_frequency: financeFormData.pay_frequency,
          bank_account: financeFormData.bank_account,
          tax_id: financeFormData.tax_id,
          currency: financeFormData.currency,
        },
      )

      if (result.success) {
        toast({
          title: "Success",
          description: "Employee finances updated successfully",
        })
        setIsFinanceDialogOpen(false)
        setEditingFinance(null)
        resetFinanceForm()
        fetchData()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update finances",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update finances",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePayrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payrollData = {
        employee_id: editingPayroll ? editingPayroll.employee_id : payrollFormData.employee_id,
        pay_period_start: payrollFormData.pay_period_start,
        pay_period_end: payrollFormData.pay_period_end,
        gross_pay: Number.parseFloat(payrollFormData.gross_pay) || 0,
        deductions: Number.parseFloat(payrollFormData.deductions) || 0,
        net_pay: Number.parseFloat(payrollFormData.net_pay) || 0,
        overtime_hours: Number.parseFloat(payrollFormData.overtime_hours) || 0,
        overtime_pay: Number.parseFloat(payrollFormData.overtime_pay) || 0,
        bonus: Number.parseFloat(payrollFormData.bonus) || 0,
        status: payrollFormData.status,
      }

      const result = editingPayroll
        ? await updatePayrollRecord(editingPayroll.id, payrollData)
        : await createPayrollRecord(payrollData)

      if (result.success) {
        toast({
          title: "Success",
          description: `Payroll record ${editingPayroll ? "updated" : "created"} successfully`,
        })
        setIsPayrollDialogOpen(false)
        setEditingPayroll(null)
        resetPayrollForm()
        fetchData()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save payroll record",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save payroll record",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePayroll = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this payroll record?")) return

    setLoading(true)
    try {
      const result = await deletePayrollRecord(recordId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Payroll record deleted successfully",
        })
        fetchData()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete payroll record",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete payroll record",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const openFinanceDialog = (finance?: EmployeeFinance) => {
    if (finance) {
      setEditingFinance(finance)
      setFinanceFormData({
        employee_id: finance.employee_id,
        base_salary: finance.base_salary?.toString() || "",
        hourly_rate: finance.hourly_rate?.toString() || "",
        pay_frequency: finance.pay_frequency || "monthly",
        bank_account: finance.bank_account || "",
        tax_id: finance.tax_id || "",
        currency: finance.currency || "USD",
      })
    } else {
      setEditingFinance(null)
      resetFinanceForm()
    }
    setIsFinanceDialogOpen(true)
  }

  const openPayrollDialog = (payroll?: PayrollRecord) => {
    if (payroll) {
      setEditingPayroll(payroll)
      setPayrollFormData({
        employee_id: payroll.employee_id,
        pay_period_start: payroll.pay_period_start,
        pay_period_end: payroll.pay_period_end,
        gross_pay: payroll.gross_pay?.toString() || "",
        deductions: payroll.deductions?.toString() || "",
        net_pay: payroll.net_pay?.toString() || "",
        overtime_hours: payroll.overtime_hours?.toString() || "",
        overtime_pay: payroll.overtime_pay?.toString() || "",
        bonus: payroll.bonus?.toString() || "",
        status: payroll.status || "pending",
      })
    } else {
      setEditingPayroll(null)
      resetPayrollForm()
    }
    setIsPayrollDialogOpen(true)
  }

  const resetFinanceForm = () => {
    setFinanceFormData({
      employee_id: "",
      base_salary: "",
      hourly_rate: "",
      pay_frequency: "monthly",
      bank_account: "",
      tax_id: "",
      currency: "USD",
    })
  }

  const resetPayrollForm = () => {
    setPayrollFormData({
      employee_id: "",
      pay_period_start: "",
      pay_period_end: "",
      gross_pay: "",
      deductions: "",
      net_pay: "",
      overtime_hours: "",
      overtime_pay: "",
      bonus: "",
      status: "pending",
    })
  }

  const calculateNetPay = () => {
    const gross = Number.parseFloat(payrollFormData.gross_pay) || 0
    const deductions = Number.parseFloat(payrollFormData.deductions) || 0
    const overtime = Number.parseFloat(payrollFormData.overtime_pay) || 0
    const bonus = Number.parseFloat(payrollFormData.bonus) || 0
    const netPay = gross + overtime + bonus - deductions
    setPayrollFormData({ ...payrollFormData, net_pay: netPay.toString() })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading && employeeFinances.length === 0) {
    return <div className="flex items-center justify-center h-64">Loading financial data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Management</h2>
          <p className="text-muted-foreground">Manage employee finances, payroll, and compensation</p>
        </div>
      </div>

      <Tabs defaultValue="finances" className="space-y-4">
        <TabsList>
          <TabsTrigger value="finances">Employee Finances</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Records</TabsTrigger>
        </TabsList>

        <TabsContent value="finances" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isFinanceDialogOpen} onOpenChange={setIsFinanceDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openFinanceDialog()}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Add Finance Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingFinance ? "Edit" : "Add"} Employee Finances</DialogTitle>
                  <DialogDescription>
                    {editingFinance ? "Update" : "Set up"} financial information for the employee
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleFinanceSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employee_id">Employee</Label>
                      <Select
                        value={financeFormData.employee_id}
                        onValueChange={(value) => setFinanceFormData({ ...financeFormData, employee_id: value })}
                        disabled={!!editingFinance}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.full_name} - {employee.position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={financeFormData.currency}
                        onValueChange={(value) => setFinanceFormData({ ...financeFormData, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="INR">INR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="base_salary">Base Salary</Label>
                      <Input
                        id="base_salary"
                        type="number"
                        step="0.01"
                        value={financeFormData.base_salary}
                        onChange={(e) => setFinanceFormData({ ...financeFormData, base_salary: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hourly_rate">Hourly Rate</Label>
                      <Input
                        id="hourly_rate"
                        type="number"
                        step="0.01"
                        value={financeFormData.hourly_rate}
                        onChange={(e) => setFinanceFormData({ ...financeFormData, hourly_rate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pay_frequency">Pay Frequency</Label>
                      <Select
                        value={financeFormData.pay_frequency}
                        onValueChange={(value) => setFinanceFormData({ ...financeFormData, pay_frequency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax_id">Tax ID</Label>
                      <Input
                        id="tax_id"
                        value={financeFormData.tax_id}
                        onChange={(e) => setFinanceFormData({ ...financeFormData, tax_id: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank_account">Bank Account</Label>
                    <Input
                      id="bank_account"
                      value={financeFormData.bank_account}
                      onChange={(e) => setFinanceFormData({ ...financeFormData, bank_account: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsFinanceDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : editingFinance ? "Update" : "Add"} Finances
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Employee Financial Records</CardTitle>
              <CardDescription>View and manage employee compensation and financial details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Base Salary</TableHead>
                      <TableHead>Hourly Rate</TableHead>
                      <TableHead>Pay Frequency</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeFinances.map((finance) => (
                      <TableRow key={finance.id}>
                        <TableCell className="font-medium">{finance.employee?.full_name}</TableCell>
                        <TableCell>
                          {finance.base_salary ? `${finance.currency} ${finance.base_salary}` : "-"}
                        </TableCell>
                        <TableCell>
                          {finance.hourly_rate ? `${finance.currency} ${finance.hourly_rate}` : "-"}
                        </TableCell>
                        <TableCell className="capitalize">{finance.pay_frequency}</TableCell>
                        <TableCell>{finance.currency}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => openFinanceDialog(finance)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isPayrollDialogOpen} onOpenChange={setIsPayrollDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openPayrollDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payroll Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{editingPayroll ? "Edit" : "Create"} Payroll Record</DialogTitle>
                  <DialogDescription>
                    {editingPayroll ? "Update" : "Create"} payroll information for the employee
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePayrollSubmit} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payroll_employee_id">Employee</Label>
                      <Select
                        value={payrollFormData.employee_id}
                        onValueChange={(value) => setPayrollFormData({ ...payrollFormData, employee_id: value })}
                        disabled={!!editingPayroll}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.full_name} - {employee.position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pay_period_start">Pay Period Start</Label>
                      <Input
                        id="pay_period_start"
                        type="date"
                        value={payrollFormData.pay_period_start}
                        onChange={(e) => setPayrollFormData({ ...payrollFormData, pay_period_start: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pay_period_end">Pay Period End</Label>
                      <Input
                        id="pay_period_end"
                        type="date"
                        value={payrollFormData.pay_period_end}
                        onChange={(e) => setPayrollFormData({ ...payrollFormData, pay_period_end: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gross_pay">Gross Pay</Label>
                      <Input
                        id="gross_pay"
                        type="number"
                        step="0.01"
                        value={payrollFormData.gross_pay}
                        onChange={(e) => setPayrollFormData({ ...payrollFormData, gross_pay: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deductions">Deductions</Label>
                      <Input
                        id="deductions"
                        type="number"
                        step="0.01"
                        value={payrollFormData.deductions}
                        onChange={(e) => setPayrollFormData({ ...payrollFormData, deductions: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bonus">Bonus</Label>
                      <Input
                        id="bonus"
                        type="number"
                        step="0.01"
                        value={payrollFormData.bonus}
                        onChange={(e) => setPayrollFormData({ ...payrollFormData, bonus: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="overtime_hours">Overtime Hours</Label>
                      <Input
                        id="overtime_hours"
                        type="number"
                        step="0.01"
                        value={payrollFormData.overtime_hours}
                        onChange={(e) => setPayrollFormData({ ...payrollFormData, overtime_hours: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="overtime_pay">Overtime Pay</Label>
                      <Input
                        id="overtime_pay"
                        type="number"
                        step="0.01"
                        value={payrollFormData.overtime_pay}
                        onChange={(e) => setPayrollFormData({ ...payrollFormData, overtime_pay: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={payrollFormData.status}
                        onValueChange={(value) => setPayrollFormData({ ...payrollFormData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="net_pay">Net Pay</Label>
                      <Button type="button" variant="outline" size="sm" onClick={calculateNetPay}>
                        <Calculator className="h-4 w-4 mr-1" />
                        Calculate
                      </Button>
                    </div>
                    <Input
                      id="net_pay"
                      type="number"
                      step="0.01"
                      value={payrollFormData.net_pay}
                      onChange={(e) => setPayrollFormData({ ...payrollFormData, net_pay: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsPayrollDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : editingPayroll ? "Update" : "Create"} Payroll
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payroll Records</CardTitle>
              <CardDescription>View and manage employee payroll records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Pay Period</TableHead>
                      <TableHead>Gross Pay</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employee?.full_name}</TableCell>
                        <TableCell>
                          {new Date(record.pay_period_start).toLocaleDateString()} -{" "}
                          {new Date(record.pay_period_end).toLocaleDateString()}
                        </TableCell>
                        <TableCell>${record.gross_pay}</TableCell>
                        <TableCell>${record.deductions}</TableCell>
                        <TableCell className="font-medium">${record.net_pay}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.status)}>{record.status.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => openPayrollDialog(record)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeletePayroll(record.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
