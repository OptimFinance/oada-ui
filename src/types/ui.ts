/**
 * UI Type Definitions
 * 
 * This module defines TypeScript types for UI components and user interface elements.
 * It includes types for:
 * - Navigation components (breadcrumbs, tabs)
 * - Card components and their data structures
 * - Wallet information display
 * - Alert and notification systems
 * - Error handling utilities
 */

import {ReactNode} from "react"

/**
 * UI Types Namespace
 * Contains all UI-related type definitions
 */
export declare namespace UITypes {
  /**
   * Represents a single breadcrumb in navigation
   * Used for hierarchical navigation display
   */
  interface Breadcrumb {
    path: string      // URL path segment
    crumbName: string // Display name for the breadcrumb
  }

  /**
   * Card Component Types
   * Defines the structure and appearance of card components
   */
  namespace Card {
    /**
     * Available icon types for card headers
     */
    type IconType = 'cardano' | 'diamond' | 'sphere'

    /**
     * Represents a single detail item in a card
     * Used for displaying key-value pairs with optional styling
     */
    interface Detail {
      name: string      // Label for the detail
      value: string     // Value to display
      isGreen?: boolean // Optional green color styling
      isRed?: boolean   // Optional red color styling
      tooltip?: string  // Optional tooltip text
      copyId?: boolean  // Whether the value can be copied
    }

    /**
     * Common header structure for cards
     * Defines the layout of card headers with left and right sections
     */
    type CommonHeader = {
      left: {
        name: ReactNode,  // Left section label
        value: ReactNode, // Left section value
      },
      right: {
        name: ReactNode,  // Right section label
        value: ReactNode, // Right section value
      }
      iconType?: IconType // Optional icon type for the header
    }

    /**
     * Complete card data structure
     * Contains all information needed to render a card component
     */
    interface CardData {
      details: Detail[]           // List of detail items
      header: CommonHeader       // Card header information
      lineColor?: "violet"       // Optional border color
      isUniqueButtons?: boolean  // Whether to use unique button styling
      danger?: boolean          // Whether to apply danger styling
    }
  }

  /**
   * Wallet Display Types
   * Defines structures for displaying wallet information
   */
  namespace Wallets {
    /**
     * UTxO reference for wallet display
     */
    interface Utxo {
      id: string,  // Transaction ID
      ix: number   // Output index
    }

    /**
     * Basic wallet information for display
     */
    interface Wallet {
      provider: string,  // Wallet provider name
      address: string,   // Wallet address
      utxos: Utxo[]     // List of UTxOs
    }
  }

  /**
   * Tab component type
   * Defines the structure of navigation tabs
   */
  export interface TabType {
    title: string;           // Tab display title
    link?: string;          // Optional navigation link
    content?: JSX.Element;  // Optional tab content
    onClick?: () => void;   // Optional click handler
  }

  /**
   * Alert/Notification type
   * Defines the structure of system alerts and notifications
   */
  export interface AlertType {
    id?: string           // Unique alert identifier
    type?: 'success' | 'error' | 'warning'  // Alert type
    message: string       // Alert message
    txHash?: string      // Optional transaction hash
    link?: string        // Optional related link
  }
}

/**
 * Mapping of verified token names
 * Used for token name validation and display
 */
export type VerifiedNameMap = {
  [tokenName: string]: { [poolSize: string]: VerifiedName }
}

/**
 * Verified token name structure
 * Contains token name and optimization options
 */
export type VerifiedName = {
  name: string,  // Token name
  opts: number,  // Optimization options
}

/**
 * Server error codes
 * Defines possible server-related error types
 */
export type ServerErrorCode =
  | 'ServerFetchError'           // Network fetch error
  | 'ServerResponseBodyError'    // Response body parsing error
  | 'ServerResponseError'        // General response error
  | 'ServerJsonParsingError'     // JSON parsing error
  | 'ServerJsonTypingError'      // JSON type validation error

/**
 * General error code type
 * Currently aliased to ServerErrorCode
 */
export type ErrorCode = ServerErrorCode

/**
 * Error type with code and message
 * @template Code - The type of error code
 */
export type Err<Code> = {
  tag: 'Err',           // Error type discriminator
  code: Code,           // Error code
  message: string       // Error message
}

/**
 * Creates an error object with the specified code and message
 * @template E - The type of error code
 */
export const Err = <E extends ErrorCode>(code: E, message: string): Err<E> => {
  return {
    tag: 'Err',
    code,
    message,
  }
}

/**
 * Type guard to check if a value is an error object
 * @param v - Value to check
 * @returns True if the value is an error object
 */
export const isErr = (v: any): v is Err<any> => {
  return (v && v.tag === 'Err')
}
