"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Cake, Gift, Calendar, Star, Sparkles, ChevronDown, ChevronRight, Users } from "lucide-react"

interface Employee {
  id: string
  full_name: string
  email: string
  department: string
  position: string
  profile_photo?: string
  birth_date?: string
}

interface BirthdayEmployee extends Employee {
  daysUntilBirthday: number
  birthdayMonth: string
  birthdayDay: number
  age: number
  monthNumber: number
}

interface MonthGroup {
  month: string
  monthNumber: number
  employees: BirthdayEmployee[]
  isCurrentMonth: boolean
}

export function UpcomingBirthdays({ 
  showAllMonths = false, 
  maxEmployees = 4,
  title = "Upcoming Birthdays",
  description = "Celebrate your colleagues!"
}: {
  showAllMonths?: boolean
  maxEmployees?: number
  title?: string
  description?: string
}) {
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<BirthdayEmployee[]>([])
  const [monthGroups, setMonthGroups] = useState<MonthGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchUpcomingBirthdays()
  }, [])

  const fetchUpcomingBirthdays = async () => {
    try {
      setIsLoading(true)
      console.log("Fetching upcoming birthdays...")
      const response = await fetch("/api/employee/search")
      
      if (response.ok) {
        const employees: Employee[] = await response.json()
        console.log("Fetched employees for birthdays:", employees.length)
        console.log("Employees with birth dates:", employees.filter(emp => emp.birth_date).length)
        console.log("Sample employee with birth date:", employees.find(emp => emp.birth_date))
        
        const today = new Date()
        const currentYear = today.getFullYear()
        const currentMonth = today.getMonth()
        
        // Calculate upcoming birthdays
        const birthdayData: BirthdayEmployee[] = employees
          .filter(emp => emp.birth_date) // Only employees with birth dates
          .map(emp => {
            console.log("Processing birthday for:", emp.full_name, "Birth date:", emp.birth_date)
            const birthDate = new Date(emp.birth_date!)
            console.log("Parsed birth date:", birthDate, "Valid:", !isNaN(birthDate.getTime()))
            
            if (isNaN(birthDate.getTime())) {
              console.log("Invalid birth date, skipping:", emp.full_name)
              return null
            }
            
            const birthMonth = birthDate.getMonth()
            const birthDay = birthDate.getDate()
            
            // Calculate this year's birthday
            let thisYearBirthday = new Date(currentYear, birthMonth, birthDay)
            
            // If birthday has passed this year, use next year's date
            if (thisYearBirthday < today) {
              thisYearBirthday = new Date(currentYear + 1, birthMonth, birthDay)
            }
            
            const daysUntilBirthday = Math.ceil(
              (thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            )
            
            const age = currentYear - birthDate.getFullYear()
            const monthNames = [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ]
            
            return {
              ...emp,
              daysUntilBirthday,
              birthdayMonth: monthNames[birthMonth],
              birthdayDay: birthDay,
              age: thisYearBirthday.getFullYear() === currentYear ? age : age + 1,
              monthNumber: birthMonth
            }
          })
          .filter((item): item is BirthdayEmployee => item !== null) // Remove null entries
          .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday) // Sort by closest birthday
        
        console.log("Final birthday data:", birthdayData)
        setUpcomingBirthdays(birthdayData)

        // Group by month
        const groupedByMonth: { [key: number]: BirthdayEmployee[] } = {}
        birthdayData.forEach(emp => {
          if (!groupedByMonth[emp.monthNumber]) {
            groupedByMonth[emp.monthNumber] = []
          }
          groupedByMonth[emp.monthNumber].push(emp)
        })

        // Create month groups
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ]

        const groups: MonthGroup[] = Object.entries(groupedByMonth)
          .map(([monthNum, employees]) => ({
            month: monthNames[parseInt(monthNum)],
            monthNumber: parseInt(monthNum),
            employees: employees.sort((a, b) => a.birthdayDay - b.birthdayDay),
            isCurrentMonth: parseInt(monthNum) === currentMonth
          }))
          .sort((a, b) => {
            // Current month first, then upcoming months
            if (a.isCurrentMonth && !b.isCurrentMonth) return -1
            if (!a.isCurrentMonth && b.isCurrentMonth) return 1
            return a.monthNumber - b.monthNumber
          })

        setMonthGroups(groups)
        
        // Auto-expand current month and next month
        const nextMonth = (currentMonth + 1) % 12
        setExpandedMonths(new Set([currentMonth, nextMonth]))
        
        console.log("Upcoming birthdays:", birthdayData)
        console.log("Month groups:", groups)
      } else {
        console.error("Failed to fetch employees for birthday data")
      }
    } catch (error) {
      console.error("Error fetching upcoming birthdays:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getBirthdayBadgeColor = (daysUntil: number) => {
    if (daysUntil <= 7) return "bg-red-100 text-red-800"
    if (daysUntil <= 14) return "bg-orange-100 text-orange-800"
    if (daysUntil <= 30) return "bg-blue-100 text-blue-800"
    return "bg-gray-100 text-gray-800"
  }

  const getBirthdayText = (daysUntil: number) => {
    if (daysUntil === 0) return "Today!"
    if (daysUntil === 1) return "Tomorrow"
    if (daysUntil <= 7) return `${daysUntil} days`
    return `${daysUntil} days`
  }

  const toggleMonth = (monthNumber: number) => {
    const newExpanded = new Set(expandedMonths)
    if (newExpanded.has(monthNumber)) {
      newExpanded.delete(monthNumber)
    } else {
      newExpanded.add(monthNumber)
    }
    setExpandedMonths(newExpanded)
  }

  const renderEmployeeCard = (employee: BirthdayEmployee, isNext: boolean = false) => (
    <div 
      key={employee.id} 
      className={`relative flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
        isNext 
          ? 'bg-gradient-to-r from-pink-100 via-purple-50 to-blue-50 border-2 border-pink-200 shadow-md hover:shadow-lg' 
          : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
      }`}
    >
      {/* Special decoration for next birthday */}
      {isNext && (
        <div className="absolute -top-1 -right-1 z-10">
          <div className="relative">
            <Star className="w-6 h-6 text-yellow-400 fill-current animate-pulse" />
            <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
          </div>
        </div>
      )}
      
      <div className="relative">
        <Avatar className={`${isNext ? 'w-12 h-12' : 'w-10 h-10'} ${isNext ? 'ring-2 ring-pink-300 ring-offset-2' : ''}`}>
          <AvatarImage src={employee.profile_photo} alt={employee.full_name} />
          <AvatarFallback className={`${
            isNext 
              ? 'bg-gradient-to-br from-pink-500 to-purple-500' 
              : 'bg-gradient-to-br from-pink-400 to-purple-400'
          } text-white font-semibold ${isNext ? 'text-base' : 'text-sm'}`}>
            {employee.full_name?.charAt(0) || 'E'}
          </AvatarFallback>
        </Avatar>
        {isNext && employee.daysUntilBirthday <= 1 && (
          <div className="absolute -bottom-1 -right-1">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <Cake className="w-3 h-3 text-white" />
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col space-y-1">
          <h4 className={`${isNext ? 'text-sm font-bold' : 'text-xs font-semibold'} text-gray-900 truncate`}>
            {employee.full_name}
          </h4>
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <Calendar className="w-3 h-3" />
            <span className={isNext ? 'font-semibold text-pink-700' : ''}>{employee.birthdayMonth} {employee.birthdayDay}</span>
          </div>
        </div>
      </div>
      
      <div className="text-right flex-shrink-0">
        <Badge className={`text-xs ${
          isNext 
            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' 
            : getBirthdayBadgeColor(employee.daysUntilBirthday)
        } ${isNext ? 'animate-pulse' : ''}`}>
          {getBirthdayText(employee.daysUntilBirthday)}
        </Badge>
        <div className={`text-xs mt-1 ${isNext ? 'text-pink-700 font-medium' : 'text-gray-500'}`}>
          Age {employee.age}
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white rounded-full shadow-sm">
              <Cake className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3 animate-pulse p-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="w-24 h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="w-16 h-2 bg-gray-200 rounded"></div>
                </div>
                <div className="w-12 h-5 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (upcomingBirthdays.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white rounded-full shadow-sm">
              <Cake className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8 text-gray-500">
            <Gift className="w-10 h-10 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No upcoming birthdays</p>
            <p className="text-xs">Check back later!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white rounded-full shadow-sm">
              <Cake className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          {showAllMonths && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Users className="w-4 h-4" />
              <span>{upcomingBirthdays.length} birthdays</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {showAllMonths ? (
          <div className="space-y-4">
            {monthGroups.map((group) => (
              <Collapsible 
                key={group.monthNumber} 
                open={expandedMonths.has(group.monthNumber)}
                onOpenChange={() => toggleMonth(group.monthNumber)}
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between p-3 h-auto hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        group.isCurrentMonth 
                          ? 'bg-pink-100 text-pink-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Cake className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h3 className={`font-semibold ${
                          group.isCurrentMonth ? 'text-pink-700' : 'text-gray-900'
                        }`}>
                          {group.month}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {group.employees.length} birthday{group.employees.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    {expandedMonths.has(group.monthNumber) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  {group.employees.map((employee, index) => 
                    renderEmployeeCard(employee, index === 0 && group.isCurrentMonth)
                  )}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBirthdays.slice(0, maxEmployees).map((employee, index) => 
              renderEmployeeCard(employee, index === 0)
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
