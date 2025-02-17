import Big from "big.js";
import classNames from "classnames"
import { ChangeEvent, FocusEvent } from "react"
import styles from './index.module.scss'

interface InputNumberBoxProps{
  label?: string;
  value: string;
  placeholder?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void
  errorText?: string;
  className?: string;
  spellCheck?: boolean;
}
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

export const InputBox: React.FC<InputBoxPropsType> = (props) => {
  const { value, onChange, onBlur, label = '', placeholder = '', errorText, className, spellCheck } = props
  return <div className={styles.container}>
    <p className={styles.label}>{label}</p>
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      spellCheck={spellCheck}
      className={classNames(className, styles.input, {[styles.errorInput]: errorText})}
    />
    {errorText && <p className={styles.errorText}>{errorText}</p>}
  </div>
}

export const InputNumberBox: React.FC<InputNumberBoxProps> = (props) => {
  const { value, onChange, onBlur, label = '', placeholder = 0, errorText, className, spellCheck } = props
  const onChangeWrapper = (e: any) => {
    onChange && onChange(e)
  }
  return <div className={styles.container}>
    <p className={styles.label}>{label}</p>
    <input
      type="string"
      value={value}
      placeholder={placeholder.toString()}
      onChange={onChangeWrapper}
      onBlur={onBlur}
      className={classNames(className, styles.input, {[styles.errorInput]: errorText})}
      spellCheck={spellCheck}
    />
    {errorText && <p className={styles.errorText}>{errorText}</p>}
  </div>
}
