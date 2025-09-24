"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SimpleSelectOption {
  value: string
  label: string
}

interface SimpleSelectProps {
  options: SimpleSelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function SimpleSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  disabled = false,
  className,
}: SimpleSelectProps) {
  const [open, setOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const selectedOption = options.find((option) => option.value === value)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
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
  }

  const handleOpen = () => {
    if (!disabled) {
      setOpen(true)
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
          <span className="truncate">{selectedOption.label}</span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
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
                <span className="font-medium text-sm truncate">
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
