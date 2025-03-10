import React from "react";
import { ReactSVG } from "react-svg";
import styles from "./index.module.scss";
import eqt from "../../assets/icons/eqt.svg";
import arrowRight from "../../assets/icons/li_arrow-right_white.svg";
import bond from "../../assets/icons/bond.svg";
import { Button } from "src/components/Button";

interface ConvertProps {
  changeAMT?: number;
  exchangeAMT?: number;
  changeCurrency?: string;
  exchangeCurrency?: string;
}

const ConvertWallet: React.FC<ConvertProps> = ({
  changeAMT = 1000,
  exchangeAMT = 100,
  changeCurrency = "EQT",
  exchangeCurrency = "Bond Token",
}) => {
  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>Convert EQT Token</p>
      <div className={styles.walletLogos}>
        <ReactSVG className={styles.icon} src={eqt} />
        <ReactSVG className={styles.icon} src={arrowRight} />
        <ReactSVG className={styles.icon} src={bond} />
      </div>
      <Button size="xl" className={styles.cardButton}>
        Convert
      </Button>
      <div className={styles.info}>
        <div className={styles.change}>
          <p className={styles.label}>You have</p>
          <p className={styles.amount}>
            {changeAMT} {changeCurrency}
          </p>
        </div>
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
