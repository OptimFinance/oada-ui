/**
 * TextArea Component
 * 
 * A multi-line text input component that allows users to enter larger amounts of text.
 * Includes support for labels, error states, and custom styling.
 * 
 * This component is designed to be consistent with the InputBox component
 * but specifically for situations where more text entry space is needed.
 */

import Big from "big.js";
import classNames from "classnames"
import { ChangeEvent, FocusEvent } from "react"
import styles from './index.module.scss'

/**
 * Props for the TextArea component
 * 
 * @property label - Optional label text displayed above the textarea
 * @property value - Current textarea value (controlled component pattern)
 * @property placeholder - Optional placeholder text
 * @property onChange - Handler function for text change events
 * @property onBlur - Optional handler for when textarea loses focus
 * @property errorText - Optional error message to display (also triggers error styling)
 * @property className - Optional additional CSS classes
 * @property spellCheck - Whether to enable browser spell checking
 */
interface TextAreaPropsType {
  label?: string
  value: string
  placeholder?: string
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: (e: FocusEvent<HTMLTextAreaElement>) => void
  errorText?: string;
  className?: string;
  spellCheck?: boolean;
}

/**
 * TextArea Component
 * 
 * A textarea with support for labels and error states.
 * Follows the controlled component pattern with value and onChange props.
 * 
 * @example
 * // Basic usage
 * <TextArea 
 *   label="Description" 
 *   value={description} 
 *   onChange={(e) => setDescription(e.target.value)} 
 * />
 * 
 * // With error state
 * <TextArea 
 *   label="Comments" 
 *   value={comments} 
 *   onChange={(e) => setComments(e.target.value)}
 *   errorText={commentsError} 
 * />
 */
export const TextArea: React.FC<TextAreaPropsType> = (props) => {
  const { value, onChange, onBlur, label = '', placeholder = '', errorText, className, spellCheck } = props
  return <div className={styles.container}>
    {/* Label element - only rendered if label is provided */}
    <p className={styles.label}>{label}</p>
    
    {/* Textarea element */}
    <textarea
      placeholder={placeholder}
      onChange={onChange}
      onBlur={onBlur}
      spellCheck={spellCheck}
      className={classNames(className, styles.input, {[styles.errorInput]: errorText})} // Apply error styling conditionally
      value={value}
    >
      {value}
    </textarea>
    
    {/* Error message - only rendered if errorText is provided */}
    {errorText && <p className={styles.errorText}>{errorText}</p>}
  </div>
}
