"use client"

import { useState, useEffect } from "react"
import { useSettingsContext } from "@/context/settings-context"

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

export function useWebsiteSettings() {
  const { initialSettings } = useSettingsContext()
  const [settings, setSettings] = useState<WebsiteSettings | null>(initialSettings || null)
  const [loading, setLoading] = useState(!initialSettings)

  useEffect(() => {
    fetchSettings()

    // Listen for settings updates
    const handleSettingsUpdate = () => {
      fetchSettings()
    }

    window.addEventListener("settingsUpdated", handleSettingsUpdate)
    return () => window.removeEventListener("settingsUpdated", handleSettingsUpdate)
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/settings?t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Error fetching website settings:", error)
    } finally {
      setLoading(false)
    }
  }

  return { settings, loading, refetch: fetchSettings }
}
