import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
	getTeamsCollection,
	getUsersCollection,
} from "@/lib/mongodb/collections";

export async function GET() {
	try {
		const teamsCollection = await getTeamsCollection();
		const usersCollection = await getUsersCollection();

		const teams = await teamsCollection.find({}).toArray();

		// Populate team data with user details
		const populatedTeams = await Promise.all(
			teams.map(async (team) => {
				const leader = await usersCollection.findOne({
					_id: team.leader_id,
				});
				const members =
					team.member_ids && team.member_ids.length > 0
						? await usersCollection
								.find({ _id: { $in: team.member_ids } })
								.toArray()
						: [];

				return {
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
					})),
					created_at: team.created_at,
				};
			})
		);

		return NextResponse.json(populatedTeams);
	} catch (error) {
		console.error("Error fetching teams:", error);
		return NextResponse.json(
			{ error: "Failed to fetch teams" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const {
			name,
			leaderId,
			memberIds = [],
		}: {
			name: string;
			leaderId: string;
			memberIds?: string[];
		} = await request.json();

		if (!name || !leaderId) {
			return NextResponse.json(
				{ error: "Team name and leader are required" },
				{ status: 400 }
			);
		}

		const teamsCollection = await getTeamsCollection();
		const usersCollection = await getUsersCollection();

		// Verify leader exists
		if (!ObjectId.isValid(leaderId)) {
			return NextResponse.json(
				{ error: "Invalid leader ID" },
				{ status: 400 }
			);
		}

		const leader = await usersCollection.findOne({
			_id: new ObjectId(leaderId),
		});
		if (!leader) {
			return NextResponse.json(
				{ error: "Leader not found" },
				{ status: 400 }
			);
		}

		// Verify members exist
		if (memberIds && memberIds.length > 0) {
			const validMemberIds = memberIds.filter((id: string) =>
				ObjectId.isValid(id)
			);
			if (validMemberIds.length !== memberIds.length) {
				return NextResponse.json(
					{ error: "Some member IDs are invalid" },
					{ status: 400 }
				);
			}

			const members = await usersCollection
				.find({
					_id: {
						$in: validMemberIds.map(
							(id: string) => new ObjectId(id)
						),
					},
				})
				.toArray();

			if (members.length !== validMemberIds.length) {
				return NextResponse.json(
					{ error: "Some members not found" },
					{ status: 400 }
				);
			}
		}

		const newTeam = {
			name,
			leader_id: new ObjectId(leaderId),
			member_ids: (memberIds || []).map((id: string) => new ObjectId(id)),
			created_at: new Date(),
			updated_at: new Date(),
		};

		const result = await teamsCollection.insertOne(newTeam);

		return NextResponse.json({
			success: true,
			teamId: result.insertedId.toString(),
			message: "Team created successfully",
		});
	} catch (error) {
		console.error("Error creating team:", error);
		return NextResponse.json(
			{ error: "Failed to create team" },
			{ status: 500 }
		);
	}
}
