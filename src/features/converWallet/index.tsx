/**
 * ConvertWallet Component
 * 
 * A component that displays a token conversion interface, allowing users to convert
 * one cryptocurrency token type to another (specifically EQT to Bond tokens).
 * 
 * This component presents:
 * - A visual representation of the conversion with token icons and direction
 * - The user's current token balance ("You have")
 * - The expected conversion result ("You get")
 * - A convert action button
 * 
 * Note: This is a display component that doesn't currently implement the actual
 * conversion functionality - it would need to be connected to state management
 * and API calls to complete token conversions.
 */

import React from "react";
import { ReactSVG } from "react-svg";
import styles from "./index.module.scss";
import eqt from "../../assets/icons/eqt.svg";
import arrowRight from "../../assets/icons/li_arrow-right_white.svg";
import bond from "../../assets/icons/bond.svg";
import { Button } from "src/components/Button";

/**
 * Props interface for the ConvertWallet component
 * 
 * @property {number} changeAMT - The amount of source currency the user has (default: 1000)
 * @property {number} exchangeAMT - The amount of destination currency the user will receive (default: 100)
 * @property {string} changeCurrency - The name of the source currency (default: "EQT")
 * @property {string} exchangeCurrency - The name of the destination currency (default: "Bond Token")
 */
interface ConvertProps {
  changeAMT?: number;
  exchangeAMT?: number;
  changeCurrency?: string;
  exchangeCurrency?: string;
}

/**
 * ConvertWallet Component
 * 
 * Displays an interface for converting between token types with visual representation
 * of the conversion flow and token amounts.
 * 
 * @param {ConvertProps} props - Component props with conversion details
 * @returns {JSX.Element} A card-like interface showing token conversion details
 * 
 * @example
 * // Basic usage with defaults
 * <ConvertWallet />
 * 
 * // Custom conversion rates and tokens
 * <ConvertWallet 
 *   changeAMT={500} 
 *   exchangeAMT={50}
 *   changeCurrency="USDT"
 *   exchangeCurrency="ETH"
 * />
 */
const ConvertWallet: React.FC<ConvertProps> = ({
  changeAMT = 1000,
  exchangeAMT = 100,
  changeCurrency = "EQT",
  exchangeCurrency = "Bond Token",
}) => {
  return (
    <div className={styles.wrapper}>
      {/* Card title */}
      <p className={styles.title}>Convert EQT Token</p>
      
      {/* Visual representation of conversion flow with token icons */}
      <div className={styles.walletLogos}>
        <ReactSVG className={styles.icon} src={eqt} />
        <ReactSVG className={styles.icon} src={arrowRight} />
        <ReactSVG className={styles.icon} src={bond} />
      </div>
      
      {/* Action button to trigger the conversion */}
      <Button size="xl" className={styles.cardButton}>
        Convert
      </Button>
      
      {/* Information section showing token amounts */}
      <div className={styles.info}>
        {/* Source token amount section */}
        <div className={styles.change}>
          <p className={styles.label}>You have</p>
          <p className={styles.amount}>
            {changeAMT} {changeCurrency}
          </p>
        </div>
        
        {/* Destination token amount section with icon */}
        <div className={styles.exchange}>
          <div className={styles.tokenInfo}>
            <p className={styles.label}>You get</p>
            <p className={styles.amount}>
              {exchangeAMT} {exchangeCurrency}
            </p>
          </div>
          <ReactSVG className={styles.exchangeIcon} src={bond} />
        </div>
      </div>
    </div>
  );
};

export default ConvertWallet;
