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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
	User,
	Mail,
	Phone,
	MapPin,
	Building,
	Calendar,
	Edit,
	AlertTriangle,
	Upload,
	Camera,
} from "lucide-react";
import type { Profile } from "@/lib/types";

export function EmployeeProfile() {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [editForm, setEditForm] = useState({
		full_name: "",
		phone: "",
		address: "",
		birth_date: "",
	});
	const [uploadingPhoto, setUploadingPhoto] = useState(false);

	useEffect(() => {
		fetchProfile();
	}, []);

	const fetchProfile = async () => {
		try {
			const response = await fetch("/api/employee/profile");
			if (!response.ok) {
				throw new Error("Failed to fetch profile");
			}

			const data = await response.json();
			setProfile(data);
			setEditForm({
				full_name: data.full_name || "",
				phone: data.phone || "",
				address: data.address || "",
				birth_date: data.birth_date || "",
			});
		} catch (error) {
			console.error("Error fetching profile:", error);
			setError("Failed to load profile. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!profile) return;

		setIsSaving(true);
		try {
			const response = await fetch("/api/employee/profile", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					full_name: editForm.full_name,
					phone: editForm.phone,
					address: editForm.address,
					birth_date: editForm.birth_date,
				}),
			});

			if (!response.ok) throw new Error("Failed to update profile");

			toast.success("Profile updated successfully!", {
				description: "Your profile information has been saved.",
			});
			setIsEditing(false);
			fetchProfile();
		} catch (error) {
			console.error("Error updating profile:", error);
			toast.error("Failed to update profile", {
				description:
					"There was an error updating your profile. Please try again.",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		setEditForm({
			full_name: profile?.full_name || "",
			phone: profile?.phone || "",
			address: profile?.address || "",
			birth_date: profile?.birth_date || "",
		});
		setIsEditing(false);
	};

	const handlePhotoUpload = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			toast.error("File size too large", {
				description: "Please select a file smaller than 5MB.",
			});
			return;
		}

		if (!file.type.startsWith("image/")) {
			toast.error("Invalid file type", {
				description:
					"Please select a valid image file (JPG, PNG, etc.).",
			});
			return;
		}

		setUploadingPhoto(true);
		try {
			const formData = new FormData();
			formData.append("profile_photo", file);

			const response = await fetch("/api/employee/profile/photo", {
				method: "POST",
				body: formData,
			});

			if (response.ok) {
				toast.success("Profile photo updated!", {
					description:
						"Your profile photo has been updated successfully.",
				});
				fetchProfile();
				// Dispatch event to update sidebar
				window.dispatchEvent(new CustomEvent("profileUpdated"));
			} else {
				toast.error("Failed to upload photo", {
					description:
						"There was an error uploading your profile photo.",
				});
			}
		} catch (error) {
			console.error("Error uploading photo:", error);
			toast.error("Failed to upload photo", {
				description: "There was an error uploading your profile photo.",
			});
		} finally {
			setUploadingPhoto(false);
		}
	};

	if (isLoading) {
		return (
			<Card>
				<CardContent className='p-6'>
					<div className='animate-pulse space-y-4'>
						<div className='h-4 bg-gray-200 rounded w-1/4'></div>
						<div className='h-20 bg-gray-200 rounded'></div>
						<div className='space-y-3'>
							{[...Array(4)].map((_, i) => (
								<div
									key={i}
									className='h-16 bg-gray-200 rounded'></div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardContent className='p-6'>
					<Alert variant='destructive'>
						<AlertTriangle className='h-4 w-4' />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
					<div className='mt-4'>
						<Button onClick={fetchProfile} variant='outline'>
							Try Again
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!profile) {
		return (
			<Card>
				<CardContent className='p-6'>
					<p className='text-gray-500'>Profile not found.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className='space-responsive'>
			<Card>
				<CardHeader>
					<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
						<div>
							<CardTitle>My Profile</CardTitle>
							<CardDescription>
								View and update your personal information
							</CardDescription>
						</div>
						{!isEditing && (
							<Button
								onClick={() => setIsEditing(true)}
								className='bg-gradient-to-r from-red-600 to-blue-600'>
								<Edit className='w-4 h-4 mr-2' />
								Edit Profile
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{isEditing ? (
						<form onSubmit={handleSave} className='space-y-6'>
							<div className='grid-responsive-2 gap-responsive'>
								<div className='space-y-2'>
									<Label htmlFor='full_name'>Full Name</Label>
									<Input
										id='full_name'
										value={editForm.full_name}
										onChange={(e) =>
											setEditForm({
												...editForm,
												full_name: e.target.value,
											})
										}
										required
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='email'>
										Email (Read-only)
									</Label>
									<Input
										id='email'
										value={profile?.email || ""}
										disabled
										className='bg-gray-50'
									/>
								</div>
							</div>

							<div className='grid-responsive-2 gap-responsive'>
								<div className='space-y-2'>
									<Label htmlFor='phone'>Phone Number</Label>
									<Input
										id='phone'
										type='tel'
										value={editForm.phone}
										onChange={(e) =>
											setEditForm({
												...editForm,
												phone: e.target.value,
											})
										}
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='department'>
										Department (Read-only)
									</Label>
									<Input
										id='department'
										value={
											profile?.department ||
											"Not assigned"
										}
										disabled
										className='bg-gray-50'
									/>
								</div>
							</div>

							<div className='grid-responsive-2 gap-responsive'>
								<div className='space-y-2'>
									<Label htmlFor='address'>Address</Label>
									<Input
										id='address'
										value={editForm.address}
										onChange={(e) =>
											setEditForm({
												...editForm,
												address: e.target.value,
											})
										}
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='birth_date'>
										Date of Birth
									</Label>
									<Input
										id='birth_date'
										type='date'
										value={editForm.birth_date}
										onChange={(e) =>
											setEditForm({
												...editForm,
												birth_date: e.target.value,
											})
										}
									/>
								</div>
							</div>

							<div className='flex space-x-3'>
								<Button
									type='submit'
									disabled={isSaving}
									className='bg-gradient-to-r from-red-600 to-blue-600'>
									{isSaving ? "Saving..." : "Save Changes"}
								</Button>
								<Button
									type='button'
									variant='outline'
									onClick={handleCancel}
									disabled={isSaving}>
									Cancel
								</Button>
							</div>
						</form>
					) : (
						<div className='space-y-6'>
							<div className='flex items-center space-x-4 p-4 bg-gradient-to-r from-red-50 to-blue-50 rounded-lg'>
								<div className='relative'>
									{profile?.profile_photo ? (
										<img
											src={profile.profile_photo}
											alt='Profile'
											className='w-16 h-16 rounded-full object-cover border-2 border-white shadow-md'
										/>
									) : (
										<div className='w-16 h-16 bg-gradient-to-r from-red-600 to-blue-600 rounded-full flex items-center justify-center'>
											<User className='w-8 h-8 text-white' />
										</div>
									)}
									<label
										htmlFor='photo-upload'
										className='absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors'
										title='Change photo'>
										<Camera className='w-3 h-3 text-white' />
									</label>
									<input
										id='photo-upload'
										type='file'
										accept='image/*'
										onChange={handlePhotoUpload}
										className='hidden'
										disabled={uploadingPhoto}
									/>
								</div>
								<div>
									<h3 className='text-xl font-semibold text-gray-900'>
										{profile?.full_name ||
											"No name provided"}
									</h3>
									<p className='text-gray-600'>
										{profile?.position ||
											"No position assigned"}
									</p>
									<Badge className='bg-blue-100 text-blue-800 hover:bg-blue-100 mt-1'>
										{profile?.role.charAt(0).toUpperCase() +
											profile?.role.slice(1)}
									</Badge>
								</div>
							</div>

							<div className='grid-responsive-2 gap-responsive'>
								<div className='space-y-4'>
									<div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
										<Mail className='w-5 h-5 text-gray-400' />
										<div>
											<p className='text-sm font-medium text-gray-500'>
												Email
											</p>
											<p className='text-gray-900'>
												{profile?.email}
											</p>
										</div>
									</div>

									<div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
										<Phone className='w-5 h-5 text-gray-400' />
										<div>
											<p className='text-sm font-medium text-gray-500'>
												Phone
											</p>
											<p className='text-gray-900'>
												{profile?.phone ||
													"Not provided"}
											</p>
										</div>
									</div>

									<div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
										<Building className='w-5 h-5 text-gray-400' />
										<div>
											<p className='text-sm font-medium text-gray-500'>
												Department
											</p>
											<p className='text-gray-900'>
												{profile?.department ||
													"Not assigned"}
											</p>
										</div>
									</div>
								</div>

								<div className='space-y-4'>
									<div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
										<MapPin className='w-5 h-5 text-gray-400' />
										<div>
											<p className='text-sm font-medium text-gray-500'>
												Address
											</p>
											<p className='text-gray-900'>
												{profile?.address ||
													"Not provided"}
											</p>
										</div>
									</div>

									<div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
										<Calendar className='w-5 h-5 text-gray-400' />
										<div>
											<p className='text-sm font-medium text-gray-500'>
												Hire Date
											</p>
											<p className='text-gray-900'>
												{profile?.hire_date
													? new Date(
															profile.hire_date
													  ).toLocaleDateString()
													: "Not provided"}
											</p>
										</div>
									</div>

									<div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
										<Calendar className='w-5 h-5 text-gray-400' />
										<div>
											<p className='text-sm font-medium text-gray-500'>
												Date of Birth
											</p>
											<p className='text-gray-900'>
												{profile?.birth_date
													? new Date(
															profile.birth_date
													  ).toLocaleDateString()
													: "Not provided"}
											</p>
										</div>
									</div>

									<div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
										<User className='w-5 h-5 text-gray-400' />
										<div>
											<p className='text-sm font-medium text-gray-500'>
												Position
											</p>
											<p className='text-gray-900'>
												{profile?.position ||
													"Not assigned"}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
