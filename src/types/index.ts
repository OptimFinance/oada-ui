/**
 * Types Root Export Module
 * 
 * This module serves as the central export point for all application types.
 * It aggregates and re-exports type definitions from various sub-modules,
 * providing a single, unified entry point for type imports.
 * 
 * Current exports:
 * - UI types from './ui' module
 * 
 * Usage:
 * ```typescript
 * import { UITypes } from '../types'
 * ```
 * 
 * This pattern allows for:
 * - Centralized type management
 * - Simplified imports
 * - Better type organization
 * - Easier type system maintenance
 */

export * from "./ui";
