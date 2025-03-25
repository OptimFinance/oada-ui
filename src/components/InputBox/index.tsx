/**
 * InputBox Component
 * 
 * A customizable form input component with support for:
 * - Labels
 * - Error states with error messages
 * - Focus and blur event handling
 * - Number-specific input handling
 * 
 * Provides two variants:
 * 1. InputBox - General text input
 * 2. InputNumberBox - Specialized for numeric input
 */

import Big from "big.js";
import classNames from "classnames"
import { ChangeEvent, FocusEvent } from "react"
import styles from './index.module.scss'

/**
 * Props for the InputNumberBox component
 * 
 * @property label - Optional label text displayed above the input
 * @property value - Current input value (controlled component pattern)
 * @property placeholder - Optional placeholder text
 * @property onChange - Handler for input change events
 * @property onBlur - Optional handler for when input loses focus
 * @property errorText - Optional error message to display (also triggers error styling)
 * @property className - Optional additional CSS classes
 * @property spellCheck - Whether to enable browser spell checking
 */
interface InputNumberBoxProps{
  label?: string;
  value: string;
  placeholder?: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void
  errorText?: string;
  className?: string;
  spellCheck?: boolean;
}

/**
 * Props for the standard InputBox component
 * Almost identical to InputNumberBoxProps, but with some semantic differences
 */
interface InputBoxPropsType {
  label?: string
  value: string
  placeholder?: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void
  errorText?: string;
  className?: string;
  spellCheck?: boolean;
}

/**
 * Standard InputBox Component
 * 
 * A general-purpose text input field with label and error support.
 * Follows the controlled component pattern with value and onChange props.
 * 
 * @example
 * // Basic usage
 * <InputBox 
 *   label="Username" 
 *   value={username} 
 *   onChange={(e) => setUsername(e.target.value)} 
 * />
 * 
 * // With error state
 * <InputBox 
 *   label="Email" 
 *   value={email} 
 *   onChange={(e) => setEmail(e.target.value)}
 *   errorText={emailError} 
 * />
 */
export const InputBox: React.FC<InputBoxPropsType> = (props) => {
  const { value, onChange, onBlur, label = '', placeholder = '', errorText, className, spellCheck } = props
  
  return <div className={styles.container}>
    {/* Label element - only rendered if label is provided */}
    <p className={styles.label}>{label}</p>
    
    {/* Input element */}
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      spellCheck={spellCheck}
      // Apply error styling conditionally based on errorText presence
      className={classNames(className, styles.input, {[styles.errorInput]: errorText})}
    />
    
    {/* Error message - only rendered if errorText is provided */}
    {errorText && <p className={styles.errorText}>{errorText}</p>}
  </div>
}

/**
 * InputNumberBox Component
 * 
 * A specialized input for numeric values.
 * Similar to InputBox but with number-specific handling.
 * 
 * Note: Despite being for numbers, it still uses type="string" to allow for more
 * flexible input handling (like allowing decimal points during typing).
 * 
 * @example
 * // Basic usage
 * <InputNumberBox 
 *   label="Amount" 
 *   value={amount} 
 *   onChange={(e) => setAmount(e.target.value)} 
 * />
 */
export const InputNumberBox: React.FC<InputNumberBoxProps> = (props) => {
  const { value, onChange, onBlur, label = '', placeholder = 0, errorText, className, spellCheck } = props
  
  /**
   * Wrapper for the onChange handler
   * Could be extended for number-specific validation or formatting
   */
  const onChangeWrapper = (e: any) => {
    onChange && onChange(e)
  }
  
  return <div className={styles.container}>
    {/* Label element - only rendered if label is provided */}
    <p className={styles.label}>{label}</p>
    
    {/* Input element */}
    <input
      type="string"              // Using string type for more flexible input
      value={value}
      placeholder={placeholder.toString()}  // Convert number placeholder to string
      onChange={onChangeWrapper}
      onBlur={onBlur}
      // Apply error styling conditionally based on errorText presence
      className={classNames(className, styles.input, {[styles.errorInput]: errorText})}
      spellCheck={spellCheck}
    />
    
    {/* Error message - only rendered if errorText is provided */}
    {errorText && <p className={styles.errorText}>{errorText}</p>}
  </div>
}
