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
import { Progress } from "@/components/ui/progress"
import { Target, Award, BarChart3, Star } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PerformanceReview {
  id: string
  employee_id: string
  employee_name: string
  review_period: string
  overall_rating: number
  goals_achievement: number
  skills_rating: number
  feedback: string
  reviewer: string
  status: "draft" | "completed" | "pending_approval"
  created_date: string
}

interface Goal {
  id: string
  employee_id: string
  employee_name: string
  title: string
  description: string
  target_date: string
  progress: number
  status: "not_started" | "in_progress" | "completed" | "overdue"
  priority: "low" | "medium" | "high"
}

interface ProductivityMetric {
  id: string
  employee_id: string
  employee_name: string
  metric_name: string
  target_value: number
  current_value: number
  unit: string
  period: string
  last_updated: string
}

export function PerformanceProductivity() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [metrics, setMetrics] = useState<ProductivityMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false)
  const [isMetricDialogOpen, setIsMetricDialogOpen] = useState(false)

  const [reviewFormData, setReviewFormData] = useState({
    employee_id: "",
    review_period: "",
    overall_rating: 3,
    goals_achievement: 3,
    skills_rating: 3,
    feedback: "",
    reviewer: "",
  })

  const [goalFormData, setGoalFormData] = useState({
    employee_id: "",
    title: "",
    description: "",
    target_date: "",
    priority: "medium" as "low" | "medium" | "high",
  })

  const [metricFormData, setMetricFormData] = useState({
    employee_id: "",
    metric_name: "",
    target_value: "",
    current_value: "",
    unit: "",
    period: "monthly",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Mock data for demonstration
      setReviews([
        {
          id: "1",
          employee_id: "emp1",
          employee_name: "John Smith",
          review_period: "Q4 2023",
          overall_rating: 4,
          goals_achievement: 4,
          skills_rating: 4,
          feedback: "Excellent performance, exceeded expectations in most areas.",
          reviewer: "Jane Manager",
          status: "completed",
          created_date: "2024-01-15",
        },
        {
          id: "2",
          employee_id: "emp2",
          employee_name: "Sarah Johnson",
          review_period: "Q4 2023",
          overall_rating: 3,
          goals_achievement: 3,
          skills_rating: 4,
          feedback: "Good performance, room for improvement in project management.",
          reviewer: "Mike Director",
          status: "pending_approval",
          created_date: "2024-01-10",
        },
      ])

      setGoals([
        {
          id: "1",
          employee_id: "emp1",
          employee_name: "John Smith",
          title: "Complete React Certification",
          description: "Obtain React developer certification to improve frontend skills",
          target_date: "2024-03-31",
          progress: 75,
          status: "in_progress",
          priority: "high",
        },
        {
          id: "2",
          employee_id: "emp2",
          employee_name: "Sarah Johnson",
          title: "Lead Marketing Campaign",
          description: "Successfully launch and manage Q1 marketing campaign",
          target_date: "2024-02-28",
          progress: 90,
          status: "in_progress",
          priority: "high",
        },
      ])

      setMetrics([
        {
          id: "1",
          employee_id: "emp1",
          employee_name: "John Smith",
          metric_name: "Code Reviews Completed",
          target_value: 20,
          current_value: 18,
          unit: "reviews",
          period: "monthly",
          last_updated: "2024-01-25",
        },
        {
          id: "2",
          employee_id: "emp2",
          employee_name: "Sarah Johnson",
          metric_name: "Leads Generated",
          target_value: 50,
          current_value: 45,
          unit: "leads",
          period: "monthly",
          last_updated: "2024-01-24",
        },
      ])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch performance data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newReview: PerformanceReview = {
        id: Date.now().toString(),
        ...reviewFormData,
        employee_name: "Employee Name", // Would be fetched from employee data
        status: "draft",
        created_date: new Date().toISOString().split("T")[0],
      }

      setReviews([newReview, ...reviews])
      setIsReviewDialogOpen(false)
      resetReviewForm()

      toast({
        title: "Success",
        description: "Performance review created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create performance review",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newGoal: Goal = {
        id: Date.now().toString(),
        ...goalFormData,
        employee_name: "Employee Name", // Would be fetched from employee data
        progress: 0,
        status: "not_started",
      }

      setGoals([newGoal, ...goals])
      setIsGoalDialogOpen(false)
      resetGoalForm()

      toast({
        title: "Success",
        description: "Goal created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMetricSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newMetric: ProductivityMetric = {
        id: Date.now().toString(),
        ...metricFormData,
        employee_name: "Employee Name", // Would be fetched from employee data
        target_value: Number.parseFloat(metricFormData.target_value),
        current_value: Number.parseFloat(metricFormData.current_value),
        last_updated: new Date().toISOString().split("T")[0],
      }

      setMetrics([newMetric, ...metrics])
      setIsMetricDialogOpen(false)
      resetMetricForm()

      toast({
        title: "Success",
        description: "Productivity metric created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create productivity metric",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetReviewForm = () => {
    setReviewFormData({
      employee_id: "",
      review_period: "",
      overall_rating: 3,
      goals_achievement: 3,
      skills_rating: 3,
      feedback: "",
      reviewer: "",
    })
  }

  const resetGoalForm = () => {
    setGoalFormData({
      employee_id: "",
      title: "",
      description: "",
      target_date: "",
      priority: "medium",
    })
  }

  const resetMetricForm = () => {
    setMetricFormData({
      employee_id: "",
      metric_name: "",
      target_value: "",
      current_value: "",
      unit: "",
      period: "monthly",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-red-100 text-red-800"
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "not_started":
        return "bg-gray-100 text-gray-800"
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

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  if (loading && reviews.length === 0) {
    return <div className="flex items-center justify-center h-64">Loading performance data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance & Productivity</h2>
          <p className="text-muted-foreground">Track employee performance, goals, and productivity metrics</p>
        </div>
      </div>

      <Tabs defaultValue="reviews" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reviews">Performance Reviews</TabsTrigger>
          <TabsTrigger value="goals">Goals & Objectives</TabsTrigger>
          <TabsTrigger value="metrics">Productivity Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Award className="mr-2 h-4 w-4" />
                  Create Performance Review
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create Performance Review</DialogTitle>
                  <DialogDescription>Conduct a performance review for an employee</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="review_employee_id">Employee</Label>
                      <Input
                        id="review_employee_id"
                        value={reviewFormData.employee_id}
                        onChange={(e) => setReviewFormData({ ...reviewFormData, employee_id: e.target.value })}
                        placeholder="Employee ID or Name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="review_period">Review Period</Label>
                      <Input
                        id="review_period"
                        value={reviewFormData.review_period}
                        onChange={(e) => setReviewFormData({ ...reviewFormData, review_period: e.target.value })}
                        placeholder="e.g., Q1 2024"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="overall_rating">Overall Rating (1-5)</Label>
                      <Select
                        value={reviewFormData.overall_rating.toString()}
                        onValueChange={(value) =>
                          setReviewFormData({ ...reviewFormData, overall_rating: Number.parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Poor</SelectItem>
                          <SelectItem value="2">2 - Below Average</SelectItem>
                          <SelectItem value="3">3 - Average</SelectItem>
                          <SelectItem value="4">4 - Good</SelectItem>
                          <SelectItem value="5">5 - Excellent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goals_achievement">Goals Achievement (1-5)</Label>
                      <Select
                        value={reviewFormData.goals_achievement.toString()}
                        onValueChange={(value) =>
                          setReviewFormData({ ...reviewFormData, goals_achievement: Number.parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Poor</SelectItem>
                          <SelectItem value="2">2 - Below Average</SelectItem>
                          <SelectItem value="3">3 - Average</SelectItem>
                          <SelectItem value="4">4 - Good</SelectItem>
                          <SelectItem value="5">5 - Excellent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skills_rating">Skills Rating (1-5)</Label>
                      <Select
                        value={reviewFormData.skills_rating.toString()}
                        onValueChange={(value) =>
                          setReviewFormData({ ...reviewFormData, skills_rating: Number.parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Poor</SelectItem>
                          <SelectItem value="2">2 - Below Average</SelectItem>
                          <SelectItem value="3">3 - Average</SelectItem>
                          <SelectItem value="4">4 - Good</SelectItem>
                          <SelectItem value="5">5 - Excellent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reviewer">Reviewer</Label>
                    <Input
                      id="reviewer"
                      value={reviewFormData.reviewer}
                      onChange={(e) => setReviewFormData({ ...reviewFormData, reviewer: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedback">Feedback & Comments</Label>
                    <Textarea
                      id="feedback"
                      value={reviewFormData.feedback}
                      onChange={(e) => setReviewFormData({ ...reviewFormData, feedback: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create Review"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Reviews</CardTitle>
              <CardDescription>Track and manage employee performance reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Overall Rating</TableHead>
                      <TableHead>Goals</TableHead>
                      <TableHead>Skills</TableHead>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium">{review.employee_name}</TableCell>
                        <TableCell>{review.review_period}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">{getRatingStars(review.overall_rating)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">{getRatingStars(review.goals_achievement)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">{getRatingStars(review.skills_rating)}</div>
                        </TableCell>
                        <TableCell>{review.reviewer}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(review.status)}>
                            {review.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Target className="mr-2 h-4 w-4" />
                  Create Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Goal</DialogTitle>
                  <DialogDescription>Set a new goal for an employee</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleGoalSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal_employee_id">Employee</Label>
                      <Input
                        id="goal_employee_id"
                        value={goalFormData.employee_id}
                        onChange={(e) => setGoalFormData({ ...goalFormData, employee_id: e.target.value })}
                        placeholder="Employee ID or Name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="target_date">Target Date</Label>
                      <Input
                        id="target_date"
                        type="date"
                        value={goalFormData.target_date}
                        onChange={(e) => setGoalFormData({ ...goalFormData, target_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal_title">Goal Title</Label>
                      <Input
                        id="goal_title"
                        value={goalFormData.title}
                        onChange={(e) => setGoalFormData({ ...goalFormData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal_priority">Priority</Label>
                      <Select
                        value={goalFormData.priority}
                        onValueChange={(value: "low" | "medium" | "high") =>
                          setGoalFormData({ ...goalFormData, priority: value })
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
                    <Label htmlFor="goal_description">Description</Label>
                    <Textarea
                      id="goal_description"
                      value={goalFormData.description}
                      onChange={(e) => setGoalFormData({ ...goalFormData, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsGoalDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create Goal"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Goals & Objectives</CardTitle>
              <CardDescription>Track employee goals and their progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Goal</TableHead>
                      <TableHead>Target Date</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {goals.map((goal) => (
                      <TableRow key={goal.id}>
                        <TableCell className="font-medium">{goal.employee_name}</TableCell>
                        <TableCell>{goal.title}</TableCell>
                        <TableCell>{new Date(goal.target_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={goal.progress} className="w-16" />
                            <span className="text-sm">{goal.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(goal.priority)}>{goal.priority.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(goal.status)}>
                            {goal.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isMetricDialogOpen} onOpenChange={setIsMetricDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Add Productivity Metric
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Productivity Metric</DialogTitle>
                  <DialogDescription>Track a productivity metric for an employee</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleMetricSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="metric_employee_id">Employee</Label>
                      <Input
                        id="metric_employee_id"
                        value={metricFormData.employee_id}
                        onChange={(e) => setMetricFormData({ ...metricFormData, employee_id: e.target.value })}
                        placeholder="Employee ID or Name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="metric_name">Metric Name</Label>
                      <Input
                        id="metric_name"
                        value={metricFormData.metric_name}
                        onChange={(e) => setMetricFormData({ ...metricFormData, metric_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="target_value">Target Value</Label>
                      <Input
                        id="target_value"
                        type="number"
                        value={metricFormData.target_value}
                        onChange={(e) => setMetricFormData({ ...metricFormData, target_value: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current_value">Current Value</Label>
                      <Input
                        id="current_value"
                        type="number"
                        value={metricFormData.current_value}
                        onChange={(e) => setMetricFormData({ ...metricFormData, current_value: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        value={metricFormData.unit}
                        onChange={(e) => setMetricFormData({ ...metricFormData, unit: e.target.value })}
                        placeholder="e.g., tasks, hours"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period">Period</Label>
                    <Select
                      value={metricFormData.period}
                      onValueChange={(value) => setMetricFormData({ ...metricFormData, period: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsMetricDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Adding..." : "Add Metric"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Productivity Metrics</CardTitle>
              <CardDescription>Monitor employee productivity and performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Metric</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>Achievement</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.map((metric) => {
                      const achievement = Math.round((metric.current_value / metric.target_value) * 100)
                      return (
                        <TableRow key={metric.id}>
                          <TableCell className="font-medium">{metric.employee_name}</TableCell>
                          <TableCell>{metric.metric_name}</TableCell>
                          <TableCell>
                            {metric.target_value} {metric.unit}
                          </TableCell>
                          <TableCell>
                            {metric.current_value} {metric.unit}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress value={Math.min(achievement, 100)} className="w-16" />
                              <span className="text-sm">{achievement}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{metric.period}</TableCell>
                          <TableCell>{new Date(metric.last_updated).toLocaleDateString()}</TableCell>
                        </TableRow>
                      )
                    })}
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
