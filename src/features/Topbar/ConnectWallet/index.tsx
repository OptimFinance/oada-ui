/**
 * Wallet Icons
 * Import wallet icons for supported Cardano wallets
 */
import { FC, useContext, useState } from "react";
import eternl from "../../../assets/icons/eternl.png";
import exodus from "../../../assets/icons/exodus.svg";
import flint from "../../../assets/icons/flint.svg";
import gero from "../../../assets/icons/gero.svg";
import lace from "../../../assets/icons/lace.svg";
import lode from "../../../assets/icons/lode.svg";
import nami from "../../../assets/icons/nami.svg";
import nufi from "../../../assets/icons/nufi.svg";
import typhon from "../../../assets/icons/typhon.svg";
import vespr from "../../../assets/icons/vespr.svg";

/**
 * Component Dependencies
 */
import buttonStyles from "src/components/Button/index.module.scss";
import { Modal } from "src/components/Modal";
import { useAppDispatch } from "../../../store/hooks";
import { setWalletByProvider } from "../../../store/slices/walletSlice";
import { cn } from "src/utils/tailwind";
import { WebsocketContext } from "../../../websocket";
import styles from "./index.module.scss";
import { Card } from "src/components/ui/card";
import { Text } from "src/components/ui/typography";
import { Button } from "src/components/ui/button";

/**
 * Props interface for the ConnectWallet component
 * @interface Props
 * @property {boolean} [fullWidth] - Whether the connect button should span full width
 * @property {string} [className] - Additional CSS classes to apply to the component
 */
type Props = {
  fullWidth?: boolean;
  className?: string;
};

/**
 * ConnectWallet Component
 * 
 * A modal-based wallet connection interface for Cardano blockchain wallets.
 * Provides a list of supported wallets with their icons and handles the connection
 * process through the WebSocket context.
 * 
 * Features:
 * - Supports multiple Cardano wallets (Nami, Eternl, Flint, etc.)
 * - Terms acceptance checkbox for legal compliance
 * - Responsive design with optional full-width button
 * - WebSocket-based wallet connection handling
 * - Redux integration for wallet state management
 * 
 * @component
 */
export const ConnectWallet: FC<Props> = ({
  fullWidth,
  className,
}) => {
  // State management for modal visibility and terms acceptance
  const [isOpen, setOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // Redux and WebSocket context setup
  const dispatch = useAppDispatch();
  const ws = useContext(WebsocketContext);

  /**
   * Handles wallet selection and connection
   * Dispatches the wallet connection action with the selected provider
   * 
   * @param {string} walletName - The identifier for the selected wallet
   * @returns {() => Promise<void>} Async function to handle wallet connection
   */
  const dispatchSelectWallet = (walletName: string) => async () => {
    // TODO: not convinced there aren't race conditions here
    dispatch(setWalletByProvider({ name: walletName, ws }));
  };

  return (
    <div className={className}>
      {/* Connect Wallet Button */}
      <Button
        className={cn(fullWidth && "w-full", "text-sm")}
        size="sm"
        onClick={() => setOpen(!isOpen)}
      >
        Connect Wallet
      </Button>

      {/* Wallet Selection Modal */}
      <Modal open={isOpen} blur={true} onClose={() => setOpen(false)}>
        <div>
          <h4 className="text-xl font-normal mb-6">Select Wallet</h4>

          {/* Terms and Conditions Card */}
          <Card className="flex gap-2 items-start">
            <input
              className="mt-1"
              type="checkbox"
              defaultChecked={isChecked}
              onClick={() => setIsChecked(!isChecked)}
            />
            <Text>
              By connecting your wallet, you agree to our{" "}
              <a
                className={styles.headerLink}
                href="https://optim.finance/disclaimer"
              >
                Disclaimer
              </a>{" "}
              and our{" "}
              <a
                className={styles.headerLink}
                href="https://optim.finance/privacy-policy"
              >
                Privacy Policy
              </a>
              .
            </Text>
          </Card>

          {/* Wallet Options List */}
          <ul className="my-6 flex flex-col gap-2">
            {/* Nami Wallet */}
            <li>
              <Button
                variant="secondary"
                className="w-full rounded-xl justify-start"
                onClick={dispatchSelectWallet("nami")}
                disabled={!isChecked}
              >
                <span className={styles.icon}>
                  <img src={nami} alt="Nami" />
                </span>
                <span>Nami</span>
              </Button>
            </li>

            {/* Eternl Wallet */}
            <li>
              <Button
                variant="secondary"
                className="w-full rounded-xl justify-start"
                onClick={dispatchSelectWallet("eternl")}
                disabled={!isChecked}
              >
                <span className={styles.icon}>
                  <img src={eternl} alt="Eternl" />
                </span>
                <span>Eternl</span>
              </Button>
            </li>

            {/* Flint Wallet */}
            <li>
              <Button
                variant="secondary"
                className="w-full rounded-xl justify-start"
                onClick={dispatchSelectWallet("flint")}
                disabled={!isChecked}
              >
                <span className={styles.icon}>
                  <img src={flint} alt="Flint" />
                </span>
                <span>Flint</span>
              </Button>
            </li>

            {/* Gero Wallet */}
            <li>
              <Button
                variant="secondary"
                className="w-full rounded-xl justify-start"
                onClick={dispatchSelectWallet("gerowallet")}
                disabled={!isChecked}
              >
                <span className={styles.icon}>
                  <img src={gero} alt="Gero" />
                </span>
                <span>Gero</span>
              </Button>
            </li>

            {/* Typhon Wallet */}
            <li>
              <Button
                variant="secondary"
                className="w-full rounded-xl justify-start"
                onClick={dispatchSelectWallet("typhoncip30")}
                disabled={!isChecked}
              >
                <span className={styles.icon}>
                  <img src={typhon} alt="Typhon" />
                </span>
                <span>Typhon</span>
              </Button>
            </li>

            {/* Lode Wallet */}
            <li>
              <Button
                variant="secondary"
                className="w-full rounded-xl justify-start"
                onClick={dispatchSelectWallet("LodeWallet")}
                disabled={!isChecked}
              >
                <span className={styles.icon}>
                  <img src={lode} alt="Lode" />
                </span>
                <span>Lode</span>
              </Button>
            </li>

            {/* Exodus Wallet */}
            <li>
              <Button
                variant="secondary"
                className="w-full rounded-xl justify-start"
                onClick={dispatchSelectWallet("exodus")}
                disabled={!isChecked}
              >
                <span className={styles.icon}>
                  <img src={exodus} alt="Exodus" />
                </span>
                <span>Exodus</span>
              </Button>
            </li>

            {/* Vespr Wallet */}
            <li>
              <Button
                variant="secondary"
                className="w-full rounded-xl justify-start"
                onClick={dispatchSelectWallet("vespr")}
                disabled={!isChecked}
              >
                <span className={styles.icon}>
                  <img
                    src={vespr}
                    className={buttonStyles.invertOnHover}
                    alt="Vespr"
                  />
                </span>
                <span>Vespr</span>
              </Button>
            </li>

            {/* Lace Wallet */}
            <li>
              <Button
                variant="secondary"
                className="w-full rounded-xl justify-start"
                onClick={dispatchSelectWallet("lace")}
                disabled={!isChecked}
              >
                <span className={styles.icon}>
                  <img
                    src={lace}
                    className={buttonStyles.invertOnHover}
                    alt="Lace"
                  />
                </span>
                <span>Lace</span>
              </Button>
            </li>

            {/* Nufi Wallet */}
            <li>
              <Button
                variant="secondary"
                className="w-full rounded-xl justify-start"
                onClick={dispatchSelectWallet("nufi")}
                disabled={!isChecked}
              >
                <span className={styles.icon}>
                  <img
                    src={nufi}
                    className={buttonStyles.invertOnHover}
                    alt="Nufi"
                  />
                </span>
                <span>Nufi</span>
              </Button>
            </li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};
