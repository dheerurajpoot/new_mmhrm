"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Settings, Palette, Image, Globe, Mail, Phone } from "lucide-react"
import { toast } from "sonner"

interface WebsiteSettings {
  id: string
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

export function AdminSettings() {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [formData, setFormData] = useState({
    site_name: "",
    site_title: "",
    site_logo: "",
    primary_color: "#dc2626",
    secondary_color: "#2563eb",
    theme: "light" as "light" | "dark" | "auto",
    footer_text: "",
    contact_email: "",
    contact_phone: "",
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        const newFormData = {
          site_name: data.site_name || "",
          site_title: data.site_title || "",
          site_logo: data.site_logo && data.site_logo !== "/placeholder-logo.png" ? data.site_logo : "",
          primary_color: data.primary_color || "#dc2626",
          secondary_color: data.secondary_color || "#2563eb",
          theme: data.theme || "light",
          footer_text: data.footer_text || "",
          contact_email: data.contact_email || "",
          contact_phone: data.contact_phone || "",
        }
        setFormData(newFormData)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Website settings updated successfully",
        })
        fetchSettings()
        // Dispatch event to update all components after a short delay
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("settingsUpdated"))
        }, 500)
      } else {
        toast({
          title: "Error",
          description: "Failed to update settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Logo size must be less than 2MB",
        variant: "destructive",
      })
      return
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    setUploadingLogo(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append("logo", file)

      const response = await fetch("/api/admin/settings/logo", {
        method: "POST",
        body: uploadFormData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({ ...formData, site_logo: data.logoUrl })
        
        // Also save the logo URL to the settings
        const updatedFormData = { ...formData, site_logo: data.logoUrl }
        const settingsResponse = await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedFormData),
        })
        
        if (settingsResponse.ok) {
          toast({
            title: "Success",
            description: "Logo uploaded and saved successfully",
          })
          // Refresh settings immediately
          fetchSettings()
          // Dispatch event to update all components after a short delay
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("settingsUpdated"))
          }, 500)
        } else {
          toast({
            title: "Warning",
            description: "Logo uploaded but failed to save settings",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to upload logo",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error uploading logo:", error)
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive",
      })
    } finally {
      setUploadingLogo(false)
    }
  }

  const resetToDefaults = () => {
    setFormData({
      site_name: "MMHRM",
      site_title: "Modern HR Management System",
      site_logo: "/placeholder-logo.png",
      primary_color: "#dc2626",
      secondary_color: "#2563eb",
      theme: "light",
      footer_text: "Made with ❤️ by Chandu © 2025 HRMS. All rights reserved.",
      contact_email: "admin@mmhrm.com",
      contact_phone: "+1 (555) 123-4567",
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Website Settings</h2>
            <p className="text-gray-600">Customize your HR management system</p>
          </div>
          <Badge className="bg-blue-100 text-blue-800">
            <Settings className="w-3 h-3 mr-1" />
            Admin Only
          </Badge>
        </div>


      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Basic Information
            </CardTitle>
            <CardDescription>Configure the basic website information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  value={formData.site_name}
                  onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                  placeholder="Enter site name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site_title">Site Title</Label>
                <Input
                  id="site_title"
                  value={formData.site_title}
                  onChange={(e) => setFormData({ ...formData, site_title: e.target.value })}
                  placeholder="Enter site title"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center space-x-4">
                {formData.site_logo && formData.site_logo !== "/placeholder-logo.png" ? (
                  <img
                    src={formData.site_logo}
                    alt="Current logo"
                    className="w-16 h-16 object-contain border rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 border rounded flex items-center justify-center text-gray-400 text-xs">
                    No Logo
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                    disabled={uploadingLogo}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("logo-upload")?.click()}
                    disabled={uploadingLogo}
                  >
                    <Image className="w-4 h-4 mr-2" />
                    {uploadingLogo ? "Uploading..." : "Upload Logo"}
                  </Button>
                  {formData.site_logo && formData.site_logo !== "/placeholder-logo.png" && (
                    <p className="text-xs text-green-600 mt-1">Current: {formData.site_logo}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme & Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Theme & Colors
            </CardTitle>
            <CardDescription>Customize the visual appearance of your site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={formData.theme}
                  onValueChange={(value: "light" | "dark" | "auto") =>
                    setFormData({ ...formData, theme: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    placeholder="#dc2626"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_color">Secondary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="secondary_color"
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    placeholder="#2563eb"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Contact Information
            </CardTitle>
            <CardDescription>Set up contact details for your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="admin@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="footer_text">Footer Text</Label>
              <Textarea
                id="footer_text"
                value={formData.footer_text}
                onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                placeholder="© 2024 Company Name. All rights reserved."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={resetToDefaults}
                disabled={saving}
              >
                Reset to Defaults
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-red-600 to-blue-600"
              >
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
