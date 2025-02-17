import ReactSlider, { ReactSliderProps } from "react-slider";
import "./index.css";
import { cn } from "src/utils/tailwind";

interface Props extends ReactSliderProps {}

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
      className={cn("horizontal-slider", className)}
      thumbClassName="thumb"
      trackClassName="track"
      {...{ min, max, step, value, onChange }}
    />
  );
};
