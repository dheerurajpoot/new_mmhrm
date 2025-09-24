"use client"

import { useEffect } from "react"
import { useWebsiteSettings } from "@/hooks/use-website-settings"

interface WebsiteSettings {
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

export function GlobalSettingsProvider({ 
  children, 
  initialSettings 
}: { 
  children: React.ReactNode
  initialSettings?: WebsiteSettings
}) {
  const { settings } = useWebsiteSettings()
  
  // Use initial settings if available, otherwise use hook settings
  const currentSettings = initialSettings || settings

  useEffect(() => {
    if (currentSettings) {
      // Update document title
      document.title = currentSettings.site_title

      // Update CSS custom properties for colors
      const root = document.documentElement
      root.style.setProperty("--primary-color", currentSettings.primary_color)
      root.style.setProperty("--secondary-color", currentSettings.secondary_color)

      // Update favicon if logo is provided
      if (currentSettings.site_logo && currentSettings.site_logo !== "/placeholder-logo.png") {
        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
        if (favicon) {
          favicon.href = currentSettings.site_logo
        } else {
          // Create favicon if it doesn't exist
          const link = document.createElement("link")
          link.rel = "icon"
          link.href = currentSettings.site_logo
          document.head.appendChild(link)
        }
      }

      // Apply theme
      if (currentSettings.theme === "dark") {
        document.documentElement.classList.add("dark")
      } else if (currentSettings.theme === "light") {
        document.documentElement.classList.remove("dark")
      } else {
        // Auto theme - use system preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        if (prefersDark) {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }
      }
    }
  }, [currentSettings])

  // Apply initial settings immediately on mount to prevent flash
  useEffect(() => {
    if (initialSettings) {
      // Update document title
      document.title = initialSettings.site_title

      // Update CSS custom properties for colors
      const root = document.documentElement
      root.style.setProperty("--primary-color", initialSettings.primary_color)
      root.style.setProperty("--secondary-color", initialSettings.secondary_color)

      // Update favicon if logo is provided
      if (initialSettings.site_logo && initialSettings.site_logo !== "/placeholder-logo.png") {
        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
        if (favicon) {
          favicon.href = initialSettings.site_logo
        } else {
          // Create favicon if it doesn't exist
          const link = document.createElement("link")
          link.rel = "icon"
          link.href = initialSettings.site_logo
          document.head.appendChild(link)
        }
      }

      // Apply theme
      if (initialSettings.theme === "dark") {
        document.documentElement.classList.add("dark")
      } else if (initialSettings.theme === "light") {
        document.documentElement.classList.remove("dark")
      } else {
        // Auto theme - use system preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        if (prefersDark) {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }
      }
    }
  }, []) // Run only once on mount

  return <>{children}</>
}
