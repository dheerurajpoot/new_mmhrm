"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SearchableSelectOption {
  value: string
  label: string
  description?: string
  profile_photo?: string
  email?: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No options found.",
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const selectedOption = options.find((option) => option.value === value)

  // Filter options based on search term
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options
    
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [options, searchTerm])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
        setSearchTerm("")
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  const handleSelect = (optionValue: string) => {
    onValueChange?.(optionValue === value ? "" : optionValue)
    setOpen(false)
    setSearchTerm("")
  }

  const handleOpen = () => {
    if (!disabled) {
      setOpen(true)
      setSearchTerm("")
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn("w-full justify-between", className)}
        disabled={disabled}
        onClick={handleOpen}
      >
        {selectedOption ? (
          <div className="flex items-center gap-2">
            {selectedOption.profile_photo && (
              <Avatar className="w-6 h-6">
                <AvatarImage src={selectedOption.profile_photo} />
                <AvatarFallback className="text-xs">
                  {selectedOption.label.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            <span className="truncate">{selectedOption.label}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-8"
                autoFocus
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-6 w-6 p-0"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 transition-colors",
                    value === option.value && "bg-blue-50"
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  <div className="flex items-center justify-center w-4 h-4">
                    {value === option.value && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  
                  {option.profile_photo && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={option.profile_photo} />
                      <AvatarFallback className="text-xs">
                        {option.label.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium text-sm truncate">
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="text-xs text-gray-500 truncate">
                        {option.description}
                      </span>
                    )}
                    {option.email && (
                      <span className="text-xs text-gray-400 truncate">
                        {option.email}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
