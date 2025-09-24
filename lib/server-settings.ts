import { getWebsiteSettingsCollection } from "@/lib/mongodb/collections"

export interface WebsiteSettings {
  site_name: string
  site_title: string
  site_logo?: string
  primary_color: string
  secondary_color: string
  theme: "light" | "dark" | "auto"
  footer_text?: string
  contact_email?: string
  contact_phone?: string
}

export async function getServerWebsiteSettings(): Promise<WebsiteSettings> {
  try {
    const settingsCollection = await getWebsiteSettingsCollection()
    const settings = await settingsCollection.findOne({})
    
    if (!settings) {
      // Return default settings if none exist
      return {
        site_name: "MM HRM",
        site_title: "MM HRM - Modern HR Management Platform",
        site_logo: "/placeholder-logo.png",
        primary_color: "#dc2626",
        secondary_color: "#2563eb",
        theme: "light",
        footer_text: "",
        contact_email: "",
        contact_phone: "",
      }
    }

    return {
      site_name: settings.site_name || "MM HRM",
      site_title: settings.site_title || "MM HRM - Modern HR Management Platform",
      site_logo: settings.site_logo || "/placeholder-logo.png",
      primary_color: settings.primary_color || "#dc2626",
      secondary_color: settings.secondary_color || "#2563eb",
      theme: settings.theme || "light",
      footer_text: settings.footer_text || "",
      contact_email: settings.contact_email || "",
      contact_phone: settings.contact_phone || "",
    }
  } catch (error) {
    console.error("Error fetching server website settings:", error)
    // Return default settings on error
    return {
      site_name: "MM HRM",
      site_title: "MM HRM - Modern HR Management Platform",
      site_logo: "/placeholder-logo.png",
      primary_color: "#dc2626",
      secondary_color: "#2563eb",
      theme: "light",
      footer_text: "",
      contact_email: "",
      contact_phone: "",
    }
  }
}
