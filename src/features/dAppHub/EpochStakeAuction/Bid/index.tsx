import { useParams } from "react-router-dom";
import { BidForm } from "./bid-form";
import { Card } from "src/components/ui/card";
import CustomTitle from "src/components/Title";

export const EpochStakeAuctionBid = () => {
  const { bidId } = useParams();

  return (
    <div className="grid p-4 md:p-8 gap-6 justify-center">
      <CustomTitle title="Epoch Stake Auction" />
      <h1 className="text-ui-surface-default text-[32px] leading-10 font-normal text-center">
        {bidId ? "Your bid" : "Bid on Staking Rights"}
      </h1>
      <Card className="w-[560px]">
        <BidForm bidId={bidId} />
      </Card>
    </div>
  );
};
