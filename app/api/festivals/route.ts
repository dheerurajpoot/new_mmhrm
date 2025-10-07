import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserServer } from "@/lib/auth/server";

// Google Calendar API configuration
const GOOGLE_CALENDAR_API_KEY = process.env.GOOGLE_CALENDAR_API_KEY;
const GOOGLE_CALENDAR_ID = "en.usa#holiday@group.v.calendar.google.com"; // Default US holidays

interface FestivalEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    date?: string;
    dateTime?: string;
  };
  end: {
    date?: string;
    dateTime?: string;
  };
}

interface GoogleCalendarResponse {
  items: FestivalEvent[];
}

// Country to Google Calendar ID mapping
// Sample festivals data for when Google Calendar API is not available
function getSampleFestivals(country: string, year: number, month: number | null): FestivalEvent[] {
  const countryFestivals: Record<string, any[]> = {
    us: [
      { summary: "New Year's Day", date: `${year}-01-01`, description: "Celebration of the new year" },
      { summary: "Martin Luther King Jr. Day", date: `${year}-01-15`, description: "Honoring civil rights leader" },
      { summary: "Presidents' Day", date: `${year}-02-19`, description: "Honoring US presidents" },
      { summary: "Memorial Day", date: `${year}-05-27`, description: "Honoring fallen military personnel" },
      { summary: "Independence Day", date: `${year}-07-04`, description: "US Independence Day celebration" },
      { summary: "Labor Day", date: `${year}-09-02`, description: "Celebrating workers' contributions" },
      { summary: "Thanksgiving", date: `${year}-11-28`, description: "Giving thanks and gratitude" },
      { summary: "Christmas Day", date: `${year}-12-25`, description: "Christian celebration of Jesus' birth" }
    ],
    uk: [
      { summary: "New Year's Day", date: `${year}-01-01`, description: "Celebration of the new year" },
      { summary: "Good Friday", date: `${year}-03-29`, description: "Christian observance" },
      { summary: "Easter Monday", date: `${year}-04-01`, description: "Day after Easter Sunday" },
      { summary: "Early May Bank Holiday", date: `${year}-05-06`, description: "Spring bank holiday" },
      { summary: "Spring Bank Holiday", date: `${year}-05-27`, description: "Late spring holiday" },
      { summary: "Summer Bank Holiday", date: `${year}-08-26`, description: "Summer holiday" },
      { summary: "Boxing Day", date: `${year}-12-26`, description: "Day after Christmas" },
      { summary: "Christmas Day", date: `${year}-12-25`, description: "Christian celebration" }
    ],
    india: [
      { summary: "Republic Day", date: `${year}-01-26`, description: "Constitution of India came into effect" },
      { summary: "Holi", date: `${year}-03-25`, description: "Festival of colors" },
      { summary: "Good Friday", date: `${year}-03-29`, description: "Christian observance" },
      { summary: "Eid ul-Fitr", date: `${year}-04-10`, description: "End of Ramadan" },
      { summary: "Independence Day", date: `${year}-08-15`, description: "Independence from British rule" },
      { summary: "Dussehra", date: `${year}-10-12`, description: "Victory of good over evil" },
      { summary: "Diwali", date: `${year}-11-01`, description: "Festival of lights" },
      { summary: "Christmas Day", date: `${year}-12-25`, description: "Christian celebration" }
    ]
  };

  const festivals = countryFestivals[country] || countryFestivals.us;
  
  // Filter by month if specified
  if (month) {
    return festivals.filter(festival => {
      const festivalMonth = parseInt(festival.date.split('-')[1]);
      return festivalMonth === month;
    });
  }
  
  return festivals;
}

const COUNTRY_CALENDAR_IDS: Record<string, string> = {
  "us": "en.usa#holiday@group.v.calendar.google.com",
  "uk": "en.uk#holiday@group.v.calendar.google.com",
  "canada": "en.canadian#holiday@group.v.calendar.google.com",
  "australia": "en.australian#holiday@group.v.calendar.google.com",
  "india": "en.indian#holiday@group.v.calendar.google.com",
  "germany": "en.german#holiday@group.v.calendar.google.com",
  "france": "en.french#holiday@group.v.calendar.google.com",
  "japan": "en.japanese#holiday@group.v.calendar.google.com",
  "china": "en.china#holiday@group.v.calendar.google.com",
  "brazil": "en.brazilian#holiday@group.v.calendar.google.com",
  "mexico": "en.mexican#holiday@group.v.calendar.google.com",
  "italy": "en.italian#holiday@group.v.calendar.google.com",
  "spain": "en.spain#holiday@group.v.calendar.google.com",
  "russia": "en.russian#holiday@group.v.calendar.google.com",
  "south-korea": "en.south_korea#holiday@group.v.calendar.google.com",
  "thailand": "en.thai#holiday@group.v.calendar.google.com",
  "singapore": "en.singapore#holiday@group.v.calendar.google.com",
  "malaysia": "en.malaysia#holiday@group.v.calendar.google.com",
  "indonesia": "en.indonesian#holiday@group.v.calendar.google.com",
  "philippines": "en.philippines#holiday@group.v.calendar.google.com",
  "vietnam": "en.vietnamese#holiday@group.v.calendar.google.com",
  "saudi-arabia": "en.saudi_arabia#holiday@group.v.calendar.google.com",
  "uae": "en.united_arab_emirates#holiday@group.v.calendar.google.com",
  "south-africa": "en.south_africa#holiday@group.v.calendar.google.com",
  "egypt": "en.egyptian#holiday@group.v.calendar.google.com",
  "nigeria": "en.nigeria#holiday@group.v.calendar.google.com",
  "kenya": "en.kenya#holiday@group.v.calendar.google.com",
  "argentina": "en.argentina#holiday@group.v.calendar.google.com",
  "chile": "en.chile#holiday@group.v.calendar.google.com",
  "colombia": "en.colombia#holiday@group.v.calendar.google.com",
  "peru": "en.peru#holiday@group.v.calendar.google.com",
  "venezuela": "en.venezuela#holiday@group.v.calendar.google.com",
  "turkey": "en.turkish#holiday@group.v.calendar.google.com",
  "poland": "en.polish#holiday@group.v.calendar.google.com",
  "netherlands": "en.dutch#holiday@group.v.calendar.google.com",
  "sweden": "en.swedish#holiday@group.v.calendar.google.com",
  "norway": "en.norwegian#holiday@group.v.calendar.google.com",
  "denmark": "en.danish#holiday@group.v.calendar.google.com",
  "finland": "en.finnish#holiday@group.v.calendar.google.com",
  "switzerland": "en.swiss#holiday@group.v.calendar.google.com",
  "austria": "en.austrian#holiday@group.v.calendar.google.com",
  "belgium": "en.belgian#holiday@group.v.calendar.google.com",
  "portugal": "en.portuguese#holiday@group.v.calendar.google.com",
  "greece": "en.greek#holiday@group.v.calendar.google.com",
  "israel": "en.israeli#holiday@group.v.calendar.google.com",
  "new-zealand": "en.new_zealand#holiday@group.v.calendar.google.com",
};

export async function GET(request: NextRequest) {
  try {
    console.log("[Festivals API] GET request received");
    
    // Check authentication
    const user = await getCurrentUserServer();
    if (!user) {
      console.log("[Festivals API] No user - returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } else {
      console.log("[Festivals API] User authenticated:", user.email);
    }

    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || 'us';
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const month = searchParams.get('month'); // Optional month filter

    console.log("[Festivals API] Request parameters:", { country, year, month });
    console.log("[Festivals API] GOOGLE_CALENDAR_API_KEY exists:", !!GOOGLE_CALENDAR_API_KEY);
    console.log("[Festivals API] GOOGLE_CALENDAR_API_KEY length:", GOOGLE_CALENDAR_API_KEY?.length || 0);

    // Check if Google Calendar API key is configured
    if (!GOOGLE_CALENDAR_API_KEY) {
      console.log("[Festivals API] Google Calendar API key not configured, returning sample data");
      // Return sample festivals data when API key is not configured
      return NextResponse.json({
        success: true,
        data: {
          festivals: getSampleFestivals(country, parseInt(year), month ? parseInt(month) : null),
          festivalsByMonth: {},
          country,
          year: parseInt(year),
          month: month ? parseInt(month) : null,
          totalFestivals: 8,
          calendarId: "sample"
        }
      });
    }

    // Get calendar ID for the country
    const calendarId = COUNTRY_CALENDAR_IDS[country] || COUNTRY_CALENDAR_IDS["us"];
    console.log("[Festivals API] Using calendar ID:", calendarId);

    // Build Google Calendar API URL
    let apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
    const params = new URLSearchParams({
      key: GOOGLE_CALENDAR_API_KEY,
      timeMin: `${year}-01-01T00:00:00Z`,
      timeMax: `${year}-12-31T23:59:59Z`,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '250'
    });

    if (month) {
      const monthNum = parseInt(month);
      if (monthNum >= 1 && monthNum <= 12) {
        const startDate = `${year}-${monthNum.toString().padStart(2, '0')}-01T00:00:00Z`;
        const endDate = new Date(parseInt(year), monthNum, 0, 23, 59, 59).toISOString();
        params.set('timeMin', startDate);
        params.set('timeMax', endDate);
      }
    }

    apiUrl += `?${params.toString()}`;
    console.log("[Festivals API] Fetching from Google Calendar API");

    // Fetch data from Google Calendar API
    try {
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        console.error("[Festivals API] Google Calendar API error:", response.status, response.statusText);
        console.log("[Festivals API] Falling back to sample data");
        // Fall back to sample data when Google Calendar API fails
        return NextResponse.json({
          success: true,
          data: {
            festivals: getSampleFestivals(country, parseInt(year), month ? parseInt(month) : null),
            festivalsByMonth: {},
            country,
            year: parseInt(year),
            month: month ? parseInt(month) : null,
            totalFestivals: 8,
            calendarId: "sample_fallback"
          }
        });
      }

      const data: GoogleCalendarResponse = await response.json();
      console.log("[Festivals API] Fetched festivals count:", data.items?.length || 0);

    // Process and format the festivals data
    const festivals = data.items?.map((event) => {
      // Clean description by removing observance text
      let cleanDescription = event.description || '';
      cleanDescription = cleanDescription.replace(/Observance.*?Settings.*?India.*?$/i, '').trim();
      cleanDescription = cleanDescription.replace(/To hide observances.*?$/i, '').trim();
      
      return {
        id: event.id,
        title: event.summary,
        description: cleanDescription,
        date: event.start.date || event.start.dateTime?.split('T')[0] || '',
        startTime: event.start.dateTime || null,
        endTime: event.end.dateTime || null,
        isAllDay: !event.start.dateTime,
        month: event.start.date ? parseInt(event.start.date.split('-')[1]) : 
               (event.start.dateTime ? parseInt(event.start.dateTime.split('-')[1]) : null),
        day: event.start.date ? parseInt(event.start.date.split('-')[2]) : 
             (event.start.dateTime ? parseInt(event.start.dateTime.split('-')[2]) : null),
      };
    }) || [];

    // Group festivals by month if no specific month filter
    const festivalsByMonth: Record<string, any[]> = {};
    
    if (!month) {
      festivals.forEach(festival => {
        if (festival.month) {
          const monthKey = festival.month.toString();
          if (!festivalsByMonth[monthKey]) {
            festivalsByMonth[monthKey] = [];
          }
          festivalsByMonth[monthKey].push(festival);
        }
      });
    }

      console.log("[Festivals API] Returning festivals data");

      return NextResponse.json({
        success: true,
        data: {
          festivals,
          festivalsByMonth,
          country,
          year: parseInt(year),
          month: month ? parseInt(month) : null,
          totalFestivals: festivals.length,
          calendarId
        }
      });

    } catch (googleApiError) {
      console.error("[Festivals API] Google Calendar API error:", googleApiError);
      console.log("[Festivals API] Falling back to sample data due to API error");
      // Fall back to sample data when Google Calendar API throws an error
      return NextResponse.json({
        success: true,
        data: {
          festivals: getSampleFestivals(country, parseInt(year), month ? parseInt(month) : null),
          festivalsByMonth: {},
          country,
          year: parseInt(year),
          month: month ? parseInt(month) : null,
          totalFestivals: 8,
          calendarId: "sample_error_fallback"
        }
      });
    }

  } catch (error) {
    console.error("[Festivals API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET available countries
export async function POST(request: NextRequest) {
  try {
    console.log("[Festivals API] POST request received");
    
    // Check authentication
    const user = await getCurrentUserServer();
    if (!user) {
      console.log("[Festivals API] POST - No user - returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } else {
      console.log("[Festivals API] POST - User authenticated:", user.email);
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'countries') {
      // Return list of available countries
      const countries = Object.keys(COUNTRY_CALENDAR_IDS).map(key => ({
        code: key,
        name: key.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        calendarId: COUNTRY_CALENDAR_IDS[key]
      }));

      return NextResponse.json({
        success: true,
        data: countries
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("[Festivals API] POST Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
