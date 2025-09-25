"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Cake, Gift, Calendar, Star, Sparkles } from "lucide-react"

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
}

export function UpcomingBirthdays() {
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<BirthdayEmployee[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUpcomingBirthdays()
  }, [])

  const fetchUpcomingBirthdays = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/employee/search")
      
      if (response.ok) {
        const employees: Employee[] = await response.json()
        const today = new Date()
        const currentYear = today.getFullYear()
        
        // Calculate upcoming birthdays
        const birthdayData: BirthdayEmployee[] = employees
          .filter(emp => emp.birth_date) // Only employees with birth dates
          .map(emp => {
            const birthDate = new Date(emp.birth_date!)
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
              'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ]
            
            return {
              ...emp,
              daysUntilBirthday,
              birthdayMonth: monthNames[birthMonth],
              birthdayDay: birthDay,
              age: thisYearBirthday.getFullYear() === currentYear ? age : age + 1
            }
          })
          .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday) // Sort by closest birthday
          .slice(0, 4) // Get only 4 upcoming birthdays
        
        setUpcomingBirthdays(birthdayData)
        console.log("Upcoming birthdays:", birthdayData)
      } else {
        console.error("Failed to fetch employees for birthday data")
      }
    } catch (error) {
      console.error("Error fetching upcoming birthdays:", error)
      // Fallback to mock data
      setUpcomingBirthdays([
        {
          id: "1",
          full_name: "John Doe",
          email: "john.doe@company.com",
          department: "Engineering",
          position: "Software Developer",
          profile_photo: null,
          birth_date: "1990-12-25",
          daysUntilBirthday: 5,
          birthdayMonth: "Dec",
          birthdayDay: 25,
          age: 34
        },
        {
          id: "2",
          full_name: "Jane Smith",
          email: "jane.smith@company.com",
          department: "Marketing",
          position: "Marketing Manager",
          profile_photo: null,
          birth_date: "1988-01-15",
          daysUntilBirthday: 12,
          birthdayMonth: "Jan",
          birthdayDay: 15,
          age: 36
        },
        {
          id: "3",
          full_name: "Bob Johnson",
          email: "bob.johnson@company.com",
          department: "Sales",
          position: "Sales Representative",
          profile_photo: null,
          birth_date: "1992-02-10",
          daysUntilBirthday: 18,
          birthdayMonth: "Feb",
          birthdayDay: 10,
          age: 32
        },
        {
          id: "4",
          full_name: "Alice Brown",
          email: "alice.brown@company.com",
          department: "HR",
          position: "HR Specialist",
          profile_photo: null,
          birth_date: "1985-03-08",
          daysUntilBirthday: 25,
          birthdayMonth: "Mar",
          birthdayDay: 8,
          age: 39
        }
      ])
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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-white rounded-full shadow-sm">
            <Cake className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Upcoming Birthdays</CardTitle>
            <p className="text-sm text-gray-600">Celebrate your colleagues!</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 md:p-6">
        {isLoading ? (
          <div className="space-y-3 md:space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3 animate-pulse p-2 md:p-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="w-24 md:w-32 h-3 md:h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="w-16 md:w-24 h-2 md:h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="w-12 md:w-16 h-5 md:h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : upcomingBirthdays.length === 0 ? (
          <div className="text-center py-6 md:py-8 text-gray-500">
            <Gift className="w-10 md:w-12 h-10 md:h-12 mx-auto mb-3 md:mb-4 opacity-50" />
            <p className="text-sm font-medium">No upcoming birthdays</p>
            <p className="text-xs">Check back later for birthday celebrations!</p>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {upcomingBirthdays.map((employee, index) => {
              const isNext = index === 0; // Highlight the most upcoming birthday
              
              return (
                <div 
                  key={employee.id} 
                  className={`relative flex items-center space-x-3 p-3 md:p-4 rounded-xl transition-all duration-300 ${
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
                    <Avatar className={`${isNext ? 'w-12 h-12 md:w-14 md:h-14' : 'w-10 h-10 md:w-12 md:h-12'} ${isNext ? 'ring-2 ring-pink-300 ring-offset-2' : ''}`}>
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
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                      <h4 className={`${isNext ? 'text-base md:text-lg font-bold' : 'text-sm md:text-base font-semibold'} text-gray-900 truncate`}>
                        {employee.full_name}
                      </h4>
                      {employee.daysUntilBirthday <= 7 && (
                        <div className="flex items-center space-x-1">
                          <Cake className={`${isNext ? 'w-5 h-5' : 'w-4 h-4'} text-pink-500 ${isNext ? 'animate-bounce' : ''}`} />
                          {isNext && <span className="text-xs font-medium text-pink-600">Next!</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span className={isNext ? 'font-semibold text-pink-700' : ''}>{employee.birthdayMonth} {employee.birthdayDay}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate">{employee.position}</span>
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
                      Turning {employee.age}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
