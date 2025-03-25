/**
 * Epoch Stake Auction Bid Page
 * 
 * This component serves as the main container page for the Epoch Stake Auction bidding interface.
 * It renders a Card containing the BidForm component, along with appropriate page title and header.
 * 
 * The page handles two different modes:
 * 1. Creating a new bid (when no bidId is present in the URL)
 * 2. Viewing/managing an existing bid (when a bidId is provided in the URL)
 * 
 * The component uses React Router's useParams hook to extract the bidId from the URL,
 * if present, and passes it to the BidForm component.
 */

import { useParams } from "react-router-dom";
import { BidForm } from "./bid-form";
import { Card } from "src/components/ui/card";
import CustomTitle from "src/components/Title";

/**
 * EpochStakeAuctionBid Component
 * 
 * Container component for the stake auction bidding interface.
 * Extracts the bidId parameter from the URL and passes it to the BidForm.
 * 
 * @returns A page containing the BidForm within a Card layout
 */
export const EpochStakeAuctionBid = () => {
  // Extract bidId from URL parameters, if present
  const { bidId } = useParams();

  return (
    <div className="grid p-4 md:p-8 gap-6 justify-center">
      {/* Page title that appears in the browser tab */}
      <CustomTitle title="Epoch Stake Auction" />
      
      {/* Page header that changes based on whether viewing an existing bid or creating a new one */}
      <h1 className="text-ui-surface-default text-[32px] leading-10 font-normal text-center">
        {bidId ? "Your bid" : "Bid on Staking Rights"}
      </h1>
      
      {/* Card container for the BidForm with fixed width */}
      <Card className="w-[560px]">
        <BidForm bidId={bidId} />
      </Card>
    </div>
  );
};
