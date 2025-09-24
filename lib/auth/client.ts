"use client";

import type { AuthUser } from "./auth";

export async function signIn(
	email: string,
	password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
	try {
		const response = await fetch("/api/auth/signin", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
			credentials: "include",
		});

		const data = await response.json();

		if (!response.ok) {
			return { success: false, error: data.error || "Sign in failed" };
		}

		// Store token in localStorage; cookie is set httpOnly by the server
		if (data.token) {
			localStorage.setItem("auth_token", data.token);
		}
		if (data.user) {
			try {
				localStorage.setItem("auth_user", JSON.stringify(data.user));
			} catch {}
		}

		return { success: true, user: data.user };
	} catch (error) {
		console.error("Sign in error:", error);
		return { success: false, error: "Network error occurred" };
	}
}

export async function signUp(userData: {
	email: string;
	full_name: string;
}): Promise<{ success: boolean; user?: AuthUser; error?: string; verificationUrl?: string; message?: string }> {
	try {
		const response = await fetch("/api/auth/signup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(userData),
			credentials: "include",
		});

		const data = await response.json();
		console.log("Signup API response:", data);

		if (!response.ok) {
			return { success: false, error: data.error || "Sign up failed" };
		}

		// Store token in localStorage; cookie is set httpOnly by the server
		if (data.token) {
			localStorage.setItem("auth_token", data.token);
		}
		if (data.user) {
			try {
				localStorage.setItem("auth_user", JSON.stringify(data.user));
			} catch {}
		}

		console.log("Returning signup result:", {
			success: true,
			user: data.user,
			verificationUrl: data.verificationUrl,
			message: data.message
		});

		return { 
			success: true, 
			user: data.user,
			verificationUrl: data.verificationUrl,
			message: data.message
		};
	} catch (error) {
		console.error("Sign up error:", error);
		return { success: false, error: "Network error occurred" };
	}
}

export async function signOut(): Promise<{ success: boolean; error?: string }> {
	try {
		const token = localStorage.getItem("auth_token");
		if (token) {
			await fetch("/api/auth/signout", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				credentials: "include",
			});
		}

		// Always clear local storage regardless of API call success
		localStorage.removeItem("auth_token");
		localStorage.removeItem("auth_user");
		
		return { success: true };
	} catch (error) {
		console.error("Sign out error:", error);
		// Still clear local storage even if API call fails
		localStorage.removeItem("auth_token");
		localStorage.removeItem("auth_user");
		return { success: false, error: "Sign out failed" };
	}
}

export function getAuthToken(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem("auth_token");
}

export async function getCurrentUser(): Promise<AuthUser | null> {
	try {
		const token = getAuthToken();
		if (!token) return null;

		const response = await fetch("/api/auth/me", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			localStorage.removeItem("auth_token");
			return null;
		}

		const data = await response.json();
		return data.user;
	} catch (error) {
		console.error("Get current user error:", error);
		localStorage.removeItem("auth_token");
		return null;
	}
}
