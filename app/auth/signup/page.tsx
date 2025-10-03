"use client";

import type React from "react";

import { signUp } from "@/lib/auth/client";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, User, Mail, Sparkles, CheckCircle, Rocket } from "lucide-react";
import { useWebsiteSettings } from "@/hooks/use-website-settings";

export default function SignupPage() {
	const { settings } = useWebsiteSettings();
	const [email, setEmail] = useState("");
	const [fullName, setFullName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [emailError, setEmailError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	// Email validation function
	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		return emailRegex.test(email);
	};

	// Handle email change with validation
	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setEmail(value);
		
		if (value && !validateEmail(value)) {
			setEmailError("Please enter a valid email address");
		} else {
			setEmailError(null);
		}
	};

	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		setEmailError(null);

		// Validate required fields
		if (!fullName || fullName.trim() === "") {
			setError("Please enter your full name");
			setIsLoading(false);
			return;
		}

		if (!email || !validateEmail(email)) {
			setEmailError("Please enter a valid email address");
			setIsLoading(false);
			return;
		}

		try {
			console.log(" Starting signup process...");
			const result = await signUp({
				email,
				full_name: fullName,
			});

			console.log("Signup result:", {
				success: result.success,
				error: result.error,
				verificationUrl: result.verificationUrl,
				message: result.message,
			});

			if (!result.success) {
				setError(result.error || "Signup failed");
				return;
			}

			console.log("Signup successful, showing success message...");
			// Show success message
			if (result.verificationUrl) {
				// Development mode: show the verification link
				console.log("Setting verification URL:", result.verificationUrl);
				setSuccessMessage(result.verificationUrl);
			} else {
				// Production mode: email was sent
				console.log("No verification URL, showing email message");
				setSuccessMessage("Verification email sent! Please check your inbox and click the link to complete your registration.");
			}
			setError(null);
			setEmail("");
			setFullName("");
		} catch (error: unknown) {
			console.error("Signup error:", error);
			setError(
				error instanceof Error ? error.message : "An error occurred"
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden'>
			{/* Background Elements */}
			<div className="absolute inset-0">
				<div className="absolute top-10 left-4 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
				<div className="absolute top-20 right-4 sm:right-10 w-48 sm:w-72 h-48 sm:h-72 bg-gradient-to-r from-pink-400 to-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
				<div className="absolute -bottom-4 left-8 sm:left-20 w-48 sm:w-72 h-48 sm:h-72 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
			</div>

			<div className='relative flex items-center justify-center min-h-screen p-3 sm:p-4'>
				<div className='w-full max-w-sm sm:max-w-md'>
					{/* Back Button */}
					<div className='mb-4 sm:mb-6'>
						<Link
							href='/'
							className='inline-flex items-center text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200'>
							<ArrowLeft className='w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2' />
							Back to Home
						</Link>
					</div>

					{/* Signup Card */}
					<Card className='border-0 shadow-2xl bg-white/70 backdrop-blur-md'>
						<CardHeader className='text-center pb-4 sm:pb-6 px-4 sm:px-6'>
							{/* Logo */}
							<div className='flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4'>
								{settings?.site_logo ? (
									<img
										src={settings.site_logo}
										alt="Logo"
										className='w-8 h-8 sm:w-10 sm:h-10 object-contain'
									/>
								) : (
									<div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg'>
										<span className='text-white font-bold text-sm sm:text-base'>MM</span>
									</div>
								)}
								<div>
									<span className='text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'>
										{settings?.site_name || "MM HRM"}
									</span>
								</div>
							</div>

							{/* Welcome Message */}
							<div className="space-y-1">
								<CardTitle className='text-2xl sm:text-3xl font-bold text-gray-900'>
									Create Account
								</CardTitle>
								<CardDescription className="text-sm sm:text-base text-gray-600">
									Join your organization's HR platform
								</CardDescription>
							</div>
						</CardHeader>

						<CardContent className="px-4 sm:px-6 pb-6">
							<form onSubmit={handleSignup} className='space-y-4 sm:space-y-5'>
								{/* Full Name Field */}
								<div className='space-y-1 sm:space-y-2'>
									<Label htmlFor='fullName' className="text-xs sm:text-sm font-medium text-gray-700">
										Full Name
									</Label>
									<div className="relative">
										<User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
										<Input
											id='fullName'
											type='text'
											placeholder='John Doe'
											required
											value={fullName}
											onChange={(e) => setFullName(e.target.value)}
											className="h-10 sm:h-11 pl-9 sm:pl-10 border-2 border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
										/>
									</div>
								</div>

								{/* Email Field */}
								<div className='space-y-1 sm:space-y-2'>
									<Label htmlFor='email' className="text-xs sm:text-sm font-medium text-gray-700">
										Email Address
									</Label>
									<div className="relative">
										<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
										<Input
											id='email'
											type='email'
											placeholder='your.email@company.com'
											required
											value={email}
											onChange={handleEmailChange}
											className={`h-10 sm:h-11 pl-9 sm:pl-10 border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
												emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 hover:border-gray-300'
											}`}
										/>
									</div>
									{emailError && (
										<p className='text-xs sm:text-sm text-red-600 flex items-center'>
											<span className="w-3 h-3 sm:w-4 sm:h-4 mr-1">⚠</span>
											{emailError}
										</p>
									)}
								</div>

								{/* Success Message */}
								{successMessage && (
									<div className='p-3 sm:p-4 text-xs sm:text-sm bg-green-50 border border-green-200 rounded-lg'>
										{successMessage.includes('http') ? (
											<div>
												<div className="flex items-center mb-2 sm:mb-3">
													<div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
														<span className="text-blue-600 text-xs">ℹ</span>
													</div>
													<p className="text-blue-800 font-medium text-xs sm:text-sm">Email service not configured</p>
												</div>
												<p className="text-blue-700 mb-2 sm:mb-3 text-xs sm:text-sm">Please click the link below to complete your registration:</p>
												<a 
													href={successMessage} 
													target="_blank" 
													rel="noopener noreferrer"
													className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors"
												>
													Complete Registration
												</a>
												<p className="text-xs text-blue-600 mt-2 break-all">
													Or copy this link: {successMessage}
												</p>
											</div>
										) : (
											<div className="text-green-700 flex items-start">
												<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
												{successMessage}
											</div>
										)}
									</div>
								)}

								{/* Error Message */}
								{error && (
									<div className='p-3 sm:p-4 text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-start'>
										<span className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 mt-0.5 flex-shrink-0">⚠</span>
										{error}
									</div>
								)}

								{/* Submit Button */}
								<Button
									type='submit'
									className='w-full h-10 sm:h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]'
									disabled={isLoading}>
									{isLoading ? (
										<div className="flex items-center">
											<div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
											<span className="text-xs sm:text-sm">Creating account...</span>
										</div>
									) : (
										<div className="flex items-center">
											<Rocket className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
											Create Account
										</div>
									)}
								</Button>
							</form>

							{/* Sign In Link */}
							<div className='mt-4 sm:mt-6 text-center'>
								<p className='text-xs sm:text-sm text-gray-600'>
									Already have an account?{" "}
									<Link
										href='/auth/login'
										className='text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200'>
										Sign in here
									</Link>
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
