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

type Props = {
  fullWidth?: boolean;
  className?: string;
};

export const ConnectWallet: FC<Props> = ({
  fullWidth,
  className,
}) => {
  const [isOpen, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const ws = useContext(WebsocketContext);

  const dispatchSelectWallet = (walletName: string) => async () => {
    // TODO: not convinced there aren't race conditions here
    dispatch(setWalletByProvider({ name: walletName, ws }));
  };
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className={className}>
      <Button
        className={cn(fullWidth && "w-full", "text-sm")}
        size="sm"
        onClick={() => setOpen(!isOpen)}
      >
        Connect Wallet
      </Button>
      <Modal open={isOpen} blur={true} onClose={() => setOpen(false)}>
        <div>
          <h4 className="text-xl font-normal mb-6">Select Wallet</h4>
          <Card className="flex gap-2 items-start">
            <input
              className="mt-1"
              type="checkbox"
              defaultChecked={isChecked}
              onClick={() => setIsChecked(!isChecked)}
            />
            {(
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
            )}
          </Card>
          <ul className="my-6 flex flex-col gap-2">
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
