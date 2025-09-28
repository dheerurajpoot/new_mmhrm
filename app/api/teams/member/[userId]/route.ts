import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
	getTeamsCollection,
	getUsersCollection,
} from "@/lib/mongodb/collections";

export async function GET(
	request: NextRequest,
	{ params }: { params: { userId: string } }
) {
	try {
		const userId = params.userId;

		if (!ObjectId.isValid(userId)) {
			return NextResponse.json(
				{ error: "Invalid user ID" },
				{ status: 400 }
			);
		}

		const teamsCollection = await getTeamsCollection();
		const usersCollection = await getUsersCollection();

		// Find team where user is either leader or member
		const team = await teamsCollection.findOne({
			$or: [
				{ leader_id: new ObjectId(userId) },
				{ member_ids: new ObjectId(userId) },
			],
		});

		if (!team) {
			return NextResponse.json(
				{ error: "No team found" },
				{ status: 300 }
			);
		}

		// Get leader details
		const leader = await usersCollection.findOne({ _id: team.leader_id });

		// Get member details
		const members = await usersCollection
			.find({
				_id: { $in: team.member_ids },
			})
			.toArray();

		const teamData = {
			id: team._id.toString(),
			name: team.name,
			leader: leader
				? {
						id: leader._id.toString(),
						email: leader.email,
						full_name: leader.full_name,
						profile_photo: leader.profile_photo,
						role: leader.role,
						department: leader.department,
						position: leader.position,
						phone: leader.phone,
						address: leader.address,
				  }
				: null,
			members: members.map((member) => ({
				id: member._id.toString(),
				email: member.email,
				full_name: member.full_name,
				profile_photo: member.profile_photo,
				role: member.role,
				department: member.department,
				position: member.position,
				phone: member.phone,
				address: member.address,
			})),
			created_at: team.created_at,
		};

		return NextResponse.json(teamData);
	} catch (error) {
		console.error("Error fetching team for user:", error);
		return NextResponse.json(
			{ error: "Failed to fetch team" },
			{ status: 500 }
		);
	}
}
