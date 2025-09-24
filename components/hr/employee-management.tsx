"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserPlus, Search, Eye, DollarSign } from "lucide-react"
import type { Profile } from "@/lib/types"

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Profile[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Profile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Profile | null>(null)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)

  // Add employee form state
  const [newEmployee, setNewEmployee] = useState({
    email: "",
    full_name: "",
    department: "",
    position: "",
    phone: "",
    address: "",
    hire_date: "",
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    const filtered = employees.filter(
      (employee) =>
        employee.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredEmployees(filtered)
  }, [employees, searchTerm])

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees")
      if (!response.ok) throw new Error("Failed to fetch employees")
      const data = await response.json()
      setEmployees(data.filter((emp: Profile) => emp.role === "employee") || [])
    } catch (error) {
      console.error("Error fetching employees:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newEmployee,
          role: "employee",
          password: "TempPassword123!", // Temporary password
        }),
      })

      if (!response.ok) throw new Error("Failed to create employee")

      setNewEmployee({
        email: "",
        full_name: "",
        department: "",
        position: "",
        phone: "",
        address: "",
        hire_date: "",
      })
      setIsAddEmployeeOpen(false)
      fetchEmployees()
    } catch (error) {
      console.error("Error adding employee:", error)
    }
  }

  const handleViewDetails = (employee: Profile) => {
    setSelectedEmployee(employee)
    setIsViewDetailsOpen(true)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Employee Management</CardTitle>
              <CardDescription>Manage employee records and information</CardDescription>
            </div>
            <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>Create a new employee account</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddEmployee} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      required
                      value={newEmployee.full_name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, full_name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={newEmployee.department}
                        onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={newEmployee.position}
                        onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hire_date">Hire Date</Label>
                    <Input
                      id="hire_date"
                      type="date"
                      value={newEmployee.hire_date}
                      onChange={(e) => setNewEmployee({ ...newEmployee, hire_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newEmployee.address}
                      onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Employee
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search employees by name, email, department, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Department</TableHead>
                  <TableHead className="hidden lg:table-cell">Position</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{employee.full_name || "No name"}</p>
                        <p className="text-sm text-gray-500 sm:hidden">{employee.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{employee.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{employee.department || "Not assigned"}</TableCell>
                    <TableCell className="hidden lg:table-cell">{employee.position || "Not assigned"}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(employee)} className="h-8">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No employees found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>View employee information and records</DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                  <p className="text-sm text-gray-900">{selectedEmployee.full_name || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm text-gray-900">{selectedEmployee.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Department</Label>
                  <p className="text-sm text-gray-900">{selectedEmployee.department || "Not assigned"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Position</Label>
                  <p className="text-sm text-gray-900">{selectedEmployee.position || "Not assigned"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p className="text-sm text-gray-900">{selectedEmployee.phone || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Hire Date</Label>
                  <p className="text-sm text-gray-900">
                    {selectedEmployee.hire_date
                      ? new Date(selectedEmployee.hire_date).toLocaleDateString()
                      : "Not provided"}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Address</Label>
                <p className="text-sm text-gray-900">{selectedEmployee.address || "Not provided"}</p>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Manage Finances
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  View Leave History
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
