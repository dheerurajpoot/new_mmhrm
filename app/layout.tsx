import type React from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { RealtimeProvider } from "@/components/shared/realtime-provider";
import { UserProvider } from "@/context/user-context";
import { GlobalSettingsProvider } from "@/components/shared/global-settings-provider";
import { SettingsProvider } from "@/context/settings-context";
import { PreloaderProvider } from "@/components/shared/preloader-provider";
import { PostLoginPreloader } from "@/components/shared/post-login-preloader";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { getServerWebsiteSettings } from "@/lib/server-settings";
import { CriticalResourcePreloader } from "@/components/optimization/optimized-dashboard";
import { OptimizationInitializer } from "@/components/optimization/optimization-initializer";
import { NotificationInitializer } from "@/components/shared/notification-initializer";
import { SpeedInsights } from "@vercel/speed-insights/next"

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
				<title>{settings.site_title}</title>
				<meta name="description" content={settings.footer_text || "Comprehensive HR management solution with role-based access, time tracking, leave management, and employee self-service portal."} />
				
				{/* Google Fonts - Poppins */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
				
				{/* Critical CSS inline */}
				<style dangerouslySetInnerHTML={{
					__html: `
						/* Critical CSS for LCP optimization */
						* { box-sizing: border-box; }
						body { 
							margin: 0; 
							font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
							-webkit-font-smoothing: antialiased;
							-moz-osx-font-smoothing: grayscale;
							background-color: #f8fafc;
							font-weight: 400;
						}
						.font-primary { 
							font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
							font-weight: 400;
						}
						* { font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; }
						.min-h-screen { min-height: 100vh; }
						.flex { display: flex; }
						.items-center { align-items: center; }
						.justify-center { justify-content: center; }
						.w-full { width: 100%; }
						.h-full { height: 100%; }
					`
				}} />
			</head>
			<body
				className="font-primary antialiased"
				suppressHydrationWarning>
				<PreloaderProvider>
					<QueryProvider>
						<RealtimeProvider>
							<UserProvider>
								<PostLoginPreloader>
									<SettingsProvider initialSettings={settings}>
										<GlobalSettingsProvider initialSettings={settings}>
											<Suspense fallback={null}>{children}</Suspense>
											<Toaster />
											<CriticalResourcePreloader />
											<OptimizationInitializer />
											<NotificationInitializer />
										</GlobalSettingsProvider>
									</SettingsProvider>
								</PostLoginPreloader>
							</UserProvider>
						</RealtimeProvider>
					</QueryProvider>
				</PreloaderProvider>
				<SpeedInsights/>
			</body>
		</html>
	);
}
