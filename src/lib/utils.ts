import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncates a URL to a specified maximum length while preserving the beginning and end.
 * @param url - The URL to truncate
 * @param maxLength - The maximum length of the truncated URL (default: 50)
 * @returns The truncated URL with ellipsis in the middle, or the original URL if it's shorter than maxLength
 */
export function truncateUrl(url: string, maxLength: number = 50): string {
  // If the URL is shorter than or equal to the maximum length, return it unchanged
  if (url.length <= maxLength) {
    return url;
  }

  // Reserve 3 characters for the ellipsis
  const ellipsisLength = 3;

  // Calculate the length of each part (beginning and end)
  const totalLengthForParts = maxLength - ellipsisLength;
  const partLength = Math.floor(totalLengthForParts / 2);

  // Extract the beginning and end parts
  const beginning = url.substring(0, partLength);
  const end = url.substring(url.length - (totalLengthForParts - partLength));

  // Combine with ellipsis in the middle
  return `${beginning}...${end}`;
}
