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
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Briefcase, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface JobPosting {
  id: string
  title: string
  department: string
  location: string
  employment_type: string
  salary_range: string
  description: string
  requirements: string
  status: "active" | "closed" | "draft"
  posted_date: string
  applications_count: number
}

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  position_applied: string
  resume_url?: string
  status: "applied" | "screening" | "interview" | "offer" | "hired" | "rejected"
  applied_date: string
  notes: string
}

interface OnboardingTask {
  id: string
  employee_id: string
  task_name: string
  description: string
  assigned_to: string
  due_date: string
  status: "pending" | "in_progress" | "completed"
  priority: "low" | "medium" | "high"
}

export function RecruitmentOnboarding() {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>([])
  const [loading, setLoading] = useState(true)
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false)
  const [isCandidateDialogOpen, setIsCandidateDialogOpen] = useState(false)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)

  const [jobFormData, setJobFormData] = useState({
    title: "",
    department: "",
    location: "",
    employment_type: "full-time",
    salary_range: "",
    description: "",
    requirements: "",
    status: "draft" as "active" | "closed" | "draft",
  })

  const [candidateFormData, setCandidateFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position_applied: "",
    notes: "",
  })

  const [taskFormData, setTaskFormData] = useState({
    employee_id: "",
    task_name: "",
    description: "",
    assigned_to: "",
    due_date: "",
    priority: "medium" as "low" | "medium" | "high",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Mock data for demonstration
      setJobPostings([
        {
          id: "1",
          title: "Senior Software Engineer",
          department: "Engineering",
          location: "Remote",
          employment_type: "full-time",
          salary_range: "$80,000 - $120,000",
          description: "We are looking for a senior software engineer...",
          requirements: "5+ years experience, React, Node.js",
          status: "active",
          posted_date: "2024-01-15",
          applications_count: 12,
        },
        {
          id: "2",
          title: "Marketing Manager",
          department: "Marketing",
          location: "New York",
          employment_type: "full-time",
          salary_range: "$60,000 - $80,000",
          description: "Lead our marketing initiatives...",
          requirements: "3+ years marketing experience",
          status: "active",
          posted_date: "2024-01-10",
          applications_count: 8,
        },
      ])

      setCandidates([
        {
          id: "1",
          name: "John Smith",
          email: "john.smith@email.com",
          phone: "+1-555-0123",
          position_applied: "Senior Software Engineer",
          status: "interview",
          applied_date: "2024-01-20",
          notes: "Strong technical background, good communication skills",
        },
        {
          id: "2",
          name: "Sarah Johnson",
          email: "sarah.j@email.com",
          phone: "+1-555-0124",
          position_applied: "Marketing Manager",
          status: "screening",
          applied_date: "2024-01-18",
          notes: "Excellent portfolio, previous experience in similar role",
        },
      ])

      setOnboardingTasks([
        {
          id: "1",
          employee_id: "emp1",
          task_name: "Complete IT Setup",
          description: "Set up laptop, accounts, and access permissions",
          assigned_to: "IT Department",
          due_date: "2024-02-01",
          status: "pending",
          priority: "high",
        },
        {
          id: "2",
          employee_id: "emp1",
          task_name: "HR Orientation",
          description: "Complete HR orientation and paperwork",
          assigned_to: "HR Team",
          due_date: "2024-01-30",
          status: "completed",
          priority: "high",
        },
      ])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch recruitment data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Mock API call
      const newJob: JobPosting = {
        id: Date.now().toString(),
        ...jobFormData,
        posted_date: new Date().toISOString().split("T")[0],
        applications_count: 0,
      }

      setJobPostings([newJob, ...jobPostings])
      setIsJobDialogOpen(false)
      resetJobForm()

      toast({
        title: "Success",
        description: "Job posting created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create job posting",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newCandidate: Candidate = {
        id: Date.now().toString(),
        ...candidateFormData,
        status: "applied",
        applied_date: new Date().toISOString().split("T")[0],
      }

      setCandidates([newCandidate, ...candidates])
      setIsCandidateDialogOpen(false)
      resetCandidateForm()

      toast({
        title: "Success",
        description: "Candidate added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add candidate",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newTask: OnboardingTask = {
        id: Date.now().toString(),
        ...taskFormData,
        status: "pending",
      }

      setOnboardingTasks([newTask, ...onboardingTasks])
      setIsTaskDialogOpen(false)
      resetTaskForm()

      toast({
        title: "Success",
        description: "Onboarding task created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create onboarding task",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateCandidateStatus = (candidateId: string, newStatus: Candidate["status"]) => {
    setCandidates(
      candidates.map((candidate) => (candidate.id === candidateId ? { ...candidate, status: newStatus } : candidate)),
    )
    toast({
      title: "Success",
      description: "Candidate status updated",
    })
  }

  const updateTaskStatus = (taskId: string, newStatus: OnboardingTask["status"]) => {
    setOnboardingTasks(onboardingTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
    toast({
      title: "Success",
      description: "Task status updated",
    })
  }

  const resetJobForm = () => {
    setJobFormData({
      title: "",
      department: "",
      location: "",
      employment_type: "full-time",
      salary_range: "",
      description: "",
      requirements: "",
      status: "draft",
    })
  }

  const resetCandidateForm = () => {
    setCandidateFormData({
      name: "",
      email: "",
      phone: "",
      position_applied: "",
      notes: "",
    })
  }

  const resetTaskForm = () => {
    setTaskFormData({
      employee_id: "",
      task_name: "",
      description: "",
      assigned_to: "",
      due_date: "",
      priority: "medium",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
      case "hired":
        return "bg-blue-100 text-blue-800"
      case "pending":
      case "applied":
        return "bg-yellow-100 text-yellow-800"
      case "interview":
      case "in_progress":
        return "bg-red-100 text-red-800"
      case "rejected":
      case "closed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading && jobPostings.length === 0) {
    return <div className="flex items-center justify-center h-64">Loading recruitment data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recruitment & Onboarding</h2>
          <p className="text-muted-foreground">Manage job postings, candidates, and onboarding processes</p>
        </div>
      </div>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Briefcase className="mr-2 h-4 w-4" />
                  Create Job Posting
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create Job Posting</DialogTitle>
                  <DialogDescription>Create a new job posting to attract candidates</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleJobSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="job_title">Job Title</Label>
                      <Input
                        id="job_title"
                        value={jobFormData.title}
                        onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={jobFormData.department}
                        onChange={(e) => setJobFormData({ ...jobFormData, department: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={jobFormData.location}
                        onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employment_type">Employment Type</Label>
                      <Select
                        value={jobFormData.employment_type}
                        onValueChange={(value) => setJobFormData({ ...jobFormData, employment_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary_range">Salary Range</Label>
                      <Input
                        id="salary_range"
                        value={jobFormData.salary_range}
                        onChange={(e) => setJobFormData({ ...jobFormData, salary_range: e.target.value })}
                        placeholder="e.g., $50,000 - $70,000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                      id="description"
                      value={jobFormData.description}
                      onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={jobFormData.requirements}
                      onChange={(e) => setJobFormData({ ...jobFormData, requirements: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_status">Status</Label>
                    <Select
                      value={jobFormData.status}
                      onValueChange={(value: "active" | "closed" | "draft") =>
                        setJobFormData({ ...jobFormData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsJobDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create Job Posting"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Job Postings</CardTitle>
              <CardDescription>Manage and track job postings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Applications</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Posted Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobPostings.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.department}</TableCell>
                        <TableCell>{job.location}</TableCell>
                        <TableCell className="capitalize">{job.employment_type}</TableCell>
                        <TableCell>{job.applications_count}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(job.status)}>{job.status.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>{new Date(job.posted_date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isCandidateDialogOpen} onOpenChange={setIsCandidateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Candidate
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Candidate</DialogTitle>
                  <DialogDescription>Add a new candidate to the recruitment pipeline</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCandidateSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="candidate_name">Full Name</Label>
                      <Input
                        id="candidate_name"
                        value={candidateFormData.name}
                        onChange={(e) => setCandidateFormData({ ...candidateFormData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="candidate_email">Email</Label>
                      <Input
                        id="candidate_email"
                        type="email"
                        value={candidateFormData.email}
                        onChange={(e) => setCandidateFormData({ ...candidateFormData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="candidate_phone">Phone</Label>
                      <Input
                        id="candidate_phone"
                        value={candidateFormData.phone}
                        onChange={(e) => setCandidateFormData({ ...candidateFormData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position_applied">Position Applied</Label>
                      <Select
                        value={candidateFormData.position_applied}
                        onValueChange={(value) =>
                          setCandidateFormData({ ...candidateFormData, position_applied: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobPostings
                            .filter((job) => job.status === "active")
                            .map((job) => (
                              <SelectItem key={job.id} value={job.title}>
                                {job.title}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="candidate_notes">Notes</Label>
                    <Textarea
                      id="candidate_notes"
                      value={candidateFormData.notes}
                      onChange={(e) => setCandidateFormData({ ...candidateFormData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCandidateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Adding..." : "Add Candidate"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Candidates</CardTitle>
              <CardDescription>Track and manage candidate applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell className="font-medium">{candidate.name}</TableCell>
                        <TableCell>{candidate.email}</TableCell>
                        <TableCell>{candidate.position_applied}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(candidate.status)}>{candidate.status.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>{new Date(candidate.applied_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Select
                            value={candidate.status}
                            onValueChange={(value: Candidate["status"]) => updateCandidateStatus(candidate.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="applied">Applied</SelectItem>
                              <SelectItem value="screening">Screening</SelectItem>
                              <SelectItem value="interview">Interview</SelectItem>
                              <SelectItem value="offer">Offer</SelectItem>
                              <SelectItem value="hired">Hired</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Create Onboarding Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Onboarding Task</DialogTitle>
                  <DialogDescription>Create a new task for employee onboarding</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleTaskSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="task_name">Task Name</Label>
                      <Input
                        id="task_name"
                        value={taskFormData.task_name}
                        onChange={(e) => setTaskFormData({ ...taskFormData, task_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assigned_to">Assigned To</Label>
                      <Input
                        id="assigned_to"
                        value={taskFormData.assigned_to}
                        onChange={(e) => setTaskFormData({ ...taskFormData, assigned_to: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="due_date">Due Date</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={taskFormData.due_date}
                        onChange={(e) => setTaskFormData({ ...taskFormData, due_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={taskFormData.priority}
                        onValueChange={(value: "low" | "medium" | "high") =>
                          setTaskFormData({ ...taskFormData, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task_description">Description</Label>
                    <Textarea
                      id="task_description"
                      value={taskFormData.description}
                      onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create Task"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Onboarding Tasks</CardTitle>
              <CardDescription>Track onboarding progress for new employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {onboardingTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.task_name}</TableCell>
                        <TableCell>{task.assigned_to}</TableCell>
                        <TableCell>{new Date(task.due_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(task.status)}>{task.status.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={task.status}
                            onValueChange={(value: OnboardingTask["status"]) => updateTaskStatus(task.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
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
