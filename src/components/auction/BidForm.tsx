
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BidFormProps {
  isAuctionActive: boolean;
  currentTokenSupply: number;
  bidAmount: string;
  setBidAmount: (value: string) => void;
  placeBid: () => void;
  address?: string;
  currentPrice: number;
  tokenName: string;
}

const BidForm = ({
  isAuctionActive,
  currentTokenSupply,
  bidAmount,
  setBidAmount,
  placeBid,
  address,
  currentPrice,
  tokenName,
}: BidFormProps) => {
  const estimatedTokens = isNaN(parseFloat(bidAmount)) 
    ? 0 
    : Math.min(
        Math.floor((parseFloat(bidAmount) / currentPrice) * 10), 
        currentTokenSupply
      );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Place a Bid</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bid-amount">Bid Amount (ETH)</Label>
            <div className="flex space-x-2">
              <Input
                id="bid-amount"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Enter amount"
                disabled={!isAuctionActive || currentTokenSupply <= 0}
                min="0"
                step="0.01"
              />
              <Button 
                onClick={placeBid} 
                disabled={!isAuctionActive || !address || currentTokenSupply <= 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Place Bid
              </Button>
            </div>
            {isAuctionActive && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-500">
                  Bid at the current price of {currentPrice.toFixed(2)} ETH to win instantly
                </p>
                <p className="text-sm text-purple-600">
                  You will receive approximately {estimatedTokens} {tokenName} tokens
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BidForm;
