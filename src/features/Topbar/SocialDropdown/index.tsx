import { useState } from "react";
import twitter from "../../../assets/icons/twitter.svg";
import discord from "../../../assets/icons/discord.svg";
import medium from "../../../assets/icons/medium.svg";
import { ReactSVG } from "react-svg";
import styles from "./index.module.scss";
import classNames from "classnames";
import { resize } from "../../../utils";

export const SocialDropdown = () => {
  const [isVisible, setVisible] = useState(false);

  let timerId = 0;

  const onShow = () => {
    clearTimeout(timerId);
    setVisible(true);
  };

  const onHide = () => {
    timerId = setTimeout(() => {
      setVisible(false);
    }, 300) as any;
  };

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
      {!!isVisible && (
        <ul className="flex bg-ui-base-background border-2 border-ui-border-sub flex-col gap-4 absolute top-12 right-2 p-4 rounded-xl">
          {socials.map(({ icon, label, link }) => (
            <li key={label}>
              <a
                className="flex items-center gap-2 text-base text-ui-surface-sub hover:text-ui-base-white"
                href={link}
              >
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
