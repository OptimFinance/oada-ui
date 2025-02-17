import Big from "big.js";
import classNames from "classnames"
import { ChangeEvent, FocusEvent } from "react"
import styles from './index.module.scss'

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

export const TextArea: React.FC<TextAreaPropsType> = (props) => {
  const { value, onChange, onBlur, label = '', placeholder = '', errorText, className, spellCheck } = props
  return <div className={styles.container}>
    <p className={styles.label}>{label}</p>
    <textarea
      placeholder={placeholder}
      onChange={onChange}
      onBlur={onBlur}
      spellCheck={spellCheck}
      className={classNames(className, styles.input, {[styles.errorInput]: errorText})}
      value={value}
    >
      {value}
    </textarea>
    {errorText && <p className={styles.errorText}>{errorText}</p>}
  </div>
}
