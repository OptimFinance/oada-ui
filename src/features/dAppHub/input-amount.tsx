import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { CustomIconsType } from "src/components/ui/custom-icon";
import { validateInput } from "src/utils/validateCurrencyAmountInput";
import { Text } from "src/components/ui/typography";
import { formatNumberWithSuffix } from "src/utils/formatNumbers";
import { Input } from "src/components/ui/input";
import { Button } from "src/components/ui/button";
import { CurrencyLogos } from "src/components/CurrencyLogos";
import { Attention } from "src/components/Attention";
import { TABS } from "./tabs";
import {useLocation} from "react-router-dom";

export const TransactionInputAmount = (props: {
  currency: string;
  icons: CustomIconsType[];
  availableAmount: number;
  inputAmount: string;
  setInputAmount: Dispatch<SetStateAction<string>>;
  setValidInput: Dispatch<SetStateAction<boolean>>
  stakingQueue?: number;
  handleAddToQueue?: () => void;
  currentTab: TABS;
  stakeVaultCapacity?: number;
  minimum?: number
}) => {
  const {
    currency,
    availableAmount,
    inputAmount,
    setInputAmount,
    setValidInput,
    icons,
    handleAddToQueue,
    currentTab,
    stakeVaultCapacity,
    minimum = 0
  } = props;
  const location = useLocation()
  const [inputWidth, setInputWidth] = useState(0);
  const hiddenSpanRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (hiddenSpanRef.current) {
      setInputWidth(hiddenSpanRef.current.offsetWidth);
    }
  }, [inputAmount]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "" || validateInput(e.target.value)) {
      setInputAmount(e.target.value);
    }
  };

  console.log(hiddenSpanRef.current?.offsetWidth);

  const isExceedingStakeVaultCapacity = stakeVaultCapacity
    ? parseFloat(inputAmount) > stakeVaultCapacity
    : false;

  setValidInput([
    parseInt(inputAmount) >= minimum,
    parseInt(inputAmount) <= availableAmount
  ].every(x=>x))
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Text size="medium">Amount</Text>
        <Text size="medium" tone="muted">
          Available {currency}{" "}
          <span className="text-ui-surface-default">
            <a href={`${location.pathname}${location.search}${location.hash || "#"}`}
              onClick={(e) => {
              setInputAmount(availableAmount.toString())
              e.stopPropagation()
              return false
            }}>
              {formatNumberWithSuffix(availableAmount)}{" "}
            </a>
            {currency === "ADA" && "₳"}
          </span>
        </Text>
      </div>
      <div className="relative">
        <span
          ref={hiddenSpanRef}
          className="absolute opacity-0 h-0 whitespace-nowrap text-2xl"
        >
          {inputAmount}
        </span>
        <Input
          autoFocus={true}
          value={inputAmount}
          onChange={handleInputChange}
          className="rounded-lg text-2xl w-full py-5 px-4"
        />

        {inputAmount.length > 0 &&
          currentTab === "stake" &&
          stakeVaultCapacity === 0 && (
            <Button
              variant="primary"
              style={{ left: `${24 + inputWidth}px` }}
              className="absolute top-1/2 transform -translate-y-1/2 px-2 py-0.5 rounded-full h-7"
              onClick={handleAddToQueue}
            >
              Add to queue
            </Button>
          )}

        <CurrencyLogos
          logos={icons}
          className="absolute right-4 top-1/2 -translate-y-1/2 h-10"
        />
      </div>

      {currentTab === "stake" && (stakeVaultCapacity ?? 0) <= 0 && (
        <Attention className="px-1.5 py-2 text-xs items-center rounded-lg">
          sOADA is currently at maximum capacity. Your stake order will
          be queued and staked at a later date.
        </Attention>
      )}

      {currentTab === "stake" && (stakeVaultCapacity ?? 0) > 0 && isExceedingStakeVaultCapacity && (
        <Attention className="px-1.5 py-2 text-xs items-center rounded-lg">
          This amount is greater than the current sOADA capacity. Your stake
          order will be partially filled and the remainder will be added to the
          stake queue.
        </Attention>
      )}

      {parseInt(inputAmount) > availableAmount && (
        <Attention className="px-1.5 py-2 text-xs items-center rounded-lg">
          Your wallet has insufficient funds for this operation.
        </Attention>
      )}

      {parseInt(inputAmount) < minimum && (
        <Attention className="px-1.5 py-2 text-xs items-center rounded-lg">
          This amount is less than minimum allowed value of {minimum}.
        </Attention>
      )}
    </div>
  );
};
