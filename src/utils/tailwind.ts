/**
 * Tailwind CSS Utility Functions
 * 
 * This module provides utility functions for handling Tailwind CSS class names.
 * It combines clsx for conditional class name composition with tailwind-merge
 * for proper handling of conflicting Tailwind classes.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names and merges Tailwind CSS classes intelligently
 * 
 * This function takes multiple class name arguments (strings, objects, arrays)
 * and merges them while properly handling Tailwind CSS class conflicts.
 * 
 * @param inputs - Array of class names or class name objects to combine
 * @returns Merged class name string with conflicts resolved
 * 
 * @example
 * ```tsx
 * // Basic usage
 * cn("p-4", "bg-blue-500") // "p-4 bg-blue-500"
 * 
 * // With conditional classes
 * cn("p-4", { "bg-blue-500": isActive }) // "p-4 bg-blue-500" if isActive is true
 * 
 * // With conflicting classes
 * cn("p-4", "p-6") // "p-6" (last class wins)
 * 
 * // With arrays and objects
 * cn(["p-4", "m-2"], { "bg-blue-500": true }) // "p-4 m-2 bg-blue-500"
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
