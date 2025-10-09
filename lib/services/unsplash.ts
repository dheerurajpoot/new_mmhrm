// Unsplash API service for fetching festival images
// Free tier allows 50 requests per hour

interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
}

interface UnsplashResponse {
  results: UnsplashImage[];
  total: number;
}

// Cache for storing fetched images
const imageCache = new Map<string, string>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const cacheTimestamps = new Map<string, number>();

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || 'your_unsplash_access_key';
const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';

// Festival-specific search terms for better results
const getFestivalSearchTerms = (festivalTitle: string): string[] => {
  const title = festivalTitle.toLowerCase();
  
  // Hindu festivals
  if (title.includes('diwali')) return ['diwali', 'festival of lights', 'deepavali', 'indian festival'];
  if (title.includes('holi')) return ['holi', 'festival of colors', 'indian holi', 'color festival'];
  if (title.includes('dussehra')) return ['dussehra', 'vijayadashami', 'indian festival', 'ramayana'];
  if (title.includes('rakhi') || title.includes('raksha')) return ['rakhi', 'raksha bandhan', 'sister brother festival'];
  if (title.includes('karva') || title.includes('karwa')) return ['karva chauth', 'indian festival', 'fasting festival'];
  if (title.includes('janmashtami')) return ['janmashtami', 'krishna birthday', 'indian festival'];
  if (title.includes('ganesh') || title.includes('ganpati')) return ['ganesh chaturthi', 'ganpati festival', 'elephant god'];
  if (title.includes('navratri')) return ['navratri', 'nine nights', 'indian festival', 'dance festival'];

  // Islamic festivals
  if (title.includes('eid')) return ['eid', 'eid al-fitr', 'muslim festival', 'ramadan celebration'];
  if (title.includes('ramadan')) return ['ramadan', 'muslim fasting', 'islamic month'];
  if (title.includes('muharram')) return ['muharram', 'islamic new year', 'muslim festival'];

  // Christian festivals
  if (title.includes('christmas')) return ['christmas', 'christmas tree', 'christmas celebration', 'xmas'];
  if (title.includes('easter')) return ['easter', 'easter eggs', 'christian festival', 'resurrection'];
  if (title.includes('good friday')) return ['good friday', 'christian festival', 'crucifixion'];

  // National holidays
  if (title.includes('independence')) return ['independence day', 'national holiday', 'flag celebration'];
  if (title.includes('republic')) return ['republic day', 'national holiday', 'constitution day'];
  if (title.includes('gandhi')) return ['gandhi jayanti', 'mahatma gandhi', 'national holiday'];

  // Cultural festivals
  if (title.includes('new year')) return ['new year', 'new year celebration', 'january 1st'];
  if (title.includes('thanksgiving')) return ['thanksgiving', 'turkey dinner', 'american holiday'];
  if (title.includes('labor')) return ['labor day', 'workers day', 'may day'];
  if (title.includes('memorial')) return ['memorial day', 'remembrance day', 'veterans'];

  // General celebrations
  if (title.includes('birthday')) return ['birthday', 'birthday celebration', 'cake'];
  if (title.includes('anniversary')) return ['anniversary', 'celebration', 'milestone'];

  // Default fallback
  return ['festival', 'celebration', 'holiday'];
};

// Check if cache is still valid
const isCacheValid = (key: string): boolean => {
  const timestamp = cacheTimestamps.get(key);
  if (!timestamp) return false;
  return Date.now() - timestamp < CACHE_DURATION;
};

// Fetch image from Unsplash API
const fetchImageFromUnsplash = async (searchTerm: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `${UNSPLASH_API_URL}?query=${encodeURIComponent(searchTerm)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`,
      {
        headers: {
          'Accept-Version': 'v1',
        },
      }
    );

    if (!response.ok) {
      console.warn(`Unsplash API error: ${response.status}`);
      return null;
    }

    const data: UnsplashResponse = await response.json();
    
    if (data.results && data.results.length > 0) {
      const image = data.results[0];
      return image.urls.small; // Use small size for better performance
    }

    return null;
  } catch (error) {
    console.warn('Error fetching image from Unsplash:', error);
    return null;
  }
};

// Main function to get festival image
export const getFestivalImage = async (festivalTitle: string): Promise<string | null> => {
  const cacheKey = festivalTitle.toLowerCase().trim();
  
  // Check cache first
  if (imageCache.has(cacheKey) && isCacheValid(cacheKey)) {
    return imageCache.get(cacheKey) || null;
  }

  // Get search terms for this festival
  const searchTerms = getFestivalSearchTerms(festivalTitle);
  
  // Try each search term until we find an image
  for (const term of searchTerms) {
    const imageUrl = await fetchImageFromUnsplash(term);
    if (imageUrl) {
      // Cache the result
      imageCache.set(cacheKey, imageUrl);
      cacheTimestamps.set(cacheKey, Date.now());
      return imageUrl;
    }
  }

  return null;
};

// Clear cache (useful for development or manual cache management)
export const clearImageCache = (): void => {
  imageCache.clear();
  cacheTimestamps.clear();
};

// Get cache statistics
export const getCacheStats = () => {
  return {
    size: imageCache.size,
    keys: Array.from(imageCache.keys()),
  };
};
