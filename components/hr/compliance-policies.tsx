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
import { Shield, FileText } from "lucide-react"
import { toast } from "sonner"

interface Policy {
  id: string
  title: string
  category: string
  description: string
  content: string
  version: string
  effective_date: string
  review_date: string
  status: "active" | "draft" | "archived"
  created_by: string
}

interface ComplianceRecord {
  id: string
  employee_id: string
  employee_name: string
  policy_id: string
  policy_title: string
  acknowledgment_date: string
  status: "acknowledged" | "pending" | "overdue"
  notes: string
}

interface Audit {
  id: string
  title: string
  type: "internal" | "external" | "compliance"
  description: string
  auditor: string
  start_date: string
  end_date: string
  status: "planned" | "in_progress" | "completed" | "on_hold"
  findings: string
  recommendations: string
}

export function CompliancePolicies() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [complianceRecords, setComplianceRecords] = useState<ComplianceRecord[]>([])
  const [audits, setAudits] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false)
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false)

  const [policyFormData, setPolicyFormData] = useState({
    title: "",
    category: "",
    description: "",
    content: "",
    version: "1.0",
    effective_date: "",
    review_date: "",
    status: "draft" as "active" | "draft" | "archived",
  })

  const [auditFormData, setAuditFormData] = useState({
    title: "",
    type: "internal" as "internal" | "external" | "compliance",
    description: "",
    auditor: "",
    start_date: "",
    end_date: "",
    findings: "",
    recommendations: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Mock data for demonstration
      setPolicies([
        {
          id: "1",
          title: "Code of Conduct",
          category: "Ethics",
          description: "Company code of conduct and ethical guidelines",
          content: "All employees must adhere to the highest standards of professional conduct...",
          version: "2.1",
          effective_date: "2024-01-01",
          review_date: "2024-12-31",
          status: "active",
          created_by: "HR Team",
        },
        {
          id: "2",
          title: "Data Privacy Policy",
          category: "Security",
          description: "Guidelines for handling personal and sensitive data",
          content: "This policy outlines how we collect, use, and protect personal data...",
          version: "1.5",
          effective_date: "2024-01-15",
          review_date: "2024-07-15",
          status: "active",
          created_by: "Legal Team",
        },
      ])

      setComplianceRecords([
        {
          id: "1",
          employee_id: "emp1",
          employee_name: "John Smith",
          policy_id: "1",
          policy_title: "Code of Conduct",
          acknowledgment_date: "2024-01-05",
          status: "acknowledged",
          notes: "Acknowledged and understood",
        },
        {
          id: "2",
          employee_id: "emp2",
          employee_name: "Sarah Johnson",
          policy_id: "2",
          policy_title: "Data Privacy Policy",
          acknowledgment_date: "",
          status: "pending",
          notes: "Reminder sent",
        },
      ])

      setAudits([
        {
          id: "1",
          title: "Annual Compliance Audit",
          type: "internal",
          description: "Annual review of compliance with company policies and procedures",
          auditor: "Internal Audit Team",
          start_date: "2024-02-01",
          end_date: "2024-02-28",
          status: "planned",
          findings: "",
          recommendations: "",
        },
        {
          id: "2",
          title: "Data Security Assessment",
          type: "external",
          description: "Third-party assessment of data security practices",
          auditor: "CyberSec Consulting",
          start_date: "2024-01-15",
          end_date: "2024-01-30",
          status: "completed",
          findings: "Minor vulnerabilities identified in access controls",
          recommendations: "Implement multi-factor authentication for all systems",
        },
      ])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast("Failed to fetch compliance data",
       )
    } finally {
      setLoading(false)
    }
  }

  const handlePolicySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newPolicy: Policy = {
        id: Date.now().toString(),
        ...policyFormData,
        created_by: "Current User", // Would be fetched from auth context
      }

      setPolicies([newPolicy, ...policies])
      setIsPolicyDialogOpen(false)
      resetPolicyForm()

      toast( "Policy created successfully",
      )
    } catch (error) {
      toast("Failed to create policy",
       )
    } finally {
      setLoading(false)
    }
  }

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newAudit: Audit = {
        id: Date.now().toString(),
        ...auditFormData,
        status: "planned",
      }

      setAudits([newAudit, ...audits])
      setIsAuditDialogOpen(false)
      resetAuditForm()

      toast("Audit scheduled successfully",
      )
    } catch (error) {
      toast("Failed to schedule audit",
       )
    } finally {
      setLoading(false)
    }
  }

  const resetPolicyForm = () => {
    setPolicyFormData({
      title: "",
      category: "",
      description: "",
      content: "",
      version: "1.0",
      effective_date: "",
      review_date: "",
      status: "draft",
    })
  }

  const resetAuditForm = () => {
    setAuditFormData({
      title: "",
      type: "internal",
      description: "",
      auditor: "",
      start_date: "",
      end_date: "",
      findings: "",
      recommendations: "",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "acknowledged":
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "pending":
      case "planned":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "in_progress":
        return "bg-red-100 text-red-800"
      case "draft":
      case "on_hold":
        return "bg-gray-100 text-gray-800"
      case "archived":
        return "bg-gray-100 text-gray-600"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "internal":
        return "bg-red-100 text-red-800"
      case "external":
        return "bg-purple-100 text-purple-800"
      case "compliance":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading && policies.length === 0) {
    return <div className="flex items-center justify-center h-64">Loading compliance data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Compliance & Policies</h2>
          <p className="text-muted-foreground">Manage company policies, compliance tracking, and audits</p>
        </div>
      </div>

      <Tabs defaultValue="policies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Tracking</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Create Policy
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Create Policy</DialogTitle>
                  <DialogDescription>Create a new company policy or procedure</DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePolicySubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="policy_title">Policy Title</Label>
                      <Input
                        id="policy_title"
                        value={policyFormData.title}
                        onChange={(e) => setPolicyFormData({ ...policyFormData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={policyFormData.category}
                        onValueChange={(value) => setPolicyFormData({ ...policyFormData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ethics">Ethics</SelectItem>
                          <SelectItem value="Security">Security</SelectItem>
                          <SelectItem value="HR">Human Resources</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Operations">Operations</SelectItem>
                          <SelectItem value="Legal">Legal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        value={policyFormData.version}
                        onChange={(e) => setPolicyFormData({ ...policyFormData, version: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="effective_date">Effective Date</Label>
                      <Input
                        id="effective_date"
                        type="date"
                        value={policyFormData.effective_date}
                        onChange={(e) => setPolicyFormData({ ...policyFormData, effective_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="review_date">Review Date</Label>
                      <Input
                        id="review_date"
                        type="date"
                        value={policyFormData.review_date}
                        onChange={(e) => setPolicyFormData({ ...policyFormData, review_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policy_description">Description</Label>
                    <Textarea
                      id="policy_description"
                      value={policyFormData.description}
                      onChange={(e) => setPolicyFormData({ ...policyFormData, description: e.target.value })}
                      rows={2}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policy_content">Policy Content</Label>
                    <Textarea
                      id="policy_content"
                      value={policyFormData.content}
                      onChange={(e) => setPolicyFormData({ ...policyFormData, content: e.target.value })}
                      rows={6}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policy_status">Status</Label>
                    <Select
                      value={policyFormData.status}
                      onValueChange={(value: "active" | "draft" | "archived") =>
                        setPolicyFormData({ ...policyFormData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsPolicyDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create Policy"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Company Policies</CardTitle>
              <CardDescription>Manage and track company policies and procedures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Effective Date</TableHead>
                      <TableHead>Review Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell className="font-medium">{policy.title}</TableCell>
                        <TableCell>{policy.category}</TableCell>
                        <TableCell>{policy.version}</TableCell>
                        <TableCell>{new Date(policy.effective_date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(policy.review_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(policy.status)}>{policy.status.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>{policy.created_by}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Tracking</CardTitle>
              <CardDescription>Track employee acknowledgment of policies and procedures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Policy</TableHead>
                      <TableHead>Acknowledgment Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complianceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employee_name}</TableCell>
                        <TableCell>{record.policy_title}</TableCell>
                        <TableCell>
                          {record.acknowledgment_date ? new Date(record.acknowledgment_date).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.status)}>{record.status.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>{record.notes}</TableCell>
                        <TableCell>
                          {record.status === "pending" && (
                            <Button variant="outline" size="sm">
                              Send Reminder
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audits" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isAuditDialogOpen} onOpenChange={setIsAuditDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Shield className="mr-2 h-4 w-4" />
                  Schedule Audit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Schedule Audit</DialogTitle>
                  <DialogDescription>Schedule a new compliance or internal audit</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAuditSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="audit_title">Audit Title</Label>
                      <Input
                        id="audit_title"
                        value={auditFormData.title}
                        onChange={(e) => setAuditFormData({ ...auditFormData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="audit_type">Audit Type</Label>
                      <Select
                        value={auditFormData.type}
                        onValueChange={(value: "internal" | "external" | "compliance") =>
                          setAuditFormData({ ...auditFormData, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internal">Internal</SelectItem>
                          <SelectItem value="external">External</SelectItem>
                          <SelectItem value="compliance">Compliance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="auditor">Auditor</Label>
                      <Input
                        id="auditor"
                        value={auditFormData.auditor}
                        onChange={(e) => setAuditFormData({ ...auditFormData, auditor: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={auditFormData.start_date}
                        onChange={(e) => setAuditFormData({ ...auditFormData, start_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={auditFormData.end_date}
                      onChange={(e) => setAuditFormData({ ...auditFormData, end_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audit_description">Description</Label>
                    <Textarea
                      id="audit_description"
                      value={auditFormData.description}
                      onChange={(e) => setAuditFormData({ ...auditFormData, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAuditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Scheduling..." : "Schedule Audit"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Audits & Assessments</CardTitle>
              <CardDescription>Track compliance audits and assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Auditor</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audits.map((audit) => (
                      <TableRow key={audit.id}>
                        <TableCell className="font-medium">{audit.title}</TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(audit.type)}>{audit.type.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>{audit.auditor}</TableCell>
                        <TableCell>{new Date(audit.start_date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(audit.end_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(audit.status)}>
                            {audit.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View Details
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
      </Tabs>
    </div>
  )
}
