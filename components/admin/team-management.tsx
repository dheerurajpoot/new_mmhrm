"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Users, Plus, Edit, Trash2, UserCheck } from "lucide-react"
import { toast } from "sonner"
import type { Profile } from "@/lib/types"

interface Team {
  id: string
  name: string
  leader: Profile
  members: Profile[]
  created_at: string
}

export function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([])
  const [employees, setEmployees] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Team form state
  const [newTeam, setNewTeam] = useState({
    name: "",
    leaderId: "",
    memberIds: [] as string[],
  })

  useEffect(() => {
    fetchTeams()
    fetchEmployees()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams")
      if (!response.ok) throw new Error("Failed to fetch teams")
      const data = await response.json()
      setTeams(data || [])
    } catch (error) {
      console.error("Error fetching teams:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees")
      if (!response.ok) throw new Error("Failed to fetch employees")
      const data = await response.json()
      
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
        created_at: u.created_at ? new Date(u.created_at).toISOString() : "",
        updated_at: u.updated_at ? new Date(u.updated_at).toISOString() : "",
      }))

      setEmployees(mapped.filter(emp => emp.role === "employee"))
    } catch (error) {
      console.error("Error fetching employees:", error)
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeam.name || !newTeam.leaderId) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsCreatingTeam(true)
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTeam),
      })

      if (!response.ok) throw new Error("Failed to create team")
      
      toast.success("Team has been created successfully.")
      
      setNewTeam({ name: "", leaderId: "", memberIds: [] })
      setIsCreateTeamOpen(false)
      fetchTeams()
    } catch (error) {
      console.error("Error creating team:", error)
      toast.error("Failed to create team")
    } finally {
      setIsCreatingTeam(false)
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this team? This action cannot be undone.")
    if (!confirmed) return
    
    try {
      const response = await fetch(`/api/teams/${teamId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete team")
      toast.success("The team has been removed.")
      fetchTeams()
    } catch (error) {
      console.error("Error deleting team:", error)
      toast.error("Failed to delete team")
    }
  }

  const openEditTeam = (team: Team) => {
    setEditingTeam(team)
    setIsEditOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingTeam) return
    setIsSavingEdit(true)
    try {
      const response = await fetch(`/api/teams/${editingTeam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingTeam.name,
          leaderId: editingTeam.leader.id,
          memberIds: editingTeam.members.map(m => m.id),
        }),
      })
      if (!response.ok) throw new Error("Failed to save team changes")
      toast.success("Team details saved successfully.")
      setIsEditOpen(false)
      setEditingTeam(null)
      fetchTeams()
    } catch (error) {
      console.error("Error saving team:", error)
      toast.error("Failed to save team changes")
    } finally {
      setIsSavingEdit(false)
    }
  }

  const toggleMemberSelection = (employeeId: string) => {
    if (newTeam.memberIds.includes(employeeId)) {
      setNewTeam({ ...newTeam, memberIds: newTeam.memberIds.filter(id => id !== employeeId) })
    } else {
      setNewTeam({ ...newTeam, memberIds: [...newTeam.memberIds, employeeId] })
    }
  }

  const toggleEditMemberSelection = (employeeId: string) => {
    if (!editingTeam) return
    const currentMembers = editingTeam.members.map(m => m.id)
    if (currentMembers.includes(employeeId)) {
      setEditingTeam({
        ...editingTeam,
        members: editingTeam.members.filter(m => m.id !== employeeId)
      })
    } else {
      const employee = employees.find(emp => emp.id === employeeId)
      if (employee) {
        setEditingTeam({
          ...editingTeam,
          members: [...editingTeam.members, employee]
        })
      }
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
              {[...Array(3)].map((_, i) => (
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
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Management
              </CardTitle>
              <CardDescription>Create and manage teams for better collaboration</CardDescription>
            </div>
            <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                  <DialogDescription>Set up a new team with a leader and members</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="team_name">Team Name</Label>
                    <Input
                      id="team_name"
                      required
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                      placeholder="Enter team name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="team_leader">Team Leader</Label>
                    <SearchableSelect
                      options={employees.map((employee) => ({
                        value: employee.id,
                        label: employee.full_name || employee.email,
                        description: employee.position || employee.department,
                        profile_photo: employee.profile_photo,
                        email: employee.email,
                      }))}
                      value={newTeam.leaderId}
                      onValueChange={(value) => setNewTeam({ ...newTeam, leaderId: value })}
                      placeholder="Select team leader"
                      searchPlaceholder="Search employees..."
                      emptyMessage="No employees found."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Team Members</Label>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2">
                      {employees
                        .filter(emp => emp.id !== newTeam.leaderId)
                        .map((employee) => (
                        <div key={employee.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`member-${employee.id}`}
                            checked={newTeam.memberIds.includes(employee.id)}
                            onCheckedChange={() => toggleMemberSelection(employee.id)}
                          />
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={employee.profile_photo || ""} />
                            <AvatarFallback className="text-xs">
                              {employee.full_name?.charAt(0) || employee.email.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <Label htmlFor={`member-${employee.id}`} className="text-sm cursor-pointer">
                            {employee.full_name || employee.email}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isCreatingTeam}>
                    {isCreatingTeam ? "Creating Team..." : "Create Team"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Leader</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{team.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={team.leader.profile_photo || ""} />
                          <AvatarFallback className="text-xs">
                            {team.leader.full_name?.charAt(0) || team.leader.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{team.leader.full_name || team.leader.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {team.members.slice(0, 3).map((member) => (
                          <Avatar key={member.id} className="w-6 h-6">
                            <AvatarImage src={member.profile_photo || ""} />
                            <AvatarFallback className="text-xs">
                              {member.full_name?.charAt(0) || member.email.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {team.members.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{team.members.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openEditTeam(team)}>
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteTeam(team.id)}>
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {teams.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No teams created yet.</p>
              <p className="text-sm text-gray-400">Create your first team to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Team Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>Update team details and members</DialogDescription>
          </DialogHeader>
          {editingTeam && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void handleSaveEdit()
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="edit_team_name">Team Name</Label>
                <Input
                  id="edit_team_name"
                  value={editingTeam.name}
                  onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Team Leader</Label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={editingTeam.leader.profile_photo || ""} />
                    <AvatarFallback>
                      {editingTeam.leader.full_name?.charAt(0) || editingTeam.leader.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{editingTeam.leader.full_name || editingTeam.leader.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Team Members</Label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2">
                  {employees
                    .filter(emp => emp.id !== editingTeam.leader.id)
                    .map((employee) => (
                    <div key={employee.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-member-${employee.id}`}
                        checked={editingTeam.members.some(m => m.id === employee.id)}
                        onCheckedChange={() => toggleEditMemberSelection(employee.id)}
                      />
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={employee.profile_photo || ""} />
                        <AvatarFallback className="text-xs">
                          {employee.full_name?.charAt(0) || employee.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <Label htmlFor={`edit-member-${employee.id}`} className="text-sm cursor-pointer">
                        {employee.full_name || employee.email}
                      </Label>
                    </div>
                  ))}
                </div>
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
