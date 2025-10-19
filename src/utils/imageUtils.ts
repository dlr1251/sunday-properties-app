// Utility functions for placeholder images
export const getPropertyImage = (width: number = 400, height: number = 300, seed?: number) => {
  const randomSeed = seed || Math.floor(Math.random() * 1000);
  return `https://picsum.photos/${width}/${height}?random=${randomSeed}`;
};

export const getPropertyImages = (count: number = 6, width: number = 800, height: number = 600) => {
  return Array.from({ length: count }, (_, index) => 
    `https://picsum.photos/${width}/${height}?random=${index + 1}`
  );
};

// Alternative: Use Unsplash for more realistic property images
export const getUnsplashPropertyImage = (width: number = 400, height: number = 300, keywords: string[] = ['house', 'apartment', 'real-estate']) => {
  const keyword = keywords[Math.floor(Math.random() * keywords.length)];
  return `https://source.unsplash.com/${width}x${height}/?${keyword}`;
};

// Property-specific image categories
export const PROPERTY_IMAGE_CATEGORIES = {
  apartment: ['apartment', 'modern-apartment', 'luxury-apartment'],
  house: ['house', 'family-house', 'modern-house'],
  penthouse: ['penthouse', 'luxury-penthouse', 'rooftop'],
  office: ['office', 'commercial-space', 'business'],
  commercial: ['commercial', 'retail-space', 'store']
};

export const getPropertyImageByType = (type: string, width: number = 400, height: number = 300) => {
  const categories = PROPERTY_IMAGE_CATEGORIES[type as keyof typeof PROPERTY_IMAGE_CATEGORIES] || ['house'];
  return getUnsplashPropertyImage(width, height, categories);
};
