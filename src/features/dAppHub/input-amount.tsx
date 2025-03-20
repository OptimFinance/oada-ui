/**
 * Transaction Input Amount Component
 * 
 * This component provides a sophisticated input field for financial transactions,
 * specifically designed for cryptocurrency/token amount entry with the following features:
 * 
 * - Input validation with real-time feedback
 * - Available balance display with "max" amount shortcut
 * - Currency icon display
 * - Contextual warnings based on input amount
 * - Special handling for staking when vault capacity is reached
 * - Support for minimum amount requirements
 * 
 * The component adapts its behavior and UI based on the current transaction type (mint/stake/unstake)
 * and provides appropriate guidance to users through warning messages.
 * 
 * Used in various transaction flows throughout the dApp Hub, including minting, staking,
 * and unstaking operations.
 */

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

/**
 * TransactionInputAmount Component
 * 
 * @param props - Component properties
 * @param props.currency - Token currency code (e.g., "ADA", "OADA")
 * @param props.icons - Array of currency icon identifiers to display
 * @param props.availableAmount - Maximum amount user can input (typically wallet balance)
 * @param props.inputAmount - Current input value (controlled from parent)
 * @param props.setInputAmount - Function to update input value in parent
 * @param props.setValidInput - Function to update input validity in parent
 * @param props.stakingQueue - Optional amount in the staking queue (for stake operations)
 * @param props.handleAddToQueue - Optional callback for "Add to queue" button
 * @param props.currentTab - Current transaction tab (mint/stake/unstake)
 * @param props.stakeVaultCapacity - Optional available capacity in stake vault
 * @param props.minimum - Optional minimum allowed amount (defaults to 0)
 * @returns An input component with amount validation and contextual warnings
 */
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
  
  // Used for constructing the URL for the "max" button
  const location = useLocation()
  
  // State to track input width for positioning the "Add to queue" button
  const [inputWidth, setInputWidth] = useState(0);
  
  // Hidden element used to measure the width of the input text
  const hiddenSpanRef = useRef<HTMLSpanElement>(null);

  // Update input width measurement when input value changes
  useLayoutEffect(() => {
    if (hiddenSpanRef.current) {
      setInputWidth(hiddenSpanRef.current.offsetWidth);
    }
  }, [inputAmount]);

  /**
   * Input change handler
   * 
   * Validates input to ensure it's a valid currency amount before updating state
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "" || validateInput(e.target.value)) {
      setInputAmount(e.target.value);
    }
  };

  // TODO: Remove or convert to proper debug logging
  console.log(hiddenSpanRef.current?.offsetWidth);

  // Determine if input amount exceeds stake vault capacity
  const isExceedingStakeVaultCapacity = stakeVaultCapacity
    ? parseFloat(inputAmount) > stakeVaultCapacity
    : false;

  // Update input validity based on minimum and maximum constraints
  // The every(x=>x) pattern checks that all validation conditions are true
  setValidInput([
    parseInt(inputAmount) >= minimum,
    parseInt(inputAmount) <= availableAmount
  ].every(x=>x))
  
  return (
    <div className="flex flex-col gap-4">
      {/* Header section with label and available amount */}
      <div className="flex justify-between items-center">
        <Text size="medium">Amount</Text>
        <Text size="medium" tone="muted">
          Available {currency}{" "}
          <span className="text-ui-surface-default">
            {/* "Max" button that fills in the maximum available amount */}
            <a href={`${location.pathname}${location.search}${location.hash || "#"}`}
              onClick={(e) => {
              setInputAmount(availableAmount.toString())
              e.stopPropagation()
              return false
            }}>
              {formatNumberWithSuffix(availableAmount)}{" "}
            </a>
            {/* Display ADA symbol only for ADA currency */}
            {currency === "ADA" && "₳"}
          </span>
        </Text>
      </div>
      
      {/* Input field container with currency icons */}
      <div className="relative">
        {/* Hidden span used to measure text width for button positioning */}
        <span
          ref={hiddenSpanRef}
          className="absolute opacity-0 h-0 whitespace-nowrap text-2xl"
        >
          {inputAmount}
        </span>
        
        {/* Main input field */}
        <Input
          autoFocus={true}
          value={inputAmount}
          onChange={handleInputChange}
          className="rounded-lg text-2xl w-full py-5 px-4"
        />

        {/* "Add to queue" button - only shown when staking with full capacity */}
        {inputAmount.length > 0 &&
          currentTab === "stake" &&
          stakeVaultCapacity === 0 && (
            <Button
              variant="primary"
              style={{ left: `${24 + inputWidth}px` }} // Position dynamically based on input text width
              className="absolute top-1/2 transform -translate-y-1/2 px-2 py-0.5 rounded-full h-7"
              onClick={handleAddToQueue}
            >
              Add to queue
            </Button>
          )}

        {/* Currency icons displayed on the right side of input */}
        <CurrencyLogos
          logos={icons}
          className="absolute right-4 top-1/2 -translate-y-1/2 h-10"
        />
      </div>

      {/* Warning: Staking pool at capacity */}
      {currentTab === "stake" && (stakeVaultCapacity ?? 0) <= 0 && (
        <Attention className="px-1.5 py-2 text-xs items-center rounded-lg">
          sOADA is currently at maximum capacity. Your stake order will
          be queued and staked at a later date.
        </Attention>
      )}

      {/* Warning: Partial stake execution with remainder queued */}
      {currentTab === "stake" && (stakeVaultCapacity ?? 0) > 0 && isExceedingStakeVaultCapacity && (
        <Attention className="px-1.5 py-2 text-xs items-center rounded-lg">
          This amount is greater than the current sOADA capacity. Your stake
          order will be partially filled and the remainder will be added to the
          stake queue.
        </Attention>
      )}

      {/* Warning: Insufficient funds */}
      {parseInt(inputAmount) > availableAmount && (
        <Attention className="px-1.5 py-2 text-xs items-center rounded-lg">
          Your wallet has insufficient funds for this operation.
        </Attention>
      )}

      {/* Warning: Below minimum amount */}
      {parseInt(inputAmount) < minimum && (
        <Attention className="px-1.5 py-2 text-xs items-center rounded-lg">
          This amount is less than minimum allowed value of {minimum}.
        </Attention>
      )}
    </div>
  );
};
