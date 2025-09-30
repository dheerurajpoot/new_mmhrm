"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Loader2 } from "lucide-react"
import { useRealtime } from "./realtime-provider"

export function ConnectionStatus() {
  const { isConnected, connectionStatus, lastUpdate } = useRealtime()

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="h-3 w-3" />
      case "connecting":
        return <Loader2 className="h-3 w-3 animate-spin" />
      case "disconnected":
      case "error":
        return <WifiOff className="h-3 w-3" />
      default:
        return <WifiOff className="h-3 w-3" />
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-300/30 backdrop-blur-[5px] text-green-900"
      case "connecting":
        return "bg-yellow-300/30 backdrop-blur-[5px] text-yellow-800"
      case "disconnected":
      case "error":
        return "bg-red-300/30 backdrop-blur-[5px] text-red-800"
      default:
        return "bg-gray-300/30 backdrop-blur-[5px] text-gray-800"
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Live"
      case "connecting":
        return "Connecting"
      case "disconnected":
        return "Offline"
      case "error":
        return "Error"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Badge className={`${getStatusColor()} flex items-center space-x-1`}>
        {getStatusIcon()}
        <span className="text-xs">{getStatusText()}</span>
      </Badge>
      {lastUpdate && (
        <span className="text-xs text-muted-foreground">Last update: {lastUpdate.toLocaleTimeString()}</span>
      )}
    </div>
  )
}
