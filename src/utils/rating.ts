import ratingLevel from '@/configs/rating';

export function getRatingLevel(rating: number) {
  for (let i = ratingLevel.length - 1; i >= 0; --i) {
    const level = ratingLevel[i];
    if (rating >= level.min) {
      return level;
    }
  }
  return null;
}
