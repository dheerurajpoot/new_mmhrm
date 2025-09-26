import { NextRequest, NextResponse } from "next/server"
import { getServerUser } from "@/lib/auth/server"
import { getProfilesCollection, getUsersCollection, getLeaveRequestsCollection, getTeamsCollection, getTimeEntriesCollection } from "@/lib/mongodb/collections"

export async function DELETE(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user || !["admin", "hr"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const results: any = {}

    try {
      const profilesCollection = await getProfilesCollection()
      const teamsCollection = await getTeamsCollection()
      const leaveRequestsCollection = await getLeaveRequestsCollection()
      const timeEntriesCollection = await getTimeEntriesCollection()

      // Define test email patterns to identify test profiles
      const testEmailPatterns = [
        "john.doe@company.com",
        "jane.smith@company.com", 
        "bob.johnson@company.com",
        "alice.brown@company.com"
      ]

      // Find and remove test profiles
      const testProfiles = await profilesCollection.find({
        email: { $in: testEmailPatterns }
      }).toArray()

      if (testProfiles.length > 0) {
        const testProfileIds = testProfiles.map(profile => profile._id)
        
        // Remove test leave requests
        const leaveRequestsResult = await leaveRequestsCollection.deleteMany({
          employee_id: { $in: testProfileIds }
        })
        results.leaveRequests = leaveRequestsResult.deletedCount

        // Remove test time entries
        const timeEntriesResult = await timeEntriesCollection.deleteMany({
          employee_id: { $in: testProfileIds }
        })
        results.timeEntries = timeEntriesResult.deletedCount

        // Remove test teams (teams with test profile leaders or members)
        const teamsResult = await teamsCollection.deleteMany({
          $or: [
            { leader_id: { $in: testProfileIds } },
            { member_ids: { $in: testProfileIds } }
          ]
        })
        results.teams = teamsResult.deletedCount

        // Remove test profiles
        const profilesResult = await profilesCollection.deleteMany({
          email: { $in: testEmailPatterns }
        })
        results.profiles = profilesResult.deletedCount

        console.log("Removed test data:", results)
      } else {
        results.profiles = 0
        results.teams = 0
        results.leaveRequests = 0
        results.timeEntries = 0
        console.log("No test profiles found to remove")
      }

      return NextResponse.json({
        success: true,
        message: "Test data cleanup completed",
        results
      })

    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ 
        error: "Database error", 
        details: dbError instanceof Error ? dbError.message : "Unknown error" 
      }, { status: 500 })
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user || !["admin", "hr"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const profilesCollection = await getProfilesCollection()
      const teamsCollection = await getTeamsCollection()
      const leaveRequestsCollection = await getLeaveRequestsCollection()
      const timeEntriesCollection = await getTimeEntriesCollection()

      // Define test email patterns to identify test profiles
      const testEmailPatterns = [
        "john.doe@company.com",
        "jane.smith@company.com", 
        "bob.johnson@company.com",
        "alice.brown@company.com"
      ]

      // Find test profiles
      const testProfiles = await profilesCollection.find({
        email: { $in: testEmailPatterns }
      }).toArray()

      if (testProfiles.length > 0) {
        const testProfileIds = testProfiles.map(profile => profile._id)
        
        // Count related test data
        const testLeaveRequests = await leaveRequestsCollection.countDocuments({
          employee_id: { $in: testProfileIds }
        })

        const testTimeEntries = await timeEntriesCollection.countDocuments({
          employee_id: { $in: testProfileIds }
        })

        const testTeams = await teamsCollection.countDocuments({
          $or: [
            { leader_id: { $in: testProfileIds } },
            { member_ids: { $in: testProfileIds } }
          ]
        })

        return NextResponse.json({
          testDataFound: true,
          counts: {
            profiles: testProfiles.length,
            teams: testTeams,
            leaveRequests: testLeaveRequests,
            timeEntries: testTimeEntries
          },
          testProfiles: testProfiles.map(profile => ({
            id: profile._id,
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role
          }))
        })
      } else {
        return NextResponse.json({
          testDataFound: false,
          message: "No test profiles found"
        })
      }

    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ 
        error: "Database error", 
        details: dbError instanceof Error ? dbError.message : "Unknown error" 
      }, { status: 500 })
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
