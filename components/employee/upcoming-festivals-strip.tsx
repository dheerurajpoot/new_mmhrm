"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, Star } from "lucide-react";
import { useFestivalImage } from "@/hooks/use-festival-image";
import { detectUserLocation } from "@/lib/utils/location";
import { LocationIndicator } from "./location-indicator";
import Image from "next/image";

interface Festival {
  id: string;
  title: string;
  description: string;
  date: string;
  month: number | null;
  day: number | null;
}

interface FestivalsResponse {
  success: boolean;
  data?: {
    festivals: Festival[];
    festivalsByMonth: Record<string, Festival[]>;
  };
}

function formatMonth(monthNumber: number | null): string {
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
  ];
  if (!monthNumber) return "";
  return months[(monthNumber - 1 + 12) % 12] || "";
}

// Get festival illustration/emoji based on title
const getFestivalIllustration = (festival: Festival): string => {
  const title = festival.title.toLowerCase();
  
  // Hindu festivals
  if (title.includes('diwali')) return '🪔';
  if (title.includes('holi')) return '🎨';
  if (title.includes('dussehra')) return '⚔️';
  if (title.includes('rakhi') || title.includes('raksha')) return '🧿';
  if (title.includes('karva') || title.includes('karwa')) return '🪔';
  if (title.includes('janmashtami')) return '🕉️';
  if (title.includes('ganesh') || title.includes('ganpati')) return '🐘';
  if (title.includes('navratri')) return '🕉️';

  // Islamic festivals
  if (title.includes('eid')) return '🌙';
  if (title.includes('ramadan')) return '🌙';
  if (title.includes('muharram')) return '🌙';

  // Christian festivals
  if (title.includes('christmas')) return '🎄';
  if (title.includes('easter')) return '🐰';
  if (title.includes('good friday')) return '✝️';

  // National holidays
  if (title.includes('independence')) return '🇮🇳';
  if (title.includes('republic')) return '🇮🇳';
  if (title.includes('gandhi')) return '🕊️';

  // Cultural festivals
  if (title.includes('new year')) return '🎊';
  if (title.includes('thanksgiving')) return '🦃';
  if (title.includes('labor')) return '👷';
  if (title.includes('memorial')) return '🕊️';

  // General celebrations
  if (title.includes('birthday')) return '🎂';
  if (title.includes('anniversary')) return '💍';

  return '🎉'; // Default celebration emoji
};

// Get festival category and color
const getFestivalCategory = (festival: Festival): { category: string; color: string; icon: any } => {
  const title = festival.title.toLowerCase();
  
  if (title.includes('christmas') || title.includes('easter') || title.includes('good friday')) {
    return { category: 'Religious', color: 'from-blue-500 to-blue-600', icon: Star };
  } else if (title.includes('independence') || title.includes('republic') || title.includes('national')) {
    return { category: 'National', color: 'from-red-500 to-red-600', icon: Star };
  } else if (title.includes('new year') || title.includes('thanksgiving') || title.includes('labor')) {
    return { category: 'Cultural', color: 'from-green-500 to-green-600', icon: Calendar };
  } else if (title.includes('diwali') || title.includes('holi') || title.includes('dussehra')) {
    return { category: 'Hindu', color: 'from-orange-500 to-orange-600', icon: Star };
  } else if (title.includes('eid') || title.includes('ramadan')) {
    return { category: 'Islamic', color: 'from-emerald-500 to-emerald-600', icon: Star };
  } else {
    return { category: 'Celebration', color: 'from-purple-500 to-purple-600', icon: Star };
  }
};

// Get festival background pattern
const getFestivalBackground = (festival: Festival): string => {
  const title = festival.title.toLowerCase();

  if (title.includes('diwali')) return 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500';
  if (title.includes('holi')) return 'bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500';
  if (title.includes('christmas')) return 'bg-gradient-to-br from-green-400 via-red-500 to-green-600';
  if (title.includes('easter')) return 'bg-gradient-to-br from-pink-300 via-yellow-300 to-green-400';
  if (title.includes('independence') || title.includes('republic')) return 'bg-gradient-to-br from-orange-400 via-white to-green-500';
  if (title.includes('eid')) return 'bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600';
  if (title.includes('new year')) return 'bg-gradient-to-br from-purple-400 via-pink-500 to-yellow-400';

  return 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500';
};

// Festival Image Component with loading states and fallbacks
const FestivalImage = ({ festivalTitle, backgroundPattern }: { festivalTitle: string; backgroundPattern: string }) => {
  const { imageUrl, isLoading, error, fallbackEmoji } = useFestivalImage(festivalTitle);

  return (
    <div className={`w-full h-full ${backgroundPattern} rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm group-hover:scale-105 transition-transform duration-200 relative overflow-hidden`}>
      {isLoading ? (
        // Loading skeleton
        <div className="w-full h-full bg-white/20 rounded-xl flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      ) : imageUrl && !error ? (
        // Real image from Unsplash
        <div className="relative w-full h-full">
          <Image
            src={imageUrl}
            alt={`${festivalTitle} celebration`}
            fill
            className="object-cover rounded-xl"
            sizes="(max-width: 768px) 100px, 120px"
            onError={() => {
              // If image fails to load, it will fall back to emoji
              console.warn(`Failed to load image for ${festivalTitle}`);
            }}
          />
          {/* Overlay for better text contrast if needed */}
          <div className="absolute inset-0 bg-black/10 rounded-xl"></div>
        </div>
      ) : (
        // Fallback emoji
        <div className="text-4xl drop-shadow-lg">
          {fallbackEmoji}
        </div>
      )}
    </div>
  );
};

// Helper function to check if a festival is upcoming (from today onwards)
const isUpcomingFestival = (festival: Festival): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  
  const festivalDate = new Date(festival.date);
  festivalDate.setHours(0, 0, 0, 0); // Reset time to start of day
  
  return festivalDate >= today;
};

// Helper function to get current month festivals
const getCurrentMonthFestivals = (festivals: Festival[]): Festival[] => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
  const currentYear = currentDate.getFullYear();
  
  return festivals.filter(festival => {
    const festivalDate = new Date(festival.date);
    return festivalDate.getMonth() + 1 === currentMonth && 
           festivalDate.getFullYear() === currentYear &&
           isUpcomingFestival(festival);
  });
};

export function UpcomingFestivalsStrip({ 
  max, 
  showCurrentMonthOnly = false 
}: { 
  max?: number; 
  showCurrentMonthOnly?: boolean;
}) {
  const [items, setItems] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [userLocation, setUserLocation] = useState<{countryCode: string; countryName: string} | null>(null);
  const containerId = "festivals-strip";

  useEffect(() => {
    const load = async () => {
      try {
        // First, detect user's location
        const locationData = await detectUserLocation();
        setUserLocation({
          countryCode: locationData.countryCode,
          countryName: locationData.countryName
        });

        // Build API URL with location-based parameters
        const params = new URLSearchParams({
          country: locationData.countryCode,
          year: locationData.year.toString()
        });

        if (showCurrentMonthOnly) {
          params.append('month', locationData.month.toString());
        }

        const res = await fetch(`/api/festivals?${params.toString()}`);
        const json: FestivalsResponse = await res.json();
        
        if (json.success && json.data) {
          let filteredFestivals = json.data.festivals
            .filter(isUpcomingFestival) // Only upcoming festivals
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          // If showCurrentMonthOnly is true, filter to current month only
          if (showCurrentMonthOnly) {
            filteredFestivals = getCurrentMonthFestivals(filteredFestivals);
          }
          
          // Apply max limit if specified, otherwise show all upcoming festivals
          if (max && max > 0) {
            filteredFestivals = filteredFestivals.slice(0, max);
          }
          
          setItems(filteredFestivals);
        }
      } catch (error) {
        console.error('Error loading festivals:', error);
        // Fallback: try without location parameters
      try {
        const res = await fetch(`/api/festivals`);
        const json: FestivalsResponse = await res.json();
        if (json.success && json.data) {
            let filteredFestivals = json.data.festivals
              .filter(isUpcomingFestival)
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            if (showCurrentMonthOnly) {
              filteredFestivals = getCurrentMonthFestivals(filteredFestivals);
            }
            
            if (max && max > 0) {
              filteredFestivals = filteredFestivals.slice(0, max);
            }
            
            setItems(filteredFestivals);
          }
        } catch (fallbackError) {
          console.error('Fallback festival loading failed:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [max, showCurrentMonthOnly]);

  if (loading) {
    return (
      <div className="h-40 flex items-center gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="shrink-0 w-64 h-36 rounded-2xl border bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border-blue-200/60 shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-purple-400/5"></div>
            <div className="relative p-4 h-full flex flex-col">
              <div className="skeleton h-8 w-8 rounded-xl mb-3 bg-gradient-to-br from-blue-200 to-purple-200" />
              <div className="skeleton h-4 w-32 mb-2 bg-gray-200" />
              <div className="skeleton h-3 w-24 mb-3 bg-gray-200" />
              <div className="skeleton h-6 w-16 rounded-lg bg-gradient-to-r from-blue-200 to-purple-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = document.getElementById(containerId)!;
    setIsDown(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeft(el.scrollLeft);
    el.classList.add("cursor-grabbing");
  };
  const onMouseLeave = () => {
    setIsDown(false);
    document.getElementById(containerId)?.classList.remove("cursor-grabbing");
  };
  const onMouseUp = () => {
    setIsDown(false);
    document.getElementById(containerId)?.classList.remove("cursor-grabbing");
  };
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDown) return;
    e.preventDefault();
    const el = document.getElementById(containerId)!;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX);
    el.scrollLeft = scrollLeft - walk;
  };
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = document.getElementById(containerId)!;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="space-y-3">
      
      {/* Festival Cards */}
    <div
      id={containerId}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
        className="h-40 overflow-x-auto overflow-y-hidden p-2 flex gap-4 touch-pan-x select-none cursor-grab"
      >
      {items.map((festival) => {
        const illustration = getFestivalIllustration(festival);
        const { category, color, icon: CategoryIcon } = getFestivalCategory(festival);
        const backgroundPattern = getFestivalBackground(festival);

        return (
          <div 
            key={festival.id} 
            className=" lg:w-[400px] w-[330px] group shrink-0 w-64 h-36 rounded-2xl border border-blue-200/60 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative cursor-pointer"
          >
            
            
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-purple-400/5"></div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl"></div>

            <div className="relative h-full flex">
              {/* Left Section - Festival Image (30%) */}
              <div className="w-[30%] h-full flex items-center justify-center p-3">
                <FestivalImage 
                  festivalTitle={festival.title} 
                  backgroundPattern={backgroundPattern} 
                />
              </div>

              {/* Right Section - Festival Information (70%) */}
              <div className="w-[70%] h-full p-4 flex flex-col justify-between">
                {/* Top Section - Category Badge */}
                <div className="flex justify-end">
                  <Badge className={`bg-gradient-to-r ${color} text-white px-2 py-1 text-[10px] font-semibold shadow-md`}>
                    <CategoryIcon className="w-2 h-2 mr-1" />
                    {category}
                  </Badge>
                </div>

                {/* Middle Section - Festival Name and Description */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-tight mb-2">
                    {festival.title}
                  </h3>
                  {festival.description && festival.description.length > 0 && (
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {festival.description}
                    </p>
                  )}
                </div>

                {/* Bottom Section - Date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-blue-100 rounded-md">
                      <Calendar className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">
                      {formatMonth(festival.month)} {festival.day}
                    </span>
                  </div>
                  <Badge className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
                    Upcoming
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        );
      })}
        </div>
    </div>
  );
}

export default UpcomingFestivalsStrip;


