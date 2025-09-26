import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getTeamsCollection, getUsersCollection } from "@/lib/mongodb/collections"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, leaderId, memberIds } = await request.json()
    const teamId = params.id
    
    if (!ObjectId.isValid(teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 })
    }
    
    const teamsCollection = await getTeamsCollection()
    const usersCollection = await getUsersCollection()
    
    // Verify team exists
    const existingTeam = await teamsCollection.findOne({ _id: new ObjectId(teamId) })
    if (!existingTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }
    
    // Verify leader exists if provided
    if (leaderId) {
      const leader = await usersCollection.findOne({ _id: new ObjectId(leaderId) })
      if (!leader) {
        return NextResponse.json({ error: "Leader not found" }, { status: 400 })
      }
    }
    
    // Verify members exist if provided
    if (memberIds && memberIds.length > 0) {
      const memberObjectIds = memberIds.map((id: string) => new ObjectId(id))
      const members = await usersCollection.find({ 
        _id: { $in: memberObjectIds } 
      }).toArray()
      
      if (members.length !== memberIds.length) {
        return NextResponse.json({ error: "Some members not found" }, { status: 400 })
      }
    }
    
    const updateData: any = {
      updated_at: new Date(),
    }
    
    if (name) updateData.name = name
    if (leaderId) updateData.leader_id = new ObjectId(leaderId)
    if (memberIds) updateData.member_ids = memberIds.map((id: string) => new ObjectId(id))
    
    await teamsCollection.updateOne(
      { _id: new ObjectId(teamId) },
      { $set: updateData }
    )
    
    return NextResponse.json({
      success: true,
      message: "Team updated successfully"
    })
  } catch (error) {
    console.error("Error updating team:", error)
    return NextResponse.json({ error: "Failed to update team" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = params.id
    
    if (!ObjectId.isValid(teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 })
    }
    
    const teamsCollection = await getTeamsCollection()
    
    const result = await teamsCollection.deleteOne({ _id: new ObjectId(teamId) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: "Team deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting team:", error)
    return NextResponse.json({ error: "Failed to delete team" }, { status: 500 })
  }
}
