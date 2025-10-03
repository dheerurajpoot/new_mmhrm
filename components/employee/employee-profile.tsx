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
import { Textarea } from "@/components/ui/textarea";
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
	Save,
	X,
	Check,
	Star,
	Award,
	Settings,
	Eye,
	EyeOff,
	Briefcase,
	Shield,
} from "lucide-react";
import type { Profile } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface EmployeeProfileProps {
	sectionData?: any;
}

export function EmployeeProfile({ sectionData }: EmployeeProfileProps) {
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
		password: "",
		confirmPassword: "",
	});
	const [uploadingPhoto, setUploadingPhoto] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

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
				birth_date: data.birth_date ? new Date(data.birth_date).toISOString().split('T')[0] : "",
				password: "",
				confirmPassword: "",
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
		setError(null);

		try {
			// Validate password if provided
			if (editForm.password && editForm.password !== editForm.confirmPassword) {
				setError("Passwords do not match");
				setIsSaving(false);
				return;
			}

			const updateData = {
				full_name: editForm.full_name,
				phone: editForm.phone,
				address: editForm.address,
				birth_date: editForm.birth_date,
				...(editForm.password && { password: editForm.password }),
			};

			const response = await fetch("/api/employee/profile", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updateData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to update profile");
			}

			toast.success("Profile updated successfully!", {
				description: "Your profile information has been saved.",
			});
			setIsEditing(false);
			fetchProfile();
		} catch (error) {
			console.error("Error updating profile:", error);
			setError(error instanceof Error ? error.message : "Failed to update profile");
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
			birth_date: profile?.birth_date ? new Date(profile.birth_date).toISOString().split('T')[0] : "",
			password: "",
			confirmPassword: "",
		});
		setIsEditing(false);
		setError(null);
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
			<div className="space-y-6">
				<Card>
					<CardContent className="p-6">
						<div className="animate-pulse space-y-4">
							<div className="h-8 bg-gray-200 rounded w-1/3"></div>
							<div className="h-4 bg-gray-200 rounded w-2/3"></div>
							<div className="h-32 bg-gray-200 rounded"></div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error && !profile) {
		return (
			<Card>
				<CardContent className="p-6">
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
					<div className="mt-4">
						<Button onClick={fetchProfile} variant="outline">
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
				<CardContent className="p-6">
					<p className="text-gray-500">Profile not found.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Profile Header Card */}
			<Card className="bg-gradient-to-br from-green-50 via-white to-green-50/30 border-green-100">
				<CardHeader>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="relative">
								<Avatar className="h-20 w-20 ring-4 ring-green-100">
									<AvatarImage
										src={profile.profile_photo || ""}
										alt={profile.full_name || "Employee"}
									/>
									<AvatarFallback className="text-2xl bg-gradient-to-r from-green-500 to-green-600 text-white">
										{profile.full_name?.charAt(0) || profile.email?.charAt(0) || "E"}
									</AvatarFallback>
								</Avatar>
								{isEditing && (
									<label className="absolute -bottom-2 -right-2 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors">
										<Camera className="h-4 w-4" />
										<input
											type="file"
											accept="image/*"
											onChange={handlePhotoUpload}
											className="hidden"
											disabled={uploadingPhoto}
										/>
									</label>
								)}
							</div>
							<div>
								<CardTitle className="text-2xl text-gray-900">
									{profile.full_name || "Employee User"}
								</CardTitle>
								<CardDescription className="text-base">
									<div className="flex items-center gap-2 mt-1">
										<Badge className="bg-green-100 text-green-800 border-green-200">
											<User className="h-3 w-3 mr-1" />
											{profile.role?.toUpperCase() || "EMPLOYEE"}
										</Badge>
										{profile.department && (
											<Badge variant="outline" className="text-gray-600">
												<Building className="h-3 w-3 mr-1" />
												{profile.department}
											</Badge>
										)}
									</div>
								</CardDescription>
							</div>
						</div>
						{!isEditing && (
							<Button
								onClick={() => setIsEditing(true)}
								className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg">
								<Edit className="w-4 h-4 mr-2" />
								Edit Profile
							</Button>
						)}
					</div>
				</CardHeader>
			</Card>

			{/* Profile Information Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Profile Information
					</CardTitle>
					<CardDescription>
						{isEditing ? "Update your personal information" : "View your personal information"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{error && (
						<Alert variant="destructive" className="mb-6">
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{isEditing ? (
						<form onSubmit={handleSave} className="space-y-6">
							{/* Basic Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
									<User className="h-4 w-4" />
									Basic Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="full_name">Full Name *</Label>
										<Input
											id="full_name"
											value={editForm.full_name}
											onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
											placeholder="Enter your full name"
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="email">Email Address (Read-only)</Label>
										<Input
											id="email"
											type="email"
											value={profile?.email || ""}
											disabled
											className="bg-gray-50"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="phone">Phone Number</Label>
										<Input
											id="phone"
											value={editForm.phone}
											onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
											placeholder="Enter your phone number"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="department">Department (Read-only)</Label>
										<Input
											id="department"
											value={profile?.department || "Not assigned"}
											disabled
											className="bg-gray-50"
										/>
									</div>
								</div>
							</div>

							<Separator />

							{/* Personal Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
									<Calendar className="h-4 w-4" />
									Personal Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="birth_date">Date of Birth</Label>
										<Input
											id="birth_date"
											type="date"
											value={editForm.birth_date}
											onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value })}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="position">Position (Read-only)</Label>
										<Input
											id="position"
											value={profile?.position || "Not assigned"}
											disabled
											className="bg-gray-50"
										/>
									</div>
								</div>
							</div>

							<Separator />

							{/* Address Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
									<MapPin className="h-4 w-4" />
									Address Information
								</h3>
								<div className="space-y-2">
									<Label htmlFor="address">Address</Label>
									<Textarea
										id="address"
										value={editForm.address}
										onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
										placeholder="Enter your address"
										rows={3}
									/>
								</div>
							</div>

							<Separator />

							{/* Security Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
									<Shield className="h-4 w-4" />
									Security Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="password">New Password</Label>
										<div className="relative">
											<Input
												id="password"
												type={showPassword ? "text" : "password"}
												value={editForm.password}
												onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
												placeholder="Enter new password (optional)"
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() => setShowPassword(!showPassword)}
											>
												{showPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</Button>
										</div>
									</div>
									<div className="space-y-2">
										<Label htmlFor="confirmPassword">Confirm Password</Label>
										<Input
											id="confirmPassword"
											type="password"
											value={editForm.confirmPassword}
											onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
											placeholder="Confirm new password"
										/>
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex flex-col sm:flex-row gap-3 pt-6">
								<Button
									type="submit"
									disabled={isSaving}
									className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg flex-1">
									{isSaving ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
											Saving...
										</>
									) : (
										<>
											<Save className="w-4 h-4 mr-2" />
											Save Changes
										</>
									)}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={handleCancel}
									disabled={isSaving}
									className="flex-1">
									<X className="w-4 h-4 mr-2" />
									Cancel
								</Button>
							</div>
						</form>
					) : (
						<div className="space-y-6">
							{/* Basic Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
									<User className="h-4 w-4" />
									Basic Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-500">Full Name</Label>
										<p className="text-gray-900 font-medium">{profile.full_name || "Not provided"}</p>
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-500">Email Address</Label>
										<div className="flex items-center gap-2">
											<Mail className="h-4 w-4 text-gray-400" />
											<p className="text-gray-900 font-medium">{profile.email || "Not provided"}</p>
										</div>
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-500">Phone Number</Label>
										<div className="flex items-center gap-2">
											<Phone className="h-4 w-4 text-gray-400" />
											<p className="text-gray-900 font-medium">{profile.phone || "Not provided"}</p>
										</div>
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-500">Role</Label>
										<div className="flex items-center gap-2">
											<User className="h-4 w-4 text-gray-400" />
											<Badge className="bg-green-100 text-green-800 border-green-200">
												{profile.role?.toUpperCase() || "EMPLOYEE"}
											</Badge>
										</div>
									</div>
								</div>
							</div>

							<Separator />

							{/* Professional Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
									<Briefcase className="h-4 w-4" />
									Professional Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-500">Department</Label>
										<div className="flex items-center gap-2">
											<Building className="h-4 w-4 text-gray-400" />
											<p className="text-gray-900 font-medium">{profile.department || "Not assigned"}</p>
										</div>
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-500">Position</Label>
										<div className="flex items-center gap-2">
											<Briefcase className="h-4 w-4 text-gray-400" />
											<p className="text-gray-900 font-medium">{profile.position || "Not assigned"}</p>
										</div>
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-500">Hire Date</Label>
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4 text-gray-400" />
											<p className="text-gray-900 font-medium">
												{profile.hire_date ? new Date(profile.hire_date).toLocaleDateString() : "Not provided"}
											</p>
										</div>
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4 text-gray-400" />
											<p className="text-gray-900 font-medium">
												{profile.birth_date ? new Date(profile.birth_date).toLocaleDateString() : "Not provided"}
											</p>
										</div>
									</div>
								</div>
							</div>

							<Separator />

							{/* Address Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
									<MapPin className="h-4 w-4" />
									Address Information
								</h3>
								<div className="space-y-2">
									<Label className="text-sm font-medium text-gray-500">Address</Label>
									<div className="flex items-start gap-2">
										<MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
										<p className="text-gray-900 font-medium">
											{profile.address || "Not provided"}
										</p>
									</div>
								</div>
							</div>

							<Separator />

							{/* Account Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
									<Settings className="h-4 w-4" />
									Account Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-500">Account Created</Label>
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4 text-gray-400" />
											<p className="text-gray-900 font-medium">
												{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "Not available"}
											</p>
										</div>
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-500">Last Updated</Label>
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4 text-gray-400" />
											<p className="text-gray-900 font-medium">
												{profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "Not available"}
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
