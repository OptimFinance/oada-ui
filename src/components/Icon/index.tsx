import React from "react";
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
import { ReactSVG } from "react-svg";

interface IconProps {
  name?: string;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = (props) => {
  const { name, className } = props;
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
      icon = Plus;
      break;
  }
  return <ReactSVG className={className} src={icon} />;
};
