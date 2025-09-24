"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { useWebsiteSettings } from "@/hooks/use-website-settings";

export default function VerifyEmailPage() {
	const { settings } = useWebsiteSettings();
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [userInfo, setUserInfo] = useState<{
		email: string;
		full_name: string;
	} | null>(null);

	useEffect(() => {
		if (!token) {
			setError("Invalid verification link. Please check your email and try again.");
		}
	}, [token]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		if (!token) {
			setError("Invalid verification link.");
			setIsLoading(false);
			return;
		}

		if (!password || password.length < 6) {
			setError("Password must be at least 6 characters long.");
			setIsLoading(false);
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/auth/verify-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token,
					password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || "Verification failed");
				return;
			}

			setSuccess(true);
			// Redirect to login after 3 seconds
			setTimeout(() => {
				router.push("/auth/login?message=Email verified successfully! You can now login with your credentials.");
			}, 3000);
		} catch (error) {
			console.error("Verification error:", error);
			setError("An error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	if (success) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center p-4">
				<div className="w-full max-w-md">
					<Card className="border-0 shadow-xl">
						<CardHeader className="text-center">
							<div className="flex justify-center mb-4">
								<CheckCircle className="w-16 h-16 text-green-600" />
							</div>
							<CardTitle className="text-2xl text-green-600 font-secondary">Email Verified!</CardTitle>
							<CardDescription>
								Your email has been verified and your account is now active.
							</CardDescription>
						</CardHeader>
						<CardContent className="text-center">
							<p className="text-sm text-gray-600 mb-4">
								You will be redirected to the login page in a few seconds...
							</p>
							<Button
								onClick={() => router.push("/auth/login")}
								className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700"
							>
								Go to Login
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="mb-6">
					<Link
						href="/auth/login"
						className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
						<ArrowLeft className="w-4 h-4 mr-1" />
						Back to Login
					</Link>
				</div>

				<Card className="border-0 shadow-xl">
					<CardHeader className="text-center">
						<div className="flex items-center justify-center space-x-2 mb-4">
							{settings?.site_logo ? (
								<img
									src={settings.site_logo}
									alt="Logo"
									className="w-8 h-8 object-contain"
								/>
							) : (
								<div className="w-8 h-8 bg-gradient-to-r from-red-600 to-blue-600 rounded-lg flex items-center justify-center">
									<span className="text-white font-bold text-sm">MM</span>
								</div>
							)}
							<span className="text-xl font-bold text-gray-900">
								{settings?.site_name || "MMHRM"}
							</span>
						</div>
						<CardTitle className="text-2xl font-secondary">Complete Your Registration</CardTitle>
						<CardDescription>
							Set your password to complete your account setup
						</CardDescription>
					</CardHeader>
					<CardContent>
						{error && (
							<div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md mb-4 flex items-center">
								<XCircle className="w-4 h-4 mr-2" />
								{error}
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										placeholder="Minimum 6 characters"
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="h-11 pr-10"
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
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
								<div className="relative">
									<Input
										id="confirmPassword"
										type={showConfirmPassword ? "text" : "password"}
										placeholder="Confirm your password"
										required
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										className="h-11 pr-10"
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									>
										{showConfirmPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</Button>
								</div>
							</div>

							<Button
								type="submit"
								className="w-full h-11 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700"
								disabled={isLoading || !token}
							>
								{isLoading ? "Setting up account..." : "Complete Registration"}
							</Button>
						</form>

						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								Already have an account?{" "}
								<Link
									href="/auth/login"
									className="text-red-600 hover:text-red-700 font-medium"
								>
									Sign in
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}