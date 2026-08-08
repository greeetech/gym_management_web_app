import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const APPEARANCE_STORAGE_KEY = 'gm:appearance'
export const NOTIFICATION_PREFS_KEY = 'gm:notification-prefs'
export const UI_PREFS_KEY = 'gm:ui-prefs'
