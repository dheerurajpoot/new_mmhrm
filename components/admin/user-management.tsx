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
import { UserPlus, Search } from "lucide-react"
import { toast } from "sonner"
import type { Profile, UserRole } from "@/lib/types"
import { createUser } from "@/app/actions/admin"

export function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

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
    const filtered = users.filter(
      (user) =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

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
    const confirmed = window.confirm("Are you sure you want to delete this user? This action cannot be undone.")
    if (!confirmed) return
    try {
      const response = await fetch(`/api/users/${userId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete user")
      toast.success("User deleted successfully!", {
        description: "The user has been removed from the system.",
      })
      fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user", {
        description: "There was an error deleting the user. Please try again.",
      })
    }
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "hr":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "employee":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
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
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
            </div>
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700">
                  <UserPlus className="w-4 h-4 mr-2" />
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
                      onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}
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
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users by name, email, or department..."
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
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Department</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.profile_photo || ""} />
                          <AvatarFallback className="text-xs">
                            {user.full_name?.charAt(0) || user.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name || "No name"}</p>
                          <p className="text-sm text-gray-500 sm:hidden">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{user.department || "Not assigned"}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <SimpleSelect
                          options={[
                            { value: "employee", label: "Employee" },
                            { value: "hr", label: "HR" },
                            { value: "admin", label: "Admin" },
                          ]}
                          value={user.role}
                          onValueChange={(value: UserRole) => handleUpdateUserRole(user.id, value)}
                          className="w-24 h-8"
                        />
                        <Button size="sm" variant="outline" onClick={() => openEditUser(user)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found matching your search.</p>
            </div>
          )}
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
                  onValueChange={(value: UserRole) => setEditingUser({ ...editingUser, role: value })}
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
    </div>
  )
}
