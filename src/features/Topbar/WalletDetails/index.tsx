import { FC, useContext, useState } from "react";
import { ReactSVG } from "react-svg";
import logo from "../../../assets/images/Logomark.svg";
import walletIcon from "../../../assets/icons/li_wallet.svg";
import copy from "../../../assets/icons/li_copy.svg";
import external from "../../../assets/icons/li_external-link.svg";
import logout from "../../../assets/icons/li_log-out.svg";
import styles from "./index.module.scss";
import ada from "../../../assets/icons/ada.svg";
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
import {cn} from "src/utils/tailwind";

interface Props {
  txSigningMessage?: string;
  className?: string;
}

export const WalletDetails: FC<Props> = ({
  className,
}) => {
  const dispatch = useAppDispatch();
  const ws = useContext(WebsocketContext);
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

  const wallet = useAppSelector(selectWallet);
  const walletAmountAsLovelace = useAppSelector(selectWalletLovelaceAmount);

  if (wallet === null) setVisible(false);

  return (
    <div className={className}>
      <div
        className={styles.walletDetailsWrapper}
        onMouseEnter={onShow}
        onMouseLeave={onHide}
      >
        <div
          className={classNames(styles.walletDetailsButton, {
            [styles.open]: isVisible,
          })}
        >
          <span className={styles.detailsAmount}>
            {formatValue(walletAmountAsLovelace)}
          </span>
          <span className={styles.detailsAddress}>
            {wallet !== null ? wallet.address : ""}
          </span>
        </div>

        {isVisible && wallet !== null && (
          <div className={cn(styles.container, "max-w-[90vw] sm:max-w-[70vw]")}>
            <div className={styles.title}>
              <ReactSVG className={styles.logo} src={logo} /> Account
            </div>
            <div className={styles.address}>
              <Button clear>
                <ReactSVG className={styles.icon} src={walletIcon} />
                <span className={styles.value}>{wallet.address}</span>
              </Button>
            </div>
            <div className={styles.buttons}>
              <Button
                clear
                size="sm"
                onClick={() => copyToClipboard(wallet.address)}
              >
                <ReactSVG src={copy} className={styles.icon} />
                Copy Address
              </Button>
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
