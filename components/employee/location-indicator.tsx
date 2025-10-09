"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe } from "lucide-react";
import { detectUserLocation } from "@/lib/utils/location";

interface LocationIndicatorProps {
  className?: string;
}

export function LocationIndicator({ className = "" }: LocationIndicatorProps) {
  const [location, setLocation] = useState<{
    countryCode: string;
    countryName: string;
    detected: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const locationData = await detectUserLocation();
        setLocation({
          countryCode: locationData.countryCode,
          countryName: locationData.countryName,
          detected: locationData.detected
        });
      } catch (error) {
        console.error('Error detecting location:', error);
        setLocation({
          countryCode: 'us',
          countryName: 'United States',
          detected: false
        });
      } finally {
        setLoading(false);
      }
    };

    detectLocation();
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-500">Detecting location...</span>
      </div>
    );
  }

  if (!location) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {location.detected ? (
        <>
          <MapPin className="w-3 h-3 text-green-600" />
          <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
            {location.countryName}
          </Badge>
        </>
      ) : (
        <>
          <Globe className="w-3 h-3 text-blue-600" />
          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
            {location.countryName} (Default)
          </Badge>
        </>
      )}
    </div>
  );
}
