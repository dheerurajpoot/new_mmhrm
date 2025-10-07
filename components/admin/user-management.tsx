"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SimpleSelect } from "@/components/ui/simple-select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { UserPlus, Search, Users, Shield, Crown, Briefcase, Mail, Phone, MapPin, Calendar, Edit, Trash2, MoreHorizontal, Filter, Download } from "lucide-react"
import { toast } from "sonner"
import type { Profile, UserRole } from "@/lib/types"
import { createUser } from "@/app/actions/admin"
import { DeleteConfirmationModal, type DeleteItem } from "@/components/ui/delete-confirmation-modal"

export function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editingUsers, setEditingUsers] = useState<Record<string, boolean>>({})
  const [deletingUsers, setDeletingUsers] = useState<Record<string, boolean>>({})

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<DeleteItem | null>(null)

  // Add user form state
  const [newUser, setNewUser] = useState({
    email: "",
    full_name: "",
    role: "employee" as UserRole,
    department: "",
    position: "",
    phone: "",
    address: "",
    birth_date: "",
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    const filtered = users.filter((user) => {
      const matchesSearch = 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.position?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRole = roleFilter === "all" || user.role === roleFilter
      const matchesDepartment = departmentFilter === "all" || user.department === departmentFilter
      
      return matchesSearch && matchesRole && matchesDepartment
    })
    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, departmentFilter])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/employees")
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()

      // Map backend MongoDB users to frontend Profile type
      const mapped: Profile[] = (data || []).map((u: any) => ({
        id: u._id?.toString?.() || u._id || u.id,
        email: u.email,
        full_name: u.full_name ?? null,
        role: u.role,
        department: u.department ?? null,
        position: u.position ?? null,
        profile_photo: u.profile_photo ?? null,
        hire_date: u.hire_date ? new Date(u.hire_date).toISOString() : null,
        phone: u.phone ?? null,
        address: u.address ?? null,
        birth_date: u.birth_date ?? null,
        created_at: u.created_at ? new Date(u.created_at).toISOString() : "",
        updated_at: u.updated_at ? new Date(u.updated_at).toISOString() : "",
      }))

      setUsers(mapped)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingUser(true)

    try {
      console.log(" Calling createUser server action")
      const result = await createUser(newUser)

      if (result.success) {
        console.log(" User created successfully")
        toast.success("User created successfully!", {
          description: `An email verification link has been sent to ${newUser.email}.`,
        })

        // Reset form and close dialog
        setNewUser({
          email: "",
          full_name: "",
          role: "employee",
          department: "",
          position: "",
          phone: "",
          address: "",
          birth_date: "",
        })
        setIsAddUserOpen(false)
        fetchUsers()
      } else {
        console.error(" Failed to create user:", result.error)
        toast.error("Error creating user", {
          description: result.error || "Failed to create user. Please try again.",
        })
      }
    } catch (error) {
      console.error(" Error in handleAddUser:", error)
      toast.error("Error creating user", {
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsCreatingUser(false)
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) throw new Error("Failed to update user role")
      toast.success("Role updated successfully!", {
        description: "User role has been changed successfully.",
      })
      fetchUsers()
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error("Failed to update user role", {
        description: "There was an error updating the user role. Please try again.",
      })
    }
  }

  const openEditUser = (user: Profile) => {
    setEditingUser(user)
    setIsEditOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return
    setIsSavingEdit(true)
    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: editingUser.full_name,
          email: editingUser.email,
          role: editingUser.role,
          department: editingUser.department,
          position: editingUser.position,
          phone: editingUser.phone,
          address: editingUser.address,
          birth_date: editingUser.birth_date,
        }),
      })
      if (!response.ok) throw new Error("Failed to save user changes")
      toast.success("User updated successfully!", {
        description: "User details have been saved successfully.",
      })
      setIsEditOpen(false)
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      console.error("Error saving user:", error)
      toast.error("Failed to save user changes", {
        description: "There was an error saving the user details. Please try again.",
      })
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.full_name || user.email}? This action cannot be undone.`
    )
    if (!confirmed) return

    setDeletingUsers(prev => ({ ...prev, [userId]: true }))
    try {
      const response = await fetch(`/api/users/${userId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete user")
      toast.success("User deleted successfully!", {
        description: `${user.full_name || user.email} has been removed from the system.`,
      })
      fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user", {
        description: "There was an error deleting the user. Please try again.",
      })
    } finally {
      setDeletingUsers(prev => ({ ...prev, [userId]: false }))
    }
  }

  // New delete modal functions
  const openDeleteModal = (user: Profile) => {
    setUserToDelete({
      id: user.id,
      type: 'user',
      data: user
    })
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    setDeletingUsers(prev => ({ ...prev, [userToDelete.id]: true }))
    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id))
        setFilteredUsers(prev => prev.filter(u => u.id !== userToDelete.id))
        toast.success('User deleted successfully')
        setIsDeleteModalOpen(false)
        setUserToDelete(null)
      } else {
        toast.error('Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    } finally {
      setDeletingUsers(prev => ({ ...prev, [userToDelete.id]: false }))
    }
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-300"
      case "hr":
        return "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-300"
      case "employee":
        return "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-300"
      default:
        return "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-300"
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4" />
      case "hr":
        return <Shield className="w-4 h-4" />
      case "employee":
        return <Briefcase className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const getUniqueDepartments = () => {
    const departments = users.map(user => user.department).filter((dept): dept is string => Boolean(dept))
    return Array.from(new Set(departments))
  }

  const getUserStats = () => {
    const total = users.length
    const admins = users.filter(u => u.role === 'admin').length
    const hr = users.filter(u => u.role === 'hr').length
    const employees = users.filter(u => u.role === 'employee').length
    
    return { total, admins, hr, employees }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Main Content Skeleton */}
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = getUserStats()

  return (
    <div className="space-y-8">
      {/* Modern User Statistics with Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-blue-50 via-white to-blue-50/30 backdrop-blur-xl rounded-3xl border border-blue-200">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/20 to-blue-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
          <CardContent className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <p className="text-sm font-bold text-blue-700 uppercase tracking-wider">Total Users</p>
                </div>
                <p className="text-4xl font-bold text-slate-900 tracking-tight">{stats.total}</p>
                <p className="text-sm text-blue-600 font-medium">All registered users</p>
              </div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 backdrop-blur-xl rounded-3xl border border-emerald-200">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-white/20 to-emerald-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
          <CardContent className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Administrators</p>
                </div>
                <p className="text-4xl font-bold text-slate-900 tracking-tight">{stats.admins}</p>
                <p className="text-sm text-emerald-600 font-medium">System administrators</p>
              </div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-amber-50 via-white to-amber-50/30 backdrop-blur-xl rounded-3xl border border-amber-200">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-white/20 to-amber-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
          <CardContent className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <p className="text-sm font-bold text-amber-700 uppercase tracking-wider">HR Staff</p>
                </div>
                <p className="text-4xl font-bold text-slate-900 tracking-tight">{stats.hr}</p>
                <p className="text-sm text-amber-600 font-medium">Human resources</p>
              </div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-amber-400/20 to-orange-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-rose-50 via-white to-rose-50/30 backdrop-blur-xl rounded-3xl border border-rose-200">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50/30 via-white/20 to-rose-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
          <CardContent className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></div>
                  <p className="text-sm font-bold text-rose-700 uppercase tracking-wider">Employees</p>
                </div>
                <p className="text-4xl font-bold text-slate-900 tracking-tight">{stats.employees}</p>
                <p className="text-sm text-rose-600 font-medium">Regular employees</p>
              </div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-rose-400/20 to-pink-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Colorful Main User Management Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 via-white to-purple-50/30 backdrop-blur-xl rounded-3xl border border-indigo-200/50 hover:shadow-2xl transition-all duration-500">
        <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-purple-100/30 border-b border-indigo-200/50 rounded-t-3xl p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-indigo-900">User Management</CardTitle>
                <CardDescription className="text-indigo-600">Manage user accounts, roles, and permissions</CardDescription>
              </div>
            </div>
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 rounded-2xl px-8 py-3">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>Create a new user account with role assignment</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="user@company.com"
                    />
                    <p className="text-xs text-gray-500">
                      User will receive an email to verify and set up their password
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      required
                      value={newUser.full_name}
                      onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <SimpleSelect
                      options={[
                        { value: "employee", label: "Employee" },
                        { value: "hr", label: "HR" },
                        { value: "admin", label: "Admin" },
                      ]}
                      value={newUser.role}
                      onValueChange={(value: string) => setNewUser({ ...newUser, role: value as UserRole })}
                      placeholder="Select role"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={newUser.department}
                        onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={newUser.position}
                        onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Date of Birth</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={newUser.birth_date}
                      onChange={(e) => setNewUser({ ...newUser, birth_date: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isCreatingUser}>
                    {isCreatingUser ? "Creating User..." : "Create User"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Search and Filter Section */}
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50/50 to-white">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search users by name, email, department, or position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-slate-200 focus:border-slate-400"
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex gap-3">
                <div className="min-w-[140px]">
                  <SimpleSelect
                    options={[
                      { value: "all", label: "All Roles" },
                      { value: "admin", label: "Admin" },
                      { value: "hr", label: "HR" },
                      { value: "employee", label: "Employee" },
                    ]}
                    value={roleFilter}
                    onValueChange={(value: string) => setRoleFilter(value as UserRole | "all")}
                    placeholder="Filter by role"
                  />
                </div>
                <div className="min-w-[140px]">
                  <SimpleSelect
                    options={[
                      { value: "all", label: "All Departments" },
                      ...getUniqueDepartments().map(dept => ({ value: dept, label: dept }))
                    ]}
                    value={departmentFilter}
                    onValueChange={(value: string) => setDepartmentFilter(value)}
                    placeholder="Filter by department"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="overflow-hidden">
            {filteredUsers.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {filteredUsers.map((user, index) => (
                  <div key={user.id} className={`group p-6 hover:bg-white/60 transition-all duration-300 border border-transparent hover:border-slate-200/50 hover:shadow-lg rounded-2xl ${
                    index % 2 === 0 ? 'bg-white/40' : 'bg-slate-50/20'
                  }`}>
                    <div className="flex items-center justify-between md:flex-row flex-col gap-4 items-start">
                      {/* User Info */}
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 border-2 border-slate-200">
                          <AvatarImage src={user.profile_photo || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-semibold">
                            {user.full_name?.charAt(0) || user.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{user.full_name || "No name"}</h3>
                            <Badge className={`${getRoleBadgeColor(user.role)} border-0 shadow-sm`}>
                              <div className="flex items-center gap-1">
                                {getRoleIcon(user.role)}
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </div>
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span>{user.email}</span>
                            </div>
                            {user.department && (
                              <div className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                <span>{user.department}</span>
                              </div>
                            )}
                            {user.position && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{user.position}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <SimpleSelect
                          options={[
                            { value: "employee", label: "Employee" },
                            { value: "hr", label: "HR" },
                            { value: "admin", label: "Admin" },
                          ]}
                          value={user.role}
                          onValueChange={(value: string) => handleUpdateUserRole(user.id, value as UserRole)}
                          className="w-28 h-8"
                        />
                        
                        {/* Edit Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditUser(user)}
                          disabled={editingUsers[user.id] || deletingUsers[user.id]}
                          className="h-8 px-3 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        
                        {/* Delete Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteModal(user)}
                          disabled={editingUsers[user.id] || deletingUsers[user.id]}
                          className="h-8 px-3 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-600 font-medium">No users found</p>
                <p className="text-sm text-slate-400 mt-2">
                  {searchTerm || roleFilter !== "all" || departmentFilter !== "all" 
                    ? "Try adjusting your search or filter criteria." 
                    : "Get started by adding your first user."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details and role</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void handleSaveEdit()
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="edit_full_name">Full Name</Label>
                <Input
                  id="edit_full_name"
                  value={editingUser.full_name || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_role">Role</Label>
                <SimpleSelect
                  options={[
                    { value: "employee", label: "Employee" },
                    { value: "hr", label: "HR" },
                    { value: "admin", label: "Admin" },
                  ]}
                  value={editingUser.role}
                  onValueChange={(value: string) => setEditingUser({ ...editingUser, role: value as UserRole })}
                  placeholder="Select role"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_department">Department</Label>
                  <Input
                    id="edit_department"
                    value={editingUser.department || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_position">Position</Label>
                  <Input
                    id="edit_position"
                    value={editingUser.position || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, position: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_birth_date">Date of Birth</Label>
                <Input
                  id="edit_birth_date"
                  type="date"
                  value={editingUser.birth_date ? new Date(editingUser.birth_date).toISOString().split('T')[0] : ""}
                  onChange={(e) => setEditingUser({ ...editingUser, birth_date: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSavingEdit}>
                  {isSavingEdit ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setUserToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        item={userToDelete}
        loading={userToDelete ? deletingUsers[userToDelete.id] : false}
      />
    </div>
  )
}
