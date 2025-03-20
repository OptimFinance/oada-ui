/**
 * Spinner Component
 * 
 * A loading indicator that provides visual feedback during asynchronous operations.
 * This component wraps the ClipLoader from react-spinners with consistent styling
 * and centers it within its container.
 * 
 * Note: The component currently includes a message prop in its type definition
 * but doesn't actually use it in the implementation. This could be enhanced
 * in the future to display a loading message alongside the spinner.
 */

import { CSSProperties, FC } from "react";
import classNames from "classnames";
import styles from "./index.module.scss";
import {ClipLoader} from "react-spinners";

/**
 * Props for the Spinner component
 * 
 * @property message - Optional text message to display with the spinner (currently unused)
 */
type Props = {
  message?: string
};

/**
 * CSS overrides for the ClipLoader component
 * These properties enhance performance by enabling hardware acceleration
 * and optimizing rendering
 */
const css: CSSProperties = {
  transform: "translate3d(0, 0, 0)",  /* Enable hardware acceleration */
  willChange: "transform"             /* Hint to the browser about upcoming transformations */
}

/**
 * Spinner Component
 * 
 * Renders a centered loading spinner with optimized CSS properties.
 * 
 * @example
 * // Basic usage
 * <Spinner />
 * 
 * // Usage in a container
 * <div style={{ height: '200px', position: 'relative' }}>
 *   <Spinner />
 * </div>
 */
export const Spinner: FC<Props> = () => {
  console.log('Spinner')  // Consider removing this console.log in production
  return (
    <div className={classNames(styles.spinner)}>
      <ClipLoader 
        cssOverride={css}    /* Apply performance optimizations */
        size={100}           /* Set spinner size */
        color={"#ffffffc8"}  /* Semi-transparent white color */
      />
    </div>
  );
};
 
