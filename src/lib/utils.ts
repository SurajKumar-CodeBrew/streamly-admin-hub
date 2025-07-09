import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert TMDB image URL to original quality
export function getHighQualityImage(imageUrl: string) {
  if (!imageUrl) return imageUrl;
  
  // Convert TMDB image URLs from low quality to original
  if (imageUrl.includes('image.tmdb.org/t/p/w185/')) {
    return imageUrl.replace('w185', 'original');
  }
  if (imageUrl.includes('image.tmdb.org/t/p/w300/')) {
    return imageUrl.replace('w300', 'original');
  }
  if (imageUrl.includes('image.tmdb.org/t/p/w500/')) {
    return imageUrl.replace('w500', 'original');
  }
  
  return imageUrl;
}
