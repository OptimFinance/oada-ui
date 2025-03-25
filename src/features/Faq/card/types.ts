/**
 * FAQ Card Types
 * 
 * Type definitions for the FAQ Card component. These types define the
 * structure and requirements for creating FAQ navigation cards that
 * link to specific sections of the FAQ.
 * 
 * Used in conjunction with the FaqCard component to ensure type safety
 * and provide proper TypeScript support for component properties.
 */

/**
 * FAQ Card Properties Interface
 * 
 * Defines the required and optional properties for an FAQ card.
 * 
 * @property id - Unique identifier for the FAQ section. Used to create the anchor link
 *                target (e.g., #getting-started). Should be URL-safe.
 * 
 * @property image - Path to the SVG icon that represents this FAQ category.
 *                  The SVG will be automatically resized to 100x100 pixels.
 * 
 * @property title - Display text for the card. Should be concise and descriptive
 *                  of the FAQ section it links to.
 * 
 * @property onClick - Optional click handler for custom interactions.
 *                    If provided, will be called in addition to the default
 *                    anchor link navigation.
 */
export interface FaqCardType {
  id: string;
  image: string;
  title: string;
  onClick?: () => void;
}
