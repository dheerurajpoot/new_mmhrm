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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
	Shield,
	Briefcase,
	Save,
	X,
	Check,
	Star,
	Award,
	Settings,
	Eye,
	EyeOff,
} from "lucide-react";
import type { Profile } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export function AdminProfile() {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);

	const [editForm, setEditForm] = useState({
		full_name: "",
		email: "",
		phone: "",
		address: "",
		birth_date: "",
		department: "",
		position: "",
		hire_date: "",
		role: "admin",
		password: "",
		confirmPassword: "",
	});
	const [uploadingPhoto, setUploadingPhoto] = useState(false);

	useEffect(() => {
		fetchProfile();
	}, []);

	const fetchProfile = async () => {
		try {
			const response = await fetch("/api/admin/profile");
			if (!response.ok) {
				throw new Error("Failed to fetch profile");
			}
			const data = await response.json();
			setProfile(data);
			setEditForm({
				full_name: data.full_name || "",
				email: data.email || "",
				phone: data.phone || "",
				address: data.address || "",
				birth_date: data.birth_date ? new Date(data.birth_date).toISOString().split('T')[0] : "",
				department: data.department || "",
				position: data.position || "",
				hire_date: data.hire_date ? new Date(data.hire_date).toISOString().split('T')[0] : "",
				role: data.role || "admin",
				password: "",
				confirmPassword: "",
			});
		} catch (error) {
			console.error("Error fetching profile:", error);
			setError("Failed to load profile");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
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
				email: editForm.email,
				phone: editForm.phone,
				address: editForm.address,
				birth_date: editForm.birth_date || null,
				department: editForm.department,
				position: editForm.position,
				hire_date: editForm.hire_date || null,
				role: editForm.role,
				...(editForm.password && { password: editForm.password }),
			};

			const response = await fetch("/api/admin/profile", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updateData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to update profile");
			}

			toast.success("Profile updated successfully!");
			setIsEditing(false);
			await fetchProfile();
		} catch (error) {
			console.error("Error updating profile:", error);
			setError(error instanceof Error ? error.message : "Failed to update profile");
		} finally {
			setIsSaving(false);
		}
	};

	const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		// Validate file size (5MB max)
		if (file.size > 5 * 1024 * 1024) {
			toast.error("Image size must be less than 5MB");
			return;
		}

		setUploadingPhoto(true);
		try {
			const formData = new FormData();
			formData.append("photo", file);

			const response = await fetch("/api/admin/profile/photo", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Failed to upload photo");
			}

			toast.success("Profile photo updated successfully!");
			await fetchProfile();
		} catch (error) {
			console.error("Error uploading photo:", error);
			toast.error("Failed to upload photo");
		} finally {
			setUploadingPhoto(false);
		}
	};

	const handleCancel = () => {
		setIsEditing(false);
		setError(null);
		if (profile) {
			setEditForm({
				full_name: profile.full_name || "",
				email: profile.email || "",
				phone: profile.phone || "",
				address: profile.address || "",
				birth_date: profile.birth_date ? new Date(profile.birth_date).toISOString().split('T')[0] : "",
				department: profile.department || "",
				position: profile.position || "",
				hire_date: profile.hire_date ? new Date(profile.hire_date).toISOString().split('T')[0] : "",
				role: profile.role || "admin",
				password: "",
				confirmPassword: "",
			});
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
			<Card className="bg-gradient-to-br from-red-50 via-white to-red-50/30 border-red-100">
				<CardHeader>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="relative">
								<Avatar className="h-20 w-20 ring-4 ring-red-100">
									<AvatarImage
										src={profile.profile_photo || ""}
										alt={profile.full_name || "Admin"}
									/>
									<AvatarFallback className="text-2xl bg-gradient-to-r from-red-500 to-red-600 text-white">
										{profile.full_name?.charAt(0) || profile.email?.charAt(0) || "A"}
									</AvatarFallback>
								</Avatar>
								{isEditing && (
									<label className="absolute -bottom-2 -right-2 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700 transition-colors">
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
									{profile.full_name || "Admin User"}
								</CardTitle>
								<CardDescription className="text-base">
									<div className="flex items-center gap-2 mt-1">
										<Badge className="bg-red-100 text-red-800 border-red-200">
											<Shield className="h-3 w-3 mr-1" />
											{profile.role?.toUpperCase() || "ADMIN"}
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
								className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg">
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
										<Label htmlFor="email">Email Address *</Label>
										<Input
											id="email"
											type="email"
											value={editForm.email}
											onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
											placeholder="Enter your email"
											required
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
										<Label htmlFor="role">Role</Label>
										<Select
											value={editForm.role}
											onValueChange={(value) => setEditForm({ ...editForm, role: value })}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select role" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="admin">Admin</SelectItem>
												<SelectItem value="hr">HR</SelectItem>
												<SelectItem value="employee">Employee</SelectItem>
											</SelectContent>
										</Select>
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
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="department">Department</Label>
										<Input
											id="department"
											value={editForm.department}
											onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
											placeholder="Enter your department"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="position">Position</Label>
										<Input
											id="position"
											value={editForm.position}
											onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
											placeholder="Enter your position"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="hire_date">Hire Date</Label>
										<Input
											id="hire_date"
											type="date"
											value={editForm.hire_date}
											onChange={(e) => setEditForm({ ...editForm, hire_date: e.target.value })}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="birth_date">Birth Date</Label>
										<Input
											id="birth_date"
											type="date"
											value={editForm.birth_date}
											onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value })}
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
									className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg flex-1">
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
											<Shield className="h-4 w-4 text-gray-400" />
											<Badge className="bg-red-100 text-red-800 border-red-200">
												{profile.role?.toUpperCase() || "ADMIN"}
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
											<p className="text-gray-900 font-medium">{profile.department || "Not provided"}</p>
										</div>
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium text-gray-500">Position</Label>
										<div className="flex items-center gap-2">
											<Briefcase className="h-4 w-4 text-gray-400" />
											<p className="text-gray-900 font-medium">{profile.position || "Not provided"}</p>
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
										<Label className="text-sm font-medium text-gray-500">Birth Date</Label>
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
