"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Globe,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Star,
  Info,
  Download,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import { getCurrentUser } from "@/lib/auth/client";
import { detectUserLocation, getCurrentMonth, getCurrentYear } from "@/lib/utils/location";

interface Festival {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  isAllDay: boolean;
  month: number | null;
  day: number | null;
}

interface Country {
  code: string;
  name: string;
  calendarId: string;
}

interface FestivalsData {
  festivals: Festival[];
  festivalsByMonth: Record<string, Festival[]>;
  country: string;
  year: number;
  month: number | null;
  totalFestivals: number;
  calendarId: string;
}

interface FestivalsProps {
  sectionData?: any;
}

export function Festivals({ }: FestivalsProps) {
  const [festivalsData, setFestivalsData] = useState<FestivalsData | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('us');
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(getCurrentMonth());
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [locationDetected, setLocationDetected] = useState(false);
  const [detectedCountryName, setDetectedCountryName] = useState('');

  // Detect user location and set default values
  const detectLocation = async () => {
    try {
      console.log('[Festivals] Detecting user location...');
      const locationData = await detectUserLocation();

      if (locationData.detected) {
        console.log('[Festivals] Location detected:', locationData);
        setSelectedCountry(locationData.countryCode);
        setDetectedCountryName(locationData.countryName);
        setLocationDetected(true);
        toast.success(`Location detected: ${locationData.countryName}`);
      } else {
        console.log('[Festivals] Location detection failed, using defaults');
        setLocationDetected(false);
        toast.info('Using default location. You can manually select your country.');
      }
    } catch (error) {
      console.error('[Festivals] Error detecting location:', error);
      setLocationDetected(false);
      toast.info('Location detection failed. You can manually select your country.');
    }
  };

  // Fetch available countries
  const fetchCountries = async () => {
    try {
      setIsLoadingCountries(true);
      console.log('[Festivals] Fetching countries');

      const response = await fetch('/api/festivals?action=countries', {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[Festivals] Countries result:', result);

        if (result.success && result.data) {
          setCountries(result.data);
          console.log('[Festivals] Set countries:', result.data.length);
        }
      } else {
        console.error('[Festivals] Failed to fetch countries:', response.status);
        toast.error('Failed to fetch countries');
      }
    } catch (error) {
      console.error('[Festivals] Error fetching countries:', error);
      toast.error('Failed to fetch countries');
    } finally {
      setIsLoadingCountries(false);
    }
  };

  // Fetch festivals
  const fetchFestivals = async () => {
    try {
      setIsLoading(true);
      console.log('[Festivals] Fetching festivals for:', selectedCountry, selectedYear, selectedMonth);

      const params = new URLSearchParams({
        country: selectedCountry,
        year: selectedYear.toString()
      });

      if (selectedMonth) {
        params.append('month', selectedMonth.toString());
      }

      const response = await fetch(`/api/festivals?${params.toString()}`);
      console.log('[Festivals] Response status:', response.status);
      console.log('[Festivals] Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('[Festivals] Festivals result:', result);

        if (result.success && result.data) {
          setFestivalsData(result.data);
          console.log('[Festivals] Set festivals data:', result.data.totalFestivals, 'festivals');
        } else {
          console.error('[Festivals] API returned success=false or no data:', result);
          toast.error('No festival data available');
        }
      } else {
        console.error('[Festivals] Failed to fetch festivals:', response.status);
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          console.error('[Festivals] Could not parse error response:', e);
          errorData = { error: 'Unknown error occurred' };
        }
        console.log('[Festivals] Error data:', errorData);

        // Show user-friendly error message
        if (response.status === 401) {
          toast.error('Please log in to view festivals');
          // Set empty data to show login prompt
          setFestivalsData(null);
        } else if (response.status === 500) {
          toast.error('Service temporarily unavailable. Please try again later.');
        } else {
          toast.error(errorData.error || 'Failed to fetch festivals');
        }
      }
    } catch (error) {
      console.error('[Festivals] Error fetching festivals:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setIsAuthenticated(!!user);
        if (user) {
          console.log('[Festivals] User authenticated:', user.email);
        } else {
          console.log('[Festivals] User not authenticated');
        }
      } catch (error) {
        console.error('[Festivals] Error checking authentication:', error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated === true) {
      fetchCountries();
      detectLocation(); // Detect user location when authenticated
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated === true && selectedCountry && selectedYear) {
      fetchFestivals();
    }
  }, [isAuthenticated, selectedCountry, selectedYear, selectedMonth]);

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Format time
  const formatTime = (timeString: string | null): string => {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  // Get month name
  const getMonthName = (monthNumber: number): string => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || '';
  };

  // Get festival category based on title/description
  const getFestivalCategory = (festival: Festival): string => {
    const title = festival.title.toLowerCase();
    const description = festival.description.toLowerCase();

    if (title.includes('christmas') || title.includes('easter') || description.includes('christian')) {
      return 'Religious';
    } else if (title.includes('independence') || title.includes('republic') || title.includes('national')) {
      return 'National';
    } else if (title.includes('new year') || title.includes('thanksgiving') || title.includes('labor')) {
      return 'Cultural';
    } else if (title.includes('diwali') || title.includes('holi') || title.includes('dussehra')) {
      return 'Hindu';
    } else if (title.includes('eid') || description.includes('ramadan')) {
      return 'Islamic';
    } else {
      return 'Celebration';
    }
  };

  // Get category color
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Religious': 'from-blue-500 to-blue-600',
      'National': 'from-red-500 to-red-600',
      'Cultural': 'from-green-500 to-green-600',
      'Hindu': 'from-orange-500 to-orange-600',
      'Islamic': 'from-emerald-500 to-emerald-600',
      'Celebration': 'from-purple-500 to-purple-600',
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      'Religious': Star,
      'National': Globe,
      'Cultural': Calendar,
      'Hindu': Star,
      'Islamic': Star,
      'Celebration': Star,
    };
    return icons[category] || Star;
  };

  // Get festival illustration/emoji
  const getFestivalIllustration = (festival: Festival): string => {
    const title = festival.title.toLowerCase();
    const description = festival.description.toLowerCase();

    // Hindu festivals
    if (title.includes('diwali')) return '🪔';
    if (title.includes('holi')) return '🎨';
    if (title.includes('dussehra')) return '⚔️';
    if (title.includes('dussehra')) return '🕉️';
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

  // Get festival background graphics
  const getFestivalBackgroundGraphics = (festival: Festival): JSX.Element => {
    const title = festival.title.toLowerCase();

    // Hindu festivals
    if (title.includes('diwali')) {
      return (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
          <circle cx="50" cy="50" r="8" fill="#fbbf24" />
          <circle cx="150" cy="50" r="8" fill="#f59e0b" />
          <circle cx="100" cy="100" r="12" fill="#f97316" />
          <circle cx="50" cy="150" r="8" fill="#ea580c" />
          <circle cx="150" cy="150" r="8" fill="#dc2626" />
          <path d="M30 100 Q100 50 170 100" stroke="#fbbf24" strokeWidth="2" fill="none" />
          <path d="M30 120 Q100 70 170 120" stroke="#f59e0b" strokeWidth="2" fill="none" />
        </svg>
      );
    }

    if (title.includes('holi')) {
      return (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
          <circle cx="50" cy="50" r="15" fill="#ec4899" />
          <circle cx="150" cy="50" r="15" fill="#8b5cf6" />
          <circle cx="100" cy="100" r="20" fill="#3b82f6" />
          <circle cx="50" cy="150" r="15" fill="#10b981" />
          <circle cx="150" cy="150" r="15" fill="#f59e0b" />
          <path d="M20 100 Q100 20 180 100" stroke="#ec4899" strokeWidth="3" fill="none" />
          <path d="M20 120 Q100 40 180 120" stroke="#8b5cf6" strokeWidth="3" fill="none" />
          <path d="M20 140 Q100 60 180 140" stroke="#3b82f6" strokeWidth="3" fill="none" />
        </svg>
      );
    }

    if (title.includes('dussehra')) {
      return (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
          <rect x="80" y="40" width="40" height="120" fill="#dc2626" />
          <rect x="70" y="50" width="60" height="100" fill="#b91c1c" />
          <circle cx="100" cy="30" r="15" fill="#fbbf24" />
          <path d="M50 100 Q100 60 150 100" stroke="#dc2626" strokeWidth="3" fill="none" />
          <path d="M50 120 Q100 80 150 120" stroke="#b91c1c" strokeWidth="3" fill="none" />
        </svg>
      );
    }

    if (title.includes('rakhi') || title.includes('raksha')) {
      return (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3" />
          <circle cx="100" cy="100" r="20" fill="#f97316" />
          <circle cx="100" cy="100" r="10" fill="#ea580c" />
          <path d="M70 100 Q100 70 130 100" stroke="#fbbf24" strokeWidth="2" fill="none" />
          <path d="M70 120 Q100 90 130 120" stroke="#f59e0b" strokeWidth="2" fill="none" />
        </svg>
      );
    }

    if (title.includes('karva') || title.includes('karwa')) {
      return (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="25" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="100" cy="100" r="15" fill="#f97316" />
          <circle cx="100" cy="100" r="8" fill="#ea580c" />
          <path d="M75 100 Q100 75 125 100" stroke="#fbbf24" strokeWidth="2" fill="none" />
          <path d="M75 120 Q100 95 125 120" stroke="#f59e0b" strokeWidth="2" fill="none" />
        </svg>
      );
    }

    if (title.includes('janmashtami')) {
      return (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="40" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3" />
          <circle cx="100" cy="100" r="25" fill="#f97316" />
          <circle cx="100" cy="100" r="15" fill="#ea580c" />
          <path d="M60 100 Q100 60 140 100" stroke="#fbbf24" strokeWidth="2" fill="none" />
          <path d="M60 120 Q100 80 140 120" stroke="#f59e0b" strokeWidth="2" fill="none" />
        </svg>
      );
    }

    if (title.includes('ganesh') || title.includes('ganpati')) {
      return (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
          <ellipse cx="100" cy="100" rx="40" ry="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="100" cy="80" r="15" fill="#f97316" />
          <path d="M85 100 Q100 85 115 100" stroke="#fbbf24" strokeWidth="2" fill="none" />
          <path d="M85 120 Q100 105 115 120" stroke="#f59e0b" strokeWidth="2" fill="none" />
        </svg>
      );
    }

    if (title.includes('navratri')) {
      return (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
          <circle cx="50" cy="50" r="12" fill="#ec4899" />
          <circle cx="100" cy="50" r="12" fill="#8b5cf6" />
          <circle cx="150" cy="50" r="12" fill="#3b82f6" />
          <circle cx="50" cy="100" r="12" fill="#10b981" />
          <circle cx="100" cy="100" r="15" fill="#f59e0b" />
          <circle cx="150" cy="100" r="12" fill="#ef4444" />
          <circle cx="50" cy="150" r="12" fill="#f97316" />
          <circle cx="100" cy="150" r="12" fill="#84cc16" />
          <circle cx="150" cy="150" r="12" fill="#06b6d4" />
        </svg>
      );
    }

    // Islamic festivals
    if (title.includes('eid') || title.includes('ramadan') || title.includes('muharram')) {
      return (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
          <path d="M100 20 L120 60 L160 60 L130 90 L140 130 L100 110 L60 130 L70 90 L40 60 L80 60 Z" fill="#10b981" />
          <circle cx="100" cy="100" r="30" fill="#059669" stroke="#047857" strokeWidth="2" />
          <path d="M70 100 Q100 70 130 100" stroke="#10b981" strokeWidth="2" fill="none" />
          <path d="M70 120 Q100 90 130 120" stroke="#059669" strokeWidth="2" fill="none" />
        </svg>
      );
    }

    // Christian festivals
    if (title.includes('christmas')) {
      return (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
          <path d="M100 20 L120 60 L160 60 L130 90 L140 130 L100 110 L60 130 L70 90 L40 60 L80 60 Z" fill="#10b981" />
          <circle cx="100" cy="50" r="8" fill="#dc2626" />
          <circle cx="100" cy="80" r="8" fill="#dc2626" />
          <circle cx="100" cy="110" r="8" fill="#dc2626" />
          <path d="M50 100 Q100 50 150 100" stroke="#10b981" strokeWidth="3" fill="none" />
          <path d="M50 120 Q100 70 150 120" stroke="#059669" strokeWidth="3" fill="none" />
        </svg>
      );
    }

    if (title.includes('easter')) {
      return (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
          <ellipse cx="100" cy="100" rx="25" ry="35" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="100" cy="80" r="8" fill="#f97316" />
          <path d="M75 100 Q100 75 125 100" stroke="#fbbf24" strokeWidth="2" fill="none" />
          <path d="M75 120 Q100 95 125 120" stroke="#f59e0b" strokeWidth="2" fill="none" />
        </svg>
      );
    }

    if (title.includes('good friday')) {
      return (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
          <rect x="95" y="40" width="10" height="120" fill="#dc2626" />
          <rect x="90" y="50" width="20" height="100" fill="#b91c1c" />
          <path d="M50 100 Q100 50 150 100" stroke="#dc2626" strokeWidth="3" fill="none" />
          <path d="M50 120 Q100 70 150 120" stroke="#b91c1c" strokeWidth="3" fill="none" />
        </svg>
      );
    }

    // National holidays
    if (title.includes('independence') || title.includes('republic') || title.includes('gandhi')) {
      return (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
          <rect x="50" y="50" width="100" height="60" fill="#f97316" stroke="#ea580c" strokeWidth="2" />
          <rect x="50" y="70" width="100" height="20" fill="#ffffff" />
          <rect x="50" y="90" width="100" height="20" fill="#10b981" />
          <circle cx="100" cy="100" r="8" fill="#3b82f6" />
          <path d="M30 100 Q100 50 170 100" stroke="#f97316" strokeWidth="3" fill="none" />
          <path d="M30 120 Q100 70 170 120" stroke="#ea580c" strokeWidth="3" fill="none" />
        </svg>
      );
    }

    // Cultural festivals
    if (title.includes('new year')) {
      return (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
          <circle cx="50" cy="50" r="8" fill="#ec4899" />
          <circle cx="150" cy="50" r="8" fill="#8b5cf6" />
          <circle cx="100" cy="100" r="12" fill="#f59e0b" />
          <circle cx="50" cy="150" r="8" fill="#10b981" />
          <circle cx="150" cy="150" r="8" fill="#3b82f6" />
          <path d="M30 100 Q100 30 170 100" stroke="#ec4899" strokeWidth="2" fill="none" />
          <path d="M30 120 Q100 50 170 120" stroke="#8b5cf6" strokeWidth="2" fill="none" />
          <path d="M30 140 Q100 70 170 140" stroke="#f59e0b" strokeWidth="2" fill="none" />
        </svg>
      );
    }

    if (title.includes('thanksgiving')) {
      return (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
          <ellipse cx="100" cy="100" rx="30" ry="20" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
          <path d="M70 100 Q100 80 130 100" stroke="#f59e0b" strokeWidth="2" fill="none" />
          <path d="M70 120 Q100 100 130 120" stroke="#d97706" strokeWidth="2" fill="none" />
        </svg>
      );
    }

    if (title.includes('labor') || title.includes('memorial')) {
      return (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
          <rect x="80" y="60" width="40" height="80" fill="#6b7280" stroke="#4b5563" strokeWidth="2" />
          <circle cx="100" cy="40" r="15" fill="#f59e0b" />
          <path d="M50 100 Q100 50 150 100" stroke="#6b7280" strokeWidth="3" fill="none" />
          <path d="M50 120 Q100 70 150 120" stroke="#4b5563" strokeWidth="3" fill="none" />
        </svg>
      );
    }

    // General celebrations
    if (title.includes('birthday')) {
      return (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="100" cy="100" r="20" fill="#f97316" />
          <circle cx="100" cy="100" r="10" fill="#ea580c" />
          <path d="M70 100 Q100 70 130 100" stroke="#fbbf24" strokeWidth="2" fill="none" />
          <path d="M70 120 Q100 90 130 120" stroke="#f59e0b" strokeWidth="2" fill="none" />
        </svg>
      );
    }

    if (title.includes('anniversary')) {
      return (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
          <circle cx="80" cy="100" r="15" fill="#ec4899" stroke="#be185d" strokeWidth="2" />
          <circle cx="120" cy="100" r="15" fill="#ec4899" stroke="#be185d" strokeWidth="2" />
          <path d="M95 100 Q100 95 105 100" stroke="#ec4899" strokeWidth="2" fill="none" />
          <path d="M50 100 Q100 50 150 100" stroke="#ec4899" strokeWidth="2" fill="none" />
          <path d="M50 120 Q100 70 150 120" stroke="#be185d" strokeWidth="2" fill="none" />
        </svg>
      );
    }

    // Default celebration graphics
    return (
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
        <circle cx="50" cy="50" r="10" fill="#3b82f6" />
        <circle cx="150" cy="50" r="10" fill="#8b5cf6" />
        <circle cx="100" cy="100" r="15" fill="#ec4899" />
        <circle cx="50" cy="150" r="10" fill="#10b981" />
        <circle cx="150" cy="150" r="10" fill="#f59e0b" />
        <path d="M30 100 Q100 30 170 100" stroke="#3b82f6" strokeWidth="2" fill="none" />
        <path d="M30 120 Q100 50 170 120" stroke="#8b5cf6" strokeWidth="2" fill="none" />
        <path d="M30 140 Q100 70 170 140" stroke="#ec4899" strokeWidth="2" fill="none" />
      </svg>
    );
  };

  // Filter festivals based on search term
  const getFilteredFestivals = (): Festival[] => {
    if (!festivalsData) return [];

    let festivals = selectedMonth && festivalsData.festivalsByMonth[selectedMonth.toString()]
      ? festivalsData.festivalsByMonth[selectedMonth.toString()]
      : festivalsData.festivals;

    if (searchTerm) {
      festivals = festivals.filter(festival =>
        festival.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        festival.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return festivals.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const filteredFestivals = getFilteredFestivals();

  // Navigation handlers
  const handlePreviousYear = () => {
    setSelectedYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setSelectedYear(prev => prev + 1);
  };

  const handlePreviousMonth = () => {
    if (selectedMonth) {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(prev => prev - 1);
      } else {
        setSelectedMonth(prev => prev! - 1);
      }
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth) {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(prev => prev + 1);
      } else {
        setSelectedMonth(prev => prev! + 1);
      }
    }
  };

  const clearMonthFilter = () => {
    setSelectedMonth(null);
  };

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Festivals & Holidays</h1>
              <p className="text-lg text-white/90">Discover celebrations around the world</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {countries.find(c => c.code === selectedCountry)?.name || 'Global'}
                  </div>
                  <div className="text-sm text-white/80">Country</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {festivalsData?.totalFestivals || 0}
                  </div>
                  <div className="text-sm text-white/80">Festivals</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {selectedMonth ? getMonthName(selectedMonth) : 'All Year'}
                  </div>
                  <div className="text-sm text-white/80">Time Period</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Modern Filters */}
      {isAuthenticated === true && (
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm overflow-hidden relative">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/10 to-orange-400/10 rounded-full blur-xl"></div>

          <CardHeader className="pb-6 relative z-10">
            <CardTitle className="flex items-center gap-4 text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              <div className="p-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl">
                <Filter className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Search & Filter</h2>
                <p className="text-sm text-gray-600 font-normal mt-1">Discover festivals from around the world</p>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-0 pb-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
              {/* Country Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-md">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <Label className="text-base font-bold text-gray-800">Country</Label>
                  {locationDetected && (
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-3 py-1 rounded-full shadow-md">
                      Auto-detected
                    </Badge>
                  )}
                </div>
                <div className="space-y-3">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-700 font-semibold transition-all duration-300 hover:border-gray-300 hover:shadow-xl"
                    disabled={isLoadingCountries}
                  >
                    {isLoadingCountries ? (
                      <option>Loading countries...</option>
                    ) : (
                      countries.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))
                    )}
                  </select>
                  <Button
                    onClick={detectLocation}
                    disabled={isLoadingCountries}
                    className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Detect Location
                  </Button>
                </div>
                {locationDetected && detectedCountryName && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <p className="text-sm text-emerald-700 font-semibold">
                      Detected: {detectedCountryName}
                    </p>
                  </div>
                )}
              </div>

              {/* Year Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <Label className="text-base font-bold text-gray-800">Year</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handlePreviousYear}
                    disabled={isLoading}
                    className="px-4 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div className="flex-1 px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl shadow-lg text-center font-bold text-xl text-gray-800">
                    {selectedYear}
                  </div>
                  <Button
                    onClick={handleNextYear}
                    disabled={isLoading}
                    className="px-4 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Month Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-md">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <Label className="text-base font-bold text-gray-800">Month</Label>
                  {selectedMonth === getCurrentMonth() && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs px-3 py-1 rounded-full shadow-md">
                      Current Month
                    </Badge>
                  )}
                </div>
                <div className="space-y-3">
                  <select
                    value={selectedMonth || ''}
                    onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-700 font-semibold transition-all duration-300 hover:border-gray-300 hover:shadow-xl"
                    disabled={isLoading}
                  >
                    <option value="">All Months</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>
                        {getMonthName(month)}
                      </option>
                    ))}
                  </select>
                  {selectedMonth && (
                    <Button
                      onClick={clearMonthFilter}
                      className="w-full px-4 py-3 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                    >
                      Clear Month Filter
                    </Button>
                  )}
                </div>
              </div>

              {/* Search */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-md">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <Label className="text-base font-bold text-gray-800">Search</Label>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search festivals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-white text-gray-700 font-semibold transition-all duration-300 hover:border-gray-300 hover:shadow-xl"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-semibold">Ready to explore festivals</span>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedMonth(null);
                    setSelectedYear(getCurrentYear());
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                >
                  Reset Filters
                </Button>
                <Button
                  onClick={fetchFestivals}
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                >
                  <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh Festivals
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample Data Notice */}
      {isAuthenticated === true && festivalsData && festivalsData.calendarId && festivalsData.calendarId.includes('sample') && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Info className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium text-amber-800">Sample Data Mode</h4>
                <p className="text-sm text-amber-700">
                  Showing sample festival data. To see real-time data, configure the Google Calendar API key in your environment variables.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Month Navigation */}
      {isAuthenticated === true && selectedMonth && (
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousMonth}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800">
                  {getMonthName(selectedMonth)} {selectedYear}
                </h3>
                <p className="text-sm text-gray-600">
                  {filteredFestivals.length} festivals this month
                </p>
              </div>

              <Button
                variant="outline"
                onClick={handleNextMonth}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Login Prompt */}
      {isAuthenticated === false && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-blue-100 rounded-full mb-6">
                <Calendar className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Login Required
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Please log in to your account to view festivals and holidays from around the world.
              </p>
              <Button
                onClick={() => window.location.href = '/auth/login'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Festivals Grid */}
      {isAuthenticated === true && festivalsData && (
        <div className="space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                {selectedMonth ? `${getMonthName(selectedMonth)} Festivals` : 'All Festivals'}
              </h2>
              <p className="text-gray-600 mt-1">
                {filteredFestivals.length} festivals found in {countries.find(c => c.code === selectedCountry)?.name || selectedCountry}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-4 py-2 text-sm font-semibold">
                {countries.find(c => c.code === selectedCountry)?.name || selectedCountry}
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 px-4 py-2 text-sm font-semibold">
                {selectedYear}
              </Badge>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
                <RefreshCw className="w-8 h-8 animate-spin text-white" />
              </div>
              <div className="text-xl font-semibold text-gray-700 mb-2">Loading Festivals</div>
              <div className="text-gray-500">Fetching data from Google Calendar</div>
            </div>
          ) : filteredFestivals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="p-4 bg-gray-100 rounded-full mb-6">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <div className="text-xl font-semibold text-gray-700 mb-2">No Festivals Found</div>
              <div className="text-gray-500 text-center max-w-md">
                Try adjusting your filters or search term to find festivals
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-start gap-4">
              {filteredFestivals.map((festival) => {
                const category = getFestivalCategory(festival);
                const categoryColor = getCategoryColor(category);
                const CategoryIcon = getCategoryIcon(category);
                const illustration = getFestivalIllustration(festival);
                const backgroundPattern = getFestivalBackground(festival);
                const backgroundGraphics = getFestivalBackgroundGraphics(festival);

                return (
                  <Card
                    key={festival.id}
                    className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden relative w-[100%] lg:w-[30%]"
                  >
                    {/* Festival Background Graphics */}
                    {backgroundGraphics}

                    {/* Festival Illustration Background */}
                    <div className={`absolute inset-0 ${backgroundPattern} opacity-5 group-hover:opacity-8 transition-opacity duration-300`}></div>

                    {/* Decorative Pattern */}
                    <div className="absolute top-0 right-0 w-16 h-16 opacity-8 group-hover:opacity-12 transition-opacity duration-300">
                      <div className="text-4xl transform rotate-12 translate-x-2 -translate-y-2">
                        {illustration}
                      </div>
                    </div>


                    <CardContent className="p-4 relative z-10">
                      <div className="flex items-center gap-4">
                        {/* Left Section - Illustration */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-white/80 to-white/60 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                            <div className="text-3xl">
                              {illustration}
                            </div>
                          </div>
                        </div>

                        {/* Center Section - Main Content */}
                        <div className="flex-1 min-w-0">
                          {/* Category Badge */}
                          <div className="flex items-center gap-3 mb-2">
                            <Badge
                              className={`bg-gradient-to-r ${categoryColor} text-white px-2 py-1 text-xs font-semibold shadow-md`}
                            >
                              <CategoryIcon className="w-3 h-3 mr-1" />
                              {category}
                            </Badge>
                            {festival.isAllDay && (
                              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">
                                All Day
                              </Badge>
                            )}
                          </div>

                          {/* Festival Title */}
                          <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
                            {festival.title}
                          </h3>

                          {/* Description */}
                          {festival.description && festival.description.length > 0 && (
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-2">
                              {festival.description}
                            </p>
                          )}

                          {/* Date and Time Info */}
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-blue-100 rounded-md">
                                <Calendar className="w-3 h-3 text-blue-600" />
                              </div>
                              <span className="font-medium">{formatDate(festival.date)}</span>
                            </div>

                            {festival.startTime && !festival.isAllDay && (
                              <div className="flex items-center gap-2">
                                <div className="p-1 bg-green-100 rounded-md">
                                  <Clock className="w-3 h-3 text-green-600" />
                                </div>
                                <span className="font-medium">
                                  {formatTime(festival.startTime)}
                                  {festival.endTime && ` - ${formatTime(festival.endTime)}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Section - Date Display */}
                        <div className="flex-shrink-0 text-right">
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 min-w-[80px]">
                            <div className="text-xs text-gray-500 font-medium mb-1">
                              {getMonthName(festival.month || 1)}
                            </div>
                            <div className="text-2xl font-bold text-gray-800">
                              {festival.day || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {selectedYear}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}