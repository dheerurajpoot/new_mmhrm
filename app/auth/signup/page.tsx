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
import { ArrowLeft } from "lucide-react";
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
			});

			if (!result.success) {
				setError(result.error || "Signup failed");
				return;
			}

			console.log("Signup successful, showing success message...");
			// Show success message
			if (result.verificationUrl) {
				// Development mode: show the verification link
				setSuccessMessage(
					`Email service not configured. Please click this link to complete your registration: ${result.verificationUrl}`
				);
			} else {
				// Production mode: email was sent
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
		<div className='min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center p-4'>
			<div className='w-full max-w-md'>
				<div className='mb-6'>
					<Link
						href='/'
						className='inline-flex items-center text-sm text-gray-600 hover:text-gray-900'>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Back to Home
					</Link>
				</div>

				<Card className='border-0 shadow-xl'>
					<CardHeader className='text-center'>
						<div className='flex items-center justify-center space-x-2 mb-4'>
							{settings?.site_logo ? (
								<img
									src={settings.site_logo}
									alt="Logo"
									className='w-8 h-8 object-contain'
								/>
							) : (
								<div className='w-8 h-8 bg-gradient-to-r from-red-600 to-blue-600 rounded-lg flex items-center justify-center'>
									<span className='text-white font-bold text-sm'>MM</span>
								</div>
							)}
							<span className='text-xl font-bold text-gray-900'>
								{settings?.site_name || "MMHRM"}
							</span>
						</div>
						<CardTitle className='text-2xl font-secondary'>
							Create Account
						</CardTitle>
						<CardDescription>
							Join your organization's HR platform
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSignup} className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='fullName'>Full Name</Label>
								<Input
									id='fullName'
									type='text'
									placeholder='John Doe'
									required
									value={fullName}
									onChange={(e) =>
										setFullName(e.target.value)
									}
									className='h-11'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='email'>Email</Label>
								<Input
									id='email'
									type='email'
									placeholder='your.email@company.com'
									required
									value={email}
									onChange={handleEmailChange}
									className={`h-11 ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
								/>
								{emailError && (
									<p className='text-sm text-red-600'>{emailError}</p>
								)}
							</div>
							{successMessage && (
								<div className='p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md'>
									{successMessage.includes('http') ? (
										<div>
											<p className="mb-2">Email service not configured. Please click the link below to complete your registration:</p>
											<a 
												href={successMessage.split(' ').find(word => word.startsWith('http'))} 
												target="_blank" 
												rel="noopener noreferrer"
												className="text-blue-600 hover:text-blue-800 underline break-all"
											>
												{successMessage.split(' ').find(word => word.startsWith('http'))}
											</a>
										</div>
									) : (
										successMessage
									)}
								</div>
							)}
							{error && (
								<div className='p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
									{error}
								</div>
							)}
							<Button
								type='submit'
								className='w-full h-11 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700'
								disabled={isLoading}>
								{isLoading
									? "Creating account..."
									: "Create Account"}
							</Button>
						</form>
						<div className='mt-6 text-center text-sm'>
							<span className='text-gray-600'>
								Already have an account?{" "}
							</span>
							<Link
								href='/auth/login'
								className='text-red-600 hover:text-red-700 font-medium'>
								Sign in
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
