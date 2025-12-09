/**
 * Fitment badge Tailwind class combinations
 * Use these classes when displaying part compatibility status
 */

export const FITMENT_BADGE_CLASSES = {
  COMPATIBLE: 'bg-gpp-success text-black/80',
  POTENTIAL: 'bg-gpp-warning text-black/80',
  INCOMPATIBLE: 'bg-gpp-error text-gpp-cream',
  UNKNOWN: 'bg-gpp-border text-gpp-text-muted',
} as const;

export type FitmentStatus = keyof typeof FITMENT_BADGE_CLASSES;

/**
 * Get the Tailwind classes for a fitment status
 */
export function getFitmentBadgeClasses(status: FitmentStatus): string {
  return FITMENT_BADGE_CLASSES[status];
}

/**
 * Example usage:
 * 
 * <span className={`px-2 py-1 rounded text-xs font-medium ${getFitmentBadgeClasses('COMPATIBLE')}`}>
 *   Compatible
 * </span>
 */

