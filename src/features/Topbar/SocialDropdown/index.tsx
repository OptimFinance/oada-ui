/**
 * SocialDropdown Component
 * 
 * A hover-triggered dropdown menu that displays social media links with icons.
 * Features a dots icon trigger button and animated visibility transitions.
 * 
 * Features:
 * - Hover-based interaction
 * - Debounced hide animation (300ms delay)
 * - SVG icon integration with size optimization
 * - Tailwind CSS styling with dark theme
 * - External social media links (Twitter, Discord, Medium)
 */

import { useState } from "react";
import twitter from "../../../assets/icons/twitter.svg";
import discord from "../../../assets/icons/discord.svg";
import medium from "../../../assets/icons/medium.svg";
import { ReactSVG } from "react-svg";
import styles from "./index.module.scss";
import classNames from "classnames";
import { resize } from "../../../utils";

export const SocialDropdown = () => {
  // State for controlling dropdown visibility
  const [isVisible, setVisible] = useState(false);

  // Timer for debounced hide animation
  let timerId = 0;

  /**
   * Shows the dropdown menu immediately
   * Clears any pending hide timer
   */
  const onShow = () => {
    clearTimeout(timerId);
    setVisible(true);
  };

  /**
   * Hides the dropdown menu with a delay
   * Uses setTimeout to create a smooth transition effect
   * and prevent accidental hiding during mouse movement
   */
  const onHide = () => {
    timerId = setTimeout(() => {
      setVisible(false);
    }, 300) as any;
  };

  /**
   * Social media platform configurations
   * Each entry contains:
   * @property {string} icon - Path to the SVG icon
   * @property {string} label - Display name of the platform
   * @property {string} link - External URL to the social media profile
   */
  const socials = [
    {
      icon: twitter,
      label: "Twitter",
      link: "https://twitter.com/OptimFi",
    },
    {
      icon: discord,
      label: "Discord",
      link: "https://discord.gg/VZ329q7x69",
    },
    {
      icon: medium,
      label: "Medium",
      link: "https://optim-labs.medium.com",
    },
  ];

  return (
    <div
      className={classNames(styles.socialMenuButton, {
        [styles.open]: isVisible,
      })}
      onMouseEnter={onShow}
      onMouseLeave={onHide}
    >
      {/* Dropdown Menu - Only rendered when visible */}
      {!!isVisible && (
        <ul className="flex bg-ui-base-background border-2 border-ui-border-sub flex-col gap-4 absolute top-12 right-2 p-4 rounded-xl">
          {/* Social Media Links */}
          {socials.map(({ icon, label, link }) => (
            <li key={label}>
              <a
                className="flex items-center gap-2 text-base text-ui-surface-sub hover:text-ui-base-white"
                href={link}
              >
                {/* Optimized SVG icon with consistent sizing */}
                <ReactSVG src={icon} beforeInjection={resize(16, 16)} />
                {label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
