/**
 * Icon Component
 * 
 * A centralized icon system that provides a consistent interface for using SVG icons throughout the application.
 * This component acts as a registry of all available icons, allowing them to be referenced by name.
 * 
 * Benefits:
 * - Consistent usage pattern across the application
 * - Central place to manage all icons
 * - Easy to swap or update icons without changing component usage
 * - Allows for standardized styling and sizing
 */

import React from "react";
// Import all SVG icon assets
import Plus from "../../assets/icons/plus.svg";
import file_check from "../../assets/icons/file_check.svg";
import pie_chart from "../../assets/icons/pie_chart.svg";
import down_right from "../../assets/icons/down_right.svg";
import up_right from "../../assets/icons/up_right.svg";
import bar_chart from "../../assets/icons/bar_chart.svg";
import li_bar_chart from "../../assets/icons/li_bar-chart-2.svg";
import shield from "../../assets/icons/shield.svg";
import jewell from "../../assets/icons/jewell.svg";
import shield_check from "../../assets/icons/shield_check.svg";
import arrow_right from "../../assets/icons/li_arrow-right.svg";
import copy from "../../assets/icons/li_copy.svg";
import eternl from "../../assets/icons/favicon.svg";
import gem from "../../assets/icons/gem.svg";
import arrow_down from "../../assets/icons/arrow_down.svg";
import wallet from "../../assets/icons/wallet.svg";
import copy_clipboard from "../../assets/icons/copy_clipboard.svg";
import info from "../../assets/icons/li_info.svg";
import chevron_left from "../../assets/icons/chevron-left.svg";
import li_wand from "../../assets/icons/li_wand.svg";
import { ReactSVG } from "react-svg"; // Library for rendering SVG files

/**
 * Props for the Icon component
 * 
 * @property name - The identifier for the icon to display (matches a case in the switch statement)
 * @property size - Optional size parameter (not currently implemented in rendering)
 * @property className - Optional CSS class to apply to the icon for styling
 */
interface IconProps {
  name?: string;
  size?: number;
  className?: string;
}

/**
 * Icon Component
 * 
 * Renders an SVG icon based on the provided name.
 * Falls back to the Plus icon if an unknown name is provided.
 * 
 * @example
 * // Basic usage
 * <Icon name="shield" />
 * 
 * // With custom class for styling
 * <Icon name="arrow_right" className="button-icon" />
 * 
 * Available icons:
 * - plus
 * - file_check
 * - pie_chart
 * - down_right
 * - up_right
 * - bar_chart
 * - li_bar_chart
 * - shield
 * - jewell
 * - shield_check
 * - arrow_right
 * - copy
 * - eternl
 * - gem
 * - arrow_down
 * - wallet
 * - copy_clipboard
 * - info
 * - chevron_left
 * - magic (renders li_wand)
 */
export const Icon: React.FC<IconProps> = (props) => {
  const { name, className } = props;
  
  // Determine which icon to use based on the name prop
  let icon;
  switch (name) {
    case "plus":
      icon = Plus;
      break;
    case "file_check":
      icon = file_check;
      break;
    case "down_right":
      icon = down_right;
      break;
    case "up_right":
      icon = up_right;
      break;
    case "pie_chart":
      icon = pie_chart;
      break;
    case "bar_chart":
      icon = bar_chart;
      break;
    case "li_bar_chart":
      icon = li_bar_chart;
      break;
    case "shield_check":
      icon = shield_check;
      break;
    case "shield":
      icon = shield;
      break;
    case "jewell":
      icon = jewell;
      break;
    case "arrow_right":
      icon = arrow_right;
      break;
    case "arrow_down":
      icon = arrow_down;
      break;
    case "gem":
      icon = gem;
      break;
    case "copy":
      icon = copy;
      break;
    case "eternl":
      icon = eternl;
      break;
    case "wallet":
      icon = wallet;
      break;
    case "copy_clipboard":
      icon = copy_clipboard;
      break;
    case "info":
      icon = info;
      break;
    case "chevron_left":
      icon = chevron_left;
      break;
    case "magic":
      icon = li_wand;
      break;
    default:
      // Fall back to Plus icon if name is not recognized
      icon = Plus;
      break;
  }
  
  // Render the selected SVG icon using ReactSVG component
  return <ReactSVG className={className} src={icon} />;
};
