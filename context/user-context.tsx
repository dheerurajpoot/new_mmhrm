"use client";

import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { getCurrentUser, signOut as clientSignOut } from "@/lib/auth/client";

type UserRole = "admin" | "hr" | "employee";

export type UserContextValue = {
	user: {
		id: string;
		email: string;
		full_name?: string | null;
		role: UserRole;
	} | null;
	loading: boolean;
	refresh: () => Promise<void>;
	signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<UserContextValue["user"]>(null);
	const [loading, setLoading] = useState<boolean>(true);

	const loadUser = useCallback(async () => {
		setLoading(true);
		try {
			// Prefer cached user to avoid unnecessary API calls
			const cached =
				typeof window !== "undefined"
					? localStorage.getItem("auth_user")
					: null;
			if (cached) {
				try {
					const parsed = JSON.parse(cached);
					setUser(parsed);
					setLoading(false);
					return;
				} catch {}
			}

			const current = await getCurrentUser();
			setUser(current as any);
			if (typeof window !== "undefined") {
				if (current) {
					localStorage.setItem("auth_user", JSON.stringify(current));
				} else {
					localStorage.removeItem("auth_user");
				}
			}
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		// attempt to hydrate user on mount
		void loadUser();
	}, [loadUser]);

	const handleSignOut = useCallback(async () => {
		await clientSignOut();
		setUser(null);
		if (typeof window !== "undefined") {
			localStorage.removeItem("auth_user");
		}
	}, []);

	const value = useMemo<UserContextValue>(
		() => ({ user, loading, refresh: loadUser, signOut: handleSignOut }),
		[user, loading, loadUser, handleSignOut]
	);

	return (
		<UserContext.Provider value={value}>{children}</UserContext.Provider>
	);
}

export function useUser(): UserContextValue {
	const ctx = useContext(UserContext);
	if (!ctx) throw new Error("useUser must be used within a UserProvider");
	return ctx;
}
