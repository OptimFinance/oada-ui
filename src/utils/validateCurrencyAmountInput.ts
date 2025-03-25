/**
 * Currency Amount Input Validation
 * 
 * This module provides utilities for validating currency amount input strings.
 * It ensures that the input follows a valid numeric format with optional decimal places.
 */

/**
 * Validates a string input to ensure it matches a valid currency amount format
 * 
 * The validation allows for:
 * - Optional whole number digits before the decimal point
 * - Optional decimal point
 * - Optional decimal digits after the decimal point
 * 
 * @param input - The string to validate
 * @returns A match array if the input is valid, null otherwise
 * 
 * @example
 * ```typescript
 * // Valid inputs
 * validateInput("123")     // ✓ Valid
 * validateInput("123.45")  // ✓ Valid
 * validateInput(".45")     // ✓ Valid
 * validateInput("0.45")    // ✓ Valid
 * 
 * // Invalid inputs
 * validateInput("abc")     // ✗ Invalid
 * validateInput("12.34.5") // ✗ Invalid
 * validateInput("12.34a")  // ✗ Invalid
 * ```
 */
export const validateInput = (input: string) =>
  input.match(/^([0-9]{1,})?(\.)?([0-9]{1,})?$/);
