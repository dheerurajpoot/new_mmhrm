"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth/client";
import { useUser } from "@/context/user-context";
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
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useWebsiteSettings } from "@/hooks/use-website-settings";

export default function LoginPage() {
	const { user, loading: userLoading, refresh } = useUser();
	const { settings } = useWebsiteSettings();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [emailError, setEmailError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [hasUserInteracted, setHasUserInteracted] = useState(false);
	const router = useRouter();

	// Check for success message from signup
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const message = urlParams.get('message');
		if (message) {
			setSuccessMessage(message);
			// Clear the URL parameter
			window.history.replaceState({}, document.title, window.location.pathname);
		}
	}, []);

	// Reset form state when component mounts (after logout)
	useEffect(() => {
		if (!user && !userLoading) {
			setEmail("");
			setPassword("");
			setError(null);
			setEmailError(null);
			setHasUserInteracted(false);
		}
	}, [user, userLoading]);

	// Email validation function
	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		return emailRegex.test(email);
	};

	// Handle email change with validation
	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setEmail(value);
		setHasUserInteracted(true);
		
		if (value && !validateEmail(value)) {
			setEmailError("Please enter a valid email address");
		} else {
			setEmailError(null);
		}
	};

	// Handle password change
	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
		setHasUserInteracted(true);
	};

	// Redirect if already authenticated (from cache or API)
	useEffect(() => {
		if (user && !userLoading) {
			// Add a small delay to prevent flash of login form
			const timer = setTimeout(() => {
				router.replace(`/${user.role}`);
			}, 200);
			return () => clearTimeout(timer);
		}
	}, [user, userLoading, router]);

	// Show loading state while checking authentication
	if (userLoading) {
		return null; // No preloader during authentication check
	}

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		
		// Prevent auto-submit if user hasn't interacted with the form
		if (!hasUserInteracted) {
			return;
		}
		
		setIsLoading(true);
		setError(null);
		setEmailError(null);

		// Validate email
		if (!email || !validateEmail(email)) {
			setEmailError("Please enter a valid email address");
			setIsLoading(false);
			return;
		}

		try {
			const result = await signIn(email, password);

			if (!result.success) {
				setError(result.error || "Login failed");
				return;
			}

			if (result.success) {
				toast.success("Login successful!");
				await refresh();
				const role = result.user?.role;
				if (role === "admin" || role === "hr" || role === "employee") {
					router.replace(`/${role}`);
				} else {
					router.replace("/");
				}
			}
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "An error occurred");
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
						<CardTitle className='text-2xl font-secondary'>Welcome Back</CardTitle>
						<CardDescription>
							Sign in to access your HR dashboard
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleLogin} className='space-y-4'>
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
							<div className='space-y-2'>
								<Label htmlFor='password'>Password</Label>
								<Input
									id='password'
									type='password'
									required
									value={password}
									onChange={handlePasswordChange}
									className='h-11'
								/>
							</div>
							{successMessage && (
								<div className='p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md'>
									{successMessage}
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
								disabled={isLoading || userLoading || !!user || (!hasUserInteracted && email && password)}>
								{isLoading
									? "Signing in..."
									: user
									? "Redirecting..."
									: (!hasUserInteracted && email && password)
									? "Click to Sign In"
									: "Sign In"}
							</Button>
						</form>
						<div className='mt-6 text-center text-sm'>
							<span className='text-gray-600'>
								Don't have an account?{" "}
							</span>
							<Link
								href='/auth/signup'
								className='text-red-600 hover:text-red-700 font-medium'>
								Sign up
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
