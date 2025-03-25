/**
 * Number Formatting Utilities
 * 
 * This module provides utility functions for formatting numbers in various ways:
 * - Suffix-based formatting (k, M)
 * - Comma-separated formatting
 * - Percentage formatting
 * - Decimal place formatting
 */

/**
 * Formats a number with appropriate suffix (k, M) based on magnitude
 * @param num - The number to format
 * @param decimals - Number of decimal places to consider before applying suffix (default: 0)
 * @returns Formatted string with suffix or "-" if input is undefined
 * @example
 * formatNumberWithSuffix(1500) // "1.5k"
 * formatNumberWithSuffix(1500000) // "1.5M"
 * formatNumberWithSuffix(undefined) // "-"
 */
export const formatNumberWithSuffix = (num: number | undefined, decimals: number = 0) => {
  if (!num) return "-";
  const factor = Math.pow(10, decimals)
  const units = num / factor
  if (units >= 1000000) {
    return parseFloat((units / 1000000).toFixed(1)) + "M";
  } else if (units >= 1000) {
    return parseFloat((units / 1000).toFixed(1)) + "k";
  } else {
    return formatDecimals(units, 2)
  }
};

/**
 * Formats a number with comma separators for thousands
 * @param num - The number to format
 * @returns Comma-separated string or "-" if input is undefined
 * @example
 * formatNumberWithCommas(1234567) // "1,234,567"
 * formatNumberWithCommas(undefined) // "-"
 */
export const formatNumberWithCommas = (num: number | undefined) => {
  if (num === undefined) return "-";
  return num.toLocaleString();
};

/**
 * Formats a number as a percentage
 * @param num - The number to format (as decimal)
 * @returns Percentage string with 2 decimal places or "0.00%" if input is undefined
 * @example
 * formatPercent(0.1234) // "12.34%"
 * formatPercent(undefined) // "0.00%"
 */
export const formatPercent = (num: number | undefined) => {
  return `${formatDecimals(num && num * 100, 2)}%`
};

/**
 * Formats a number to a specified number of decimal places
 * @param num - The number to format
 * @param places - Number of decimal places to show (default: 2)
 * @returns Formatted string with specified decimal places or "-" if input is undefined
 * @example
 * formatDecimals(123.4567) // "123.46"
 * formatDecimals(123.4567, 1) // "123.5"
 * formatDecimals(undefined) // "-"
 */
export const formatDecimals = (num: number | undefined, places = 2) => {
  if (!num) return "-";
  const factor = Math.pow(10, places)
  return `${Math.round((num) * factor) / factor}`
};
