/**
 * InfoPanel Mock Data
 * 
 * This file provides sample data for the InfoPanel component, making it easy to:
 * - Demonstrate the component in storybooks or documentation
 * - Use as placeholder content during development
 * - Test the component with realistic data
 * - Serve as an example of the expected data structure
 */

/**
 * Sample bond/investment details for the InfoPanel component
 * 
 * This mock object follows the Props interface structure expected by the InfoPanel:
 * - duration: Length of the bond term
 * - cost: Total value or cost of the bond
 * - details: Array of name-value pairs showing bond specifications
 * 
 * The details array demonstrates various common fields for a bond product
 * including amount, interest rate, duration, and other financial parameters.
 */
export const infoPanelMock = {
  duration: '12 months',        // Bond term length
  cost: 'One Million ADA',      // Bond cost/value in ADA cryptocurrency
  details: [
    {
      name: "Amount",           // Principal amount
      value: "10,000",
    },
    {
      name: "Interest rate",    // Annual interest rate
      value: "3.5%",
    },
    {
      name: "Duration",         // Term length
      value: "12 months",
    },
    {
      name: "Min interest buffer", // Minimum interest buffer period
      value: "6 month",
    },
    {
      name: "Interest ADA Value", // Interest amount in ADA
      value: "35,000 ₳",         // Using ADA symbol (₳)
    },
    {
      name: "Prepaid Interest",   // Prepaid interest period
      value: "3 month",
    },
  ]
}