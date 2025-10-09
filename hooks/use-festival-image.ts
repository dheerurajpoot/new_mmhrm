import { useState, useEffect } from 'react';
import { getFestivalImage } from '@/lib/services/unsplash';

interface UseFestivalImageResult {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  fallbackEmoji: string;
}

// Get festival emoji as fallback
const getFestivalEmoji = (festivalTitle: string): string => {
  const title = festivalTitle.toLowerCase();
  
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

export const useFestivalImage = (festivalTitle: string): UseFestivalImageResult => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fallbackEmoji = getFestivalEmoji(festivalTitle);

  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      if (!festivalTitle) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const url = await getFestivalImage(festivalTitle);
        
        if (isMounted) {
          setImageUrl(url);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch image');
          setIsLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [festivalTitle]);

  return {
    imageUrl,
    isLoading,
    error,
    fallbackEmoji,
  };
};
