const STORAGE_KEY = 'gokartpartpicker_current_build_id';

/**
 * Get the current build ID from localStorage
 * @returns The current build ID or null if not set
 */
export function getCurrentBuildId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Set the current build ID in localStorage
 * @param id The build ID to store
 */
export function setCurrentBuildId(id: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(STORAGE_KEY, id);
}

/**
 * Clear the current build ID from localStorage
 */
export function clearCurrentBuildId(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
}

