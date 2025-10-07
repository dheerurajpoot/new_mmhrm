"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Users, Plus, Edit, Trash2, UserCheck, Search, Crown, Calendar, Users2 } from "lucide-react";
import { toast } from "sonner";
import type { Profile } from "@/lib/types";
import { DeleteConfirmationModal, type DeleteItem } from "@/components/ui/delete-confirmation-modal";

interface Team {
	id: string;
	name: string;
	leader: Profile;
	members: Profile[];
	created_at: string;
}

export function TeamManagement() {
	const [teams, setTeams] = useState<Team[]>([]);
	const [employees, setEmployees] = useState<Profile[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
	const [isCreatingTeam, setIsCreatingTeam] = useState(false);
	const [editingTeam, setEditingTeam] = useState<Team | null>(null);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isSavingEdit, setIsSavingEdit] = useState(false);

	// Delete modal state
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [teamToDelete, setTeamToDelete] = useState<DeleteItem | null>(null);

	// Team form state
	const [newTeam, setNewTeam] = useState({
		name: "",
		leaderId: "",
		memberIds: [] as string[],
	});

	useEffect(() => {
		fetchTeams();
		fetchEmployees();
	}, []);

	const fetchTeams = async () => {
		try {
			const response = await fetch("/api/teams");
			if (!response.ok) throw new Error("Failed to fetch teams");
			const data = await response.json();
			setTeams(data || []);
		} catch (error) {
			console.error("Error fetching teams:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchEmployees = async () => {
		try {
			const response = await fetch("/api/employees");
			if (!response.ok) throw new Error("Failed to fetch employees");
			const data = await response.json();

			const mapped: Profile[] = (data || []).map((u: any) => ({
				id: u._id?.toString?.() || u._id || u.id,
				email: u.email,
				full_name: u.full_name ?? null,
				role: u.role,
				department: u.department ?? null,
				position: u.position ?? null,
				profile_photo: u.profile_photo ?? null,
				hire_date: u.hire_date ? new Date(u.hire_date).toISOString() : null,
				phone: u.phone ?? null,
				address: u.address ?? null,
				created_at: u.created_at ? new Date(u.created_at).toISOString() : "",
				updated_at: u.updated_at ? new Date(u.updated_at).toISOString() : "",
			}));

			setEmployees(mapped.filter((emp) => emp.role === "employee"));
		} catch (error) {
			console.error("Error fetching employees:", error);
		}
	};

	const handleCreateTeam = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newTeam.name || !newTeam.leaderId) {
			toast.error("Please fill in all required fields");
			return;
		}

		setIsCreatingTeam(true);
		try {
			const response = await fetch("/api/teams", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newTeam),
			});

			if (!response.ok) throw new Error("Failed to create team");

			toast.success("Team has been created successfully.");

			setNewTeam({ name: "", leaderId: "", memberIds: [] });
			setIsCreateTeamOpen(false);
			fetchTeams();
		} catch (error) {
			console.error("Error creating team:", error);
			toast.error("Failed to create team");
		} finally {
			setIsCreatingTeam(false);
		}
	};

	const handleDeleteTeam = async (teamId: string) => {
		const confirmed = window.confirm(
			"Are you sure you want to delete this team? This action cannot be undone."
		);
		if (!confirmed) return;

		try {
			const response = await fetch(`/api/teams/${teamId}`, {
				method: "DELETE",
			});
			if (!response.ok) throw new Error("Failed to delete team");
			toast.success("The team has been removed.");
			fetchTeams();
		} catch (error) {
			console.error("Error deleting team:", error);
			toast.error("Failed to delete team");
		}
	};

	// New delete modal functions
	const openDeleteModal = (team: Team) => {
		setTeamToDelete({
			id: team.id,
			type: 'team',
			data: team
		});
		setIsDeleteModalOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!teamToDelete) return;

		try {
			const response = await fetch(`/api/teams/${teamToDelete.id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setTeams(prev => prev.filter(t => t.id !== teamToDelete.id));
				toast.success("Team deleted successfully");
				setIsDeleteModalOpen(false);
				setTeamToDelete(null);
			} else {
				toast.error("Failed to delete team");
			}
		} catch (error) {
			console.error("Error deleting team:", error);
			toast.error("Failed to delete team");
		}
	};

	const openEditTeam = (team: Team) => {
		setEditingTeam(team);
		setIsEditOpen(true);
	};

	const handleSaveEdit = async () => {
		if (!editingTeam) return;
		setIsSavingEdit(true);
		try {
			const response = await fetch(`/api/teams/${editingTeam.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: editingTeam.name,
					leaderId: editingTeam.leader.id,
					memberIds: editingTeam.members.map((m) => m.id),
				}),
			});
			if (!response.ok) throw new Error("Failed to save team changes");
			toast.success("Team details saved successfully.");
			setIsEditOpen(false);
			setEditingTeam(null);
			fetchTeams();
		} catch (error) {
			console.error("Error saving team:", error);
			toast.error("Failed to save team changes");
		} finally {
			setIsSavingEdit(false);
		}
	};

	const toggleMemberSelection = (employeeId: string) => {
		if (newTeam.memberIds.includes(employeeId)) {
			setNewTeam({
				...newTeam,
				memberIds: newTeam.memberIds.filter((id) => id !== employeeId),
			});
		} else {
			setNewTeam({
				...newTeam,
				memberIds: [...newTeam.memberIds, employeeId],
			});
		}
	};

	const toggleEditMemberSelection = (employeeId: string) => {
		if (!editingTeam) return;
		const currentMembers = editingTeam.members.map((m) => m.id);
		if (currentMembers.includes(employeeId)) {
			setEditingTeam({
				...editingTeam,
				members: editingTeam.members.filter((m) => m.id !== employeeId),
			});
		} else {
			const employee = employees.find((emp) => emp.id === employeeId);
			if (employee) {
				setEditingTeam({
					...editingTeam,
					members: [...editingTeam.members, employee],
				});
			}
		}
	};

	const getTeamStats = () => {
		const totalTeams = teams.length;
		const totalMembers = teams.reduce((sum, team) => sum + team.members.length, 0);
		const averageTeamSize = totalTeams > 0 ? Math.round(totalMembers / totalTeams) : 0;
		const teamsWithLeaders = teams.filter(team => team.leader).length;
		
		return { totalTeams, totalMembers, averageTeamSize, teamsWithLeaders };
	};

	const filteredTeams = teams.filter(team =>
		team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		team.leader.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		team.leader.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
		team.members.some(member => 
			member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			member.email.toLowerCase().includes(searchTerm.toLowerCase())
		)
	);

	if (isLoading) {
		return (
			<div className="space-y-6">
				{/* Stats Cards Skeleton */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{[...Array(4)].map((_, i) => (
						<Card key={i} className="animate-pulse">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div className="space-y-2">
										<div className="h-4 bg-gray-200 rounded w-20"></div>
										<div className="h-8 bg-gray-200 rounded w-16"></div>
									</div>
									<div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
				
				{/* Main Content Skeleton */}
				<Card className="animate-pulse">
					<CardContent className="p-6">
						<div className="space-y-4">
							<div className="h-4 bg-gray-200 rounded w-1/4"></div>
							<div className="h-10 bg-gray-200 rounded"></div>
							<div className="space-y-3">
								{[...Array(3)].map((_, i) => (
									<div key={i} className="h-20 bg-gray-200 rounded"></div>
								))}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	const stats = getTeamStats();

	return (
		<div className="space-y-8">
			{/* Modern Team Statistics with Glassmorphism */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20">
					<div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 via-white/20 to-slate-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
					<CardContent className="relative p-8">
						<div className="flex items-center justify-between">
							<div className="flex-1 space-y-3">
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
									<p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Total Teams</p>
								</div>
								<p className="text-4xl font-bold text-slate-900 tracking-tight">{stats.totalTeams}</p>
								<p className="text-sm text-slate-500 font-medium">Active teams</p>
							</div>
							<div className="relative">
								<div className="w-16 h-16 bg-gradient-to-br from-slate-500 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
									<Users2 className="w-8 h-8 text-white" />
								</div>
								<div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-slate-400/20 to-slate-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 border-slate-200">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<p className="text-sm font-medium text-slate-700 mb-2">Total Members</p>
								<p className="text-3xl font-bold text-slate-900">{stats.totalMembers}</p>
								<p className="text-xs text-slate-600 mt-1">Across all teams</p>
							</div>
							<div className="w-14 h-14 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
								<Users className="w-7 h-7 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 border-slate-200">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<p className="text-sm font-medium text-slate-700 mb-2">Avg Team Size</p>
								<p className="text-3xl font-bold text-slate-900">{stats.averageTeamSize}</p>
								<p className="text-xs text-slate-600 mt-1">Members per team</p>
							</div>
							<div className="w-14 h-14 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
								<UserCheck className="w-7 h-7 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 border-slate-200">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<p className="text-sm font-medium text-slate-700 mb-2">Team Leaders</p>
								<p className="text-3xl font-bold text-slate-900">{stats.teamsWithLeaders}</p>
								<p className="text-xs text-slate-600 mt-1">Assigned leaders</p>
							</div>
							<div className="w-14 h-14 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
								<Crown className="w-7 h-7 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Team Management Card */}
			<Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 via-white to-slate-50/30 border-slate-100">
				<CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
								<Users2 className="w-5 h-5 text-white" />
							</div>
							<div>
								<CardTitle className="text-slate-900">Team Management</CardTitle>
								<CardDescription className="text-slate-600">Create and manage teams for better collaboration</CardDescription>
							</div>
						</div>
						<div className="flex-shrink-0">
							<Button 
								onClick={() => setIsCreateTeamOpen(true)}
								className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2"
							>
								<Plus className="w-4 h-4 mr-2" />
								Create Team
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					{/* Search Section */}
					<div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50/50 to-white">
						<div className="flex flex-col sm:flex-row gap-4">
							<div className="flex-1 relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
								<Input
									placeholder="Search teams by name, leader, or members..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10 bg-white border-slate-200 focus:border-slate-400"
								/>
							</div>
							
						</div>
					</div>

					{/* Teams List */}
					<div className="overflow-hidden">
						{filteredTeams.length > 0 ? (
							<div className="divide-y divide-slate-200">
								{filteredTeams.map((team, index) => (
									<div key={team.id} className={`p-6 hover:bg-slate-50/50 transition-colors ${
										index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
									}`}>
										<div className="flex items-center justify-between md:flex-row flex-col gap-4 items-start">
											{/* Team Info */}
											<div className="flex items-center gap-4">
												<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
													<Users2 className="w-6 h-6 text-white" />
												</div>
												
												<div className="space-y-1">
													<div className="flex items-center gap-2">
														<h3 className="font-semibold text-slate-900">{team.name}</h3>
														<Badge className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 border-0 shadow-sm">
															{team.members.length + 1} member{team.members.length + 1 !== 1 ? 's' : ''}
														</Badge>
													</div>
													
													<div className="flex items-center gap-4 text-sm text-slate-600">
														<div className="flex items-center gap-1">
															<Crown className="w-3 h-3" />
															<span className="font-medium">Leader:</span>
															<span>{team.leader.full_name || team.leader.email}</span>
														</div>
														<div className="flex items-center gap-1">
															<Calendar className="w-3 h-3" />
															<span>Created {new Date(team.created_at).toLocaleDateString()}</span>
														</div>
													</div>
												</div>
											</div>

											{/* Team Members Preview */}
											<div className="flex items-center gap-2">
												<div className="flex items-center gap-1 md:flex-row">
													{team.members.slice(0, 3).map((member) => (
														<Avatar key={member.id} className="w-8 h-8 border-2 border-white shadow-sm">
															<AvatarImage src={member.profile_photo || ""} />
															<AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 text-xs font-semibold">
																{member.full_name?.charAt(0) || member.email.charAt(0)}
															</AvatarFallback>
														</Avatar>
													))}
													{team.members.length > 3 && (
														<div className="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
															<span className="text-xs font-semibold text-slate-600">+{team.members.length - 3}</span>
														</div>
													)}
												</div>
												
												{/* Edit Button */}
												<Button
													variant="outline"
													size="sm"
													onClick={() => openEditTeam(team)}
													className="h-8 px-3 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800"
												>
													<Edit className="w-4 h-4 mr-1" />
													Edit
												</Button>
												
												{/* Delete Button */}
												<Button
													variant="outline"
													size="sm"
													onClick={() => openDeleteModal(team)}
													className="h-8 px-3 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800"
												>
													<Trash2 className="w-4 h-4 mr-1" />
													Delete
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-12">
								<div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
									<Users2 className="w-8 h-8 text-slate-500" />
								</div>
								<p className="text-slate-600 font-medium">No teams found</p>
								<p className="text-sm text-slate-400 mt-2">
									{searchTerm 
										? "Try adjusting your search criteria." 
										: "Get started by creating your first team."}
								</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Create Team Dialog */}
			<Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
				<DialogContent className='sm:max-w-2xl max-h-[80vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>Create New Team</DialogTitle>
						<DialogDescription>
							Set up a new team with a leader and members
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleCreateTeam} className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='team_name'>Team Name</Label>
							<Input
								id='team_name'
								required
								value={newTeam.name}
								onChange={(e) =>
									setNewTeam({
										...newTeam,
										name: e.target.value,
									})
								}
								placeholder='Enter team name'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='team_leader'>Team Leader</Label>
							<SearchableSelect
								options={employees.map(
									(employee) => ({
										value: employee.id,
										label:
											employee.full_name ||
											employee.email,
										description:
											employee.position ||
											employee.department ||
											undefined,
										profile_photo:
											employee.profile_photo ||
											undefined,
										email: employee.email,
									})
								)}
								value={newTeam.leaderId}
								onValueChange={(value) =>
									setNewTeam({
										...newTeam,
										leaderId: value,
									})
								}
								placeholder='Select team leader'
								searchPlaceholder='Search employees...'
								emptyMessage='No employees found.'
							/>
						</div>

						<div className='space-y-2'>
							<Label>Team Members</Label>
							<div className='max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2'>
								{employees
									.filter(
										(emp) =>
											emp.id !==
											newTeam.leaderId
									)
									.map((employee) => (
										<div
											key={employee.id}
											className='flex items-center space-x-2'>
											<Checkbox
												id={`member-${employee.id}`}
												checked={newTeam.memberIds.includes(
													employee.id
												)}
												onCheckedChange={() =>
													toggleMemberSelection(
														employee.id
													)
												}
											/>
											<Avatar className='w-6 h-6'>
												<AvatarImage
													src={
														employee.profile_photo ||
														""
													}
												/>
												<AvatarFallback className='text-xs'>
													{employee.full_name?.charAt(
														0
													) ||
														employee.email.charAt(
															0
														)}
												</AvatarFallback>
											</Avatar>
											<Label
												htmlFor={`member-${employee.id}`}
												className='text-sm cursor-pointer'>
												{employee.full_name ||
													employee.email}
											</Label>
										</div>
									))}
							</div>
						</div>

						<Button
							type='submit'
							className='w-full'
							disabled={isCreatingTeam}>
							{isCreatingTeam
								? "Creating Team..."
								: "Create Team"}
						</Button>
					</form>
				</DialogContent>
			</Dialog>

			{/* Edit Team Dialog */}
			<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
				<DialogContent className='sm:max-w-2xl max-h-[80vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>Edit Team</DialogTitle>
						<DialogDescription>
							Update team details and members
						</DialogDescription>
					</DialogHeader>
					{editingTeam && (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								void handleSaveEdit();
							}}
							className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='edit_team_name'>
									Team Name
								</Label>
								<Input
									id='edit_team_name'
									value={editingTeam.name}
									onChange={(e) =>
										setEditingTeam({
											...editingTeam,
											name: e.target.value,
										})
									}
								/>
							</div>

							<div className='space-y-2'>
								<Label>Team Leader</Label>
								<div className='flex items-center gap-2 p-2 bg-gray-50 rounded-md'>
									<Avatar className='w-8 h-8'>
										<AvatarImage
											src={
												editingTeam.leader
													.profile_photo || ""
											}
										/>
										<AvatarFallback>
											{editingTeam.leader.full_name?.charAt(
												0
											) ||
												editingTeam.leader.email.charAt(
													0
												)}
										</AvatarFallback>
									</Avatar>
									<span>
										{editingTeam.leader.full_name ||
											editingTeam.leader.email}
									</span>
								</div>
							</div>

							<div className='space-y-2'>
								<Label>Team Members</Label>
								<div className='max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2'>
									{employees
										.filter(
											(emp) =>
												emp.id !== editingTeam.leader.id
										)
										.map((employee) => (
											<div
												key={employee.id}
												className='flex items-center space-x-2'>
												<Checkbox
													id={`edit-member-${employee.id}`}
													checked={editingTeam.members.some(
														(m) =>
															m.id === employee.id
													)}
													onCheckedChange={() =>
														toggleEditMemberSelection(
															employee.id
														)
													}
												/>
												<Avatar className='w-6 h-6'>
													<AvatarImage
														src={
															employee.profile_photo ||
															""
														}
													/>
													<AvatarFallback className='text-xs'>
														{employee.full_name?.charAt(
															0
														) ||
															employee.email.charAt(
																0
															)}
													</AvatarFallback>
												</Avatar>
												<Label
													htmlFor={`edit-member-${employee.id}`}
													className='text-sm cursor-pointer'>
													{employee.full_name ||
														employee.email}
												</Label>
											</div>
										))}
								</div>
							</div>

							<div className='flex gap-2 justify-end'>
								<Button
									type='button'
									variant='outline'
									onClick={() => setIsEditOpen(false)}>
									Cancel
								</Button>
								<Button type='submit' disabled={isSavingEdit}>
									{isSavingEdit
										? "Saving..."
										: "Save Changes"}
								</Button>
							</div>
						</form>
					)}
				</DialogContent>
			</Dialog>

			{/* Floating Action Button for Mobile */}
			<div className="fixed bottom-6 right-6 z-50 sm:hidden">
				<Button 
					onClick={() => setIsCreateTeamOpen(true)}
					size="lg" 
					className="w-14 h-14 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-2xl hover:shadow-3xl transition-all duration-300"
				>
					<Plus className="w-6 h-6" />
				</Button>
			</div>

			{/* Delete Confirmation Modal */}
			<DeleteConfirmationModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setTeamToDelete(null);
				}}
				onConfirm={handleDeleteConfirm}
				item={teamToDelete}
				loading={false}
			/>
		</div>
	);
}
