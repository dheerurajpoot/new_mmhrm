// Location detection and country mapping utilities

export interface LocationData {
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
  city?: string;
  region?: string;
}

export interface CountryMapping {
  [key: string]: string; // country code to festival country code
}

// Mapping from country codes to festival API country codes
const COUNTRY_CODE_MAPPING: CountryMapping = {
  // North America
  'US': 'us',
  'CA': 'canada',
  'MX': 'mexico',
  
  // Europe
  'GB': 'uk',
  'DE': 'germany',
  'FR': 'france',
  'IT': 'italy',
  'ES': 'spain',
  'NL': 'netherlands',
  'SE': 'sweden',
  'NO': 'norway',
  'DK': 'denmark',
  'FI': 'finland',
  'CH': 'switzerland',
  'AT': 'austria',
  'BE': 'belgium',
  'PT': 'portugal',
  'GR': 'greece',
  'PL': 'poland',
  'RU': 'russia',
  
  // Asia
  'IN': 'india',
  'CN': 'china',
  'JP': 'japan',
  'KR': 'south-korea',
  'TH': 'thailand',
  'SG': 'singapore',
  'MY': 'malaysia',
  'ID': 'indonesia',
  'PH': 'philippines',
  'VN': 'vietnam',
  
  // Middle East
  'SA': 'saudi-arabia',
  'AE': 'uae',
  'IL': 'israel',
  'TR': 'turkey',
  
  // Africa
  'ZA': 'south-africa',
  'EG': 'egypt',
  'NG': 'nigeria',
  'KE': 'kenya',
  
  // South America
  'BR': 'brazil',
  'AR': 'argentina',
  'CL': 'chile',
  'CO': 'colombia',
  'PE': 'peru',
  'VE': 'venezuela',
  
  // Oceania
  'AU': 'australia',
  'NZ': 'new-zealand',
};

// Reverse geocoding using a free service
export async function getLocationFromCoordinates(
  latitude: number,
  longitude: number
): Promise<LocationData | null> {
  try {
    // Using a free reverse geocoding service
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    
    const data = await response.json();
    
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      country: data.countryName,
      countryCode: data.countryCode,
      city: data.city,
      region: data.principalSubdivision,
    };
  } catch (error) {
    console.error('Error getting location from coordinates:', error);
    return null;
  }
}

// Get user's current location using browser geolocation API
export async function getCurrentLocation(): Promise<LocationData | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationData = await getLocationFromCoordinates(latitude, longitude);
        resolve(locationData);
      },
      (error) => {
        console.error('Error getting current location:', error);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

// Convert country code to festival API country code
export function getFestivalCountryCode(countryCode: string): string {
  return COUNTRY_CODE_MAPPING[countryCode.toUpperCase()] || 'us';
}

// Get current month (1-12)
export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

// Get current year
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

// Detect user's location and return festival country code
export async function detectUserLocation(): Promise<{
  countryCode: string;
  countryName: string;
  month: number;
  year: number;
  detected: boolean;
}> {
  try {
    const location = await getCurrentLocation();
    
    if (location) {
      const festivalCountryCode = getFestivalCountryCode(location.countryCode);
      return {
        countryCode: festivalCountryCode,
        countryName: location.country,
        month: getCurrentMonth(),
        year: getCurrentYear(),
        detected: true,
      };
    }
  } catch (error) {
    console.error('Error detecting user location:', error);
  }
  
  // Fallback to default values
  return {
    countryCode: 'us',
    countryName: 'United States',
    month: getCurrentMonth(),
    year: getCurrentYear(),
    detected: false,
  };
}
