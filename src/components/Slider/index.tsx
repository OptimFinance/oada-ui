/**
 * Slider Component
 * 
 * A thin wrapper around the react-slider library that applies consistent
 * styling to create a custom range slider control.
 * 
 * This component maintains all the functionality of react-slider while
 * applying custom CSS classes for the track and thumb elements to match
 * the application's design system.
 */

import ReactSlider, { ReactSliderProps } from "react-slider";
import "./index.css";
import { cn } from "src/utils/tailwind";

/**
 * Props for the Slider component
 * Inherits all props from ReactSliderProps, including:
 * 
 * @property value - Current value(s) of the slider (number or array)
 * @property onChange - Handler function called when slider value changes
 * @property min - Minimum value of the slider range (default: 0)
 * @property max - Maximum value of the slider range (default: 100)
 * @property step - Step size for value changes (default: 1)
 * @property className - Additional CSS class names for the slider container
 */
interface Props extends ReactSliderProps {}

/**
 * Slider Component
 * 
 * Renders a customized horizontal slider with consistent styling.
 * 
 * @example
 * // Basic usage
 * <Slider 
 *   value={50}
 *   onChange={(value) => console.log(value)}
 *   min={0}
 *   max={100}
 * />
 * 
 * // With custom step size
 * <Slider 
 *   value={25}
 *   onChange={handleChange}
 *   min={0}
 *   max={100}
 *   step={5}
 * />
 */
export const Slider = ({
  onChange,
  value,
  min,
  max,
  step,
  className,
}: Props) => {
  return (
    <ReactSlider
      className={cn("horizontal-slider", className)}  /* Combine base styles with any additional classes */
      thumbClassName="thumb"                         /* Apply custom thumb styling */
      trackClassName="track"                         /* Apply custom track styling */
      {...{ min, max, step, value, onChange }}       /* Pass through all standard slider props */
    />
  );
};
