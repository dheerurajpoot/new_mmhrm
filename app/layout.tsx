import type React from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { RealtimeProvider } from "@/components/shared/realtime-provider";
import { UserProvider } from "@/context/user-context";
import { GlobalSettingsProvider } from "@/components/shared/global-settings-provider";
import { SettingsProvider } from "@/context/settings-context";
import { PreloaderProvider } from "@/components/shared/preloader-provider";
import { Toaster } from "@/components/ui/sonner";
import { getServerWebsiteSettings } from "@/lib/server-settings";

export const metadata: Metadata = {
	title: "MMHRM - Modern HR Management Platform",
	description:
		"Comprehensive HR management solution with role-based access, time tracking, leave management, and employee self-service portal.",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// Fetch settings server-side to prevent flash
	const settings = await getServerWebsiteSettings();
	
	return (
		<html lang='en' suppressHydrationWarning>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link 
					href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap" 
					rel="stylesheet" 
				/>
				<title>{settings.site_title}</title>
				<meta name="description" content={settings.footer_text || "Comprehensive HR management solution with role-based access, time tracking, leave management, and employee self-service portal."} />
			</head>
			<body
				className="font-primary antialiased"
				suppressHydrationWarning>
				<PreloaderProvider>
					<RealtimeProvider>
						<UserProvider>
							<SettingsProvider initialSettings={settings}>
								<GlobalSettingsProvider initialSettings={settings}>
									<Suspense fallback={null}>{children}</Suspense>
									<Toaster />
								</GlobalSettingsProvider>
							</SettingsProvider>
						</UserProvider>
					</RealtimeProvider>
				</PreloaderProvider>
			</body>
		</html>
	);
}
