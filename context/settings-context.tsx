"use client"

import { createContext, useContext, ReactNode } from "react"

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

interface SettingsContextType {
  initialSettings?: WebsiteSettings
}

const SettingsContext = createContext<SettingsContextType>({})

export function SettingsProvider({ 
  children, 
  initialSettings 
}: { 
  children: ReactNode
  initialSettings?: WebsiteSettings
}) {
  return (
    <SettingsContext.Provider value={{ initialSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettingsContext() {
  return useContext(SettingsContext)
}
