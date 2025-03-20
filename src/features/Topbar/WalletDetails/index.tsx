/**
 * WalletDetails Component
 * 
 * A dropdown component that displays detailed information about the connected
 * Cardano wallet, including address, ADA balance, and account actions.
 * 
 * Features:
 * - Hover-triggered dropdown with debounced hide animation
 * - Displays wallet address with truncation
 * - Shows ADA balance with proper formatting
 * - Quick actions: copy address, view in explorer
 * - Wallet disconnection functionality
 * - Responsive design with max-width constraints
 */

import { FC, useContext, useState } from "react";
import { ReactSVG } from "react-svg";

// Asset imports
import logo from "../../../assets/images/Logomark.svg";
import walletIcon from "../../../assets/icons/li_wallet.svg";
import copy from "../../../assets/icons/li_copy.svg";
import external from "../../../assets/icons/li_external-link.svg";
import logout from "../../../assets/icons/li_log-out.svg";
import ada from "../../../assets/icons/ada.svg";

// Component and utility imports
import styles from "./index.module.scss";
import { Button } from "src/components/Button";
import classNames from "classnames";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  disconnectWalletThunk,
  selectWallet,
  selectWalletLovelaceAmount,
} from "../../../store/slices/walletSlice";
import {
  formatValue,
  lovelaceToAda,
} from "src/utils";
import {
  copyToClipboard,
} from "../../../utils";
import { WebsocketContext } from "../../../websocket";
import { cn } from "src/utils/tailwind";

/**
 * Props interface for the WalletDetails component
 * @interface Props
 * @property {string} [txSigningMessage] - Optional message displayed during transaction signing
 * @property {string} [className] - Additional CSS classes to apply to the component
 */
interface Props {
  txSigningMessage?: string;
  className?: string;
}

export const WalletDetails: FC<Props> = ({
  className,
}) => {
  // Redux setup
  const dispatch = useAppDispatch();
  const ws = useContext(WebsocketContext);

  // State management for dropdown visibility
  const [isVisible, setVisible] = useState(false);
  let timerId = 0;

  // Show/hide handlers with debounce
  const onShow = () => {
    clearTimeout(timerId);
    setVisible(true);
  };

  const onHide = () => {
    timerId = setTimeout(() => {
      setVisible(false);
    }, 300) as any;
  };

  // Wallet state from Redux
  const wallet = useAppSelector(selectWallet);
  const walletAmountAsLovelace = useAppSelector(selectWalletLovelaceAmount);

  // Hide dropdown if wallet is disconnected
  if (wallet === null) setVisible(false);

  return (
    <div className={className}>
      {/* Main wallet details container with hover handlers */}
      <div
        className={styles.walletDetailsWrapper}
        onMouseEnter={onShow}
        onMouseLeave={onHide}
      >
        {/* Wallet Summary Button */}
        <div
          className={classNames(styles.walletDetailsButton, {
            [styles.open]: isVisible,
          })}
        >
          {/* Balance Display */}
          <span className={styles.detailsAmount}>
            {formatValue(walletAmountAsLovelace)}
          </span>
          {/* Truncated Address Display */}
          <span className={styles.detailsAddress}>
            {wallet !== null ? wallet.address : ""}
          </span>
        </div>

        {/* Detailed Wallet Information Dropdown */}
        {isVisible && wallet !== null && (
          <div className={cn(styles.container, "max-w-[90vw] sm:max-w-[70vw]")}>
            {/* Header */}
            <div className={styles.title}>
              <ReactSVG className={styles.logo} src={logo} /> Account
            </div>

            {/* Full Wallet Address */}
            <div className={styles.address}>
              <Button clear>
                <ReactSVG className={styles.icon} src={walletIcon} />
                <span className={styles.value}>{wallet.address}</span>
              </Button>
            </div>

            {/* Quick Actions */}
            <div className={styles.buttons}>
              {/* Copy Address Button */}
              <Button
                clear
                size="sm"
                onClick={() => copyToClipboard(wallet.address)}
              >
                <ReactSVG src={copy} className={styles.icon} />
                Copy Address
              </Button>

              {/* Explorer Link */}
              <a
                href={`https://cardanoscan.io/address/${wallet.address}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button clear size="sm" fullWidth>
                  <ReactSVG src={external} className={styles.icon} />
                  Explorer
                </Button>
              </a>
            </div>

            {/* Balance Information */}
            <div className={styles.box}>
              <table className={styles.wallets}>
                <tbody>
                  <tr key={"ADA"}>
                    <td>
                      <img className={styles.icon} src={ada} alt={"ADA"} />
                      {"ADA"}
                    </td>
                    <td>
                      {lovelaceToAda(walletAmountAsLovelace).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Disconnect Button */}
            <Button
              size="sm"
              secondary
              className={styles.disconnect}
              onClick={() => {
                dispatch(disconnectWalletThunk({ ws }));
              }}
            >
              <ReactSVG className={styles.icon} src={logout} />
              Disconnect
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
