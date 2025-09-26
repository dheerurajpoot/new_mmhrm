"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, Mail, Phone, MapPin } from "lucide-react"
import { getCurrentUser } from "@/lib/auth/client"
import type { Profile } from "@/lib/types"

interface TeamMember {
  id: string
  email: string
  full_name: string
  profile_photo?: string
  role: string
  department?: string
  position?: string
  phone?: string
  address?: string
}

interface Team {
  id: string
  name: string
  leader: TeamMember
  members: TeamMember[]
}

export function TeamMembers() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user as Profile)
        if (user) {
          await fetchTeamMembers(user.id)
        }
      } catch (error) {
        console.error("Error fetching current user:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCurrentUser()
  }, [])

  const fetchTeamMembers = async (userId: string) => {
    try {
      const response = await fetch(`/api/teams/member/${userId}`)
      if (response.ok) {
        const teamData = await response.json()
        setTeam(teamData)
      }
    } catch (error) {
      console.error("Error fetching team members:", error)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
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

  if (!team) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members
          </CardTitle>
          <CardDescription>Your team collaboration hub</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No team assigned</p>
            <p className="text-sm text-gray-400">Contact your administrator to be assigned to a team.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const allMembers = [team.leader, ...team.members]
  const otherMembers = allMembers.filter(member => member.id !== currentUser?.id)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Team Members
        </CardTitle>
        <CardDescription>
          {team.name} - Collaborate with your team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Team Leader */}
          <div className="border rounded-lg p-2 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={team.leader.profile_photo || ""} />
                  <AvatarFallback>
                    {team.leader.full_name?.charAt(0) || team.leader.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                  <UserCheck className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{team.leader.full_name}</h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Team Leader
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{team.leader.position || team.leader.department}</p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-[10px]  text-gray-500 lg:text-xs">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {team.leader.email}
                  </div>
                  {team.leader.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {team.leader.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Team Members */}
          {otherMembers.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Members ({otherMembers.length})
              </h4>
              <div className="grid gap-3">
                {otherMembers.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.profile_photo || ""} />
                        <AvatarFallback>
                          {member.full_name?.charAt(0) || member.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{member.full_name}</h4>
                        <p className="text-sm text-gray-600">{member.position || member.department}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {member.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-xs">
                          {member.role}
                        </Badge>
                        {member.department && (
                          <span className="text-xs text-gray-500">{member.department}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {otherMembers.length === 0 && (
            <div className="text-center py-6">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">You're the only member in this team.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
