
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAccount, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";
import { Gavel } from "lucide-react";

// Import components
import TokenInfo from "@/components/auction/TokenInfo";
import AuctionStatus from "@/components/auction/AuctionStatus";
import PriceChart from "@/components/auction/PriceChart";
import TokenSupplyChart from "@/components/auction/TokenSupplyChart";
import BidForm from "@/components/auction/BidForm";
import BidHistory from "@/components/auction/BidHistory";
import AuctionControls from "@/components/auction/AuctionControls";
import WrongNetworkMessage from "@/components/auction/WrongNetworkMessage";

// Import hooks
import { useAuctionTimer } from "@/hooks/useAuctionTimer";
import { useAuctionChartData } from "@/hooks/useAuctionChartData";

interface Bid {
  address: string;
  amount: string;
  timestamp: Date;
  tokens: number;
}

const Auction = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const isOnSepolia = chainId === sepolia.id;

  // Dutch auction state
  const [startPrice, setStartPrice] = useState<number>(100);
  const [endPrice, setEndPrice] = useState<number>(10);
  const [duration, setDuration] = useState<number>(24); // hours
  const [bidAmount, setBidAmount] = useState<string>("0");
  const [bids, setBids] = useState<Bid[]>([]);
  const [isAuctionActive, setIsAuctionActive] = useState<boolean>(true);
  
  // Token data
  const [initialTokenSupply, setInitialTokenSupply] = useState<number>(1000);
  const [currentTokenSupply, setCurrentTokenSupply] = useState<number>(1000);
  const [tokenName, setTokenName] = useState<string>("CRYPTO");
  
  // Use custom hooks
  const { timeRemaining, currentPrice, formatTimeRemaining } = useAuctionTimer({
    isAuctionActive,
    initialDuration: duration,
    startPrice,
    endPrice
  });

  const { priceChartData, tokenChartData, setTokenChartData } = useAuctionChartData({
    startPrice,
    endPrice,
    duration,
    initialTokenSupply
  });

  // Place a bid
  const placeBid = () => {
    if (!isAuctionActive || !address) return;

    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue <= 0) return;

    // Calculate how many tokens this bid would buy at current price
    const tokensAmount = Math.min(Math.floor(bidValue / currentPrice * 10), currentTokenSupply);
    
    if (tokensAmount <= 0) {
      return; // Not enough to buy any tokens
    }

    const newBid = {
      address: address.slice(0, 6) + "..." + address.slice(-4),
      amount: bidAmount,
      timestamp: new Date(),
      tokens: tokensAmount
    };

    // Update token supply
    setCurrentTokenSupply(prev => Math.max(0, prev - tokensAmount));
    
    // Update bids list
    setBids([newBid, ...bids]);
    setBidAmount("0");
    
    // Update token chart with latest data
    const newTime = formatTimeRemaining(timeRemaining);
    setTokenChartData([...tokenChartData, { 
      time: newTime, 
      tokens: currentTokenSupply - tokensAmount 
    }]);

    // If bid is placed at or above the current price, end the auction
    if (bidValue >= currentPrice) {
      setIsAuctionActive(false);
    }
    
    // If no tokens left, end the auction
    if (currentTokenSupply - tokensAmount <= 0) {
      setIsAuctionActive(false);
    }
  };

  // Reset auction
  const resetAuction = () => {
    const totalDuration = duration * 60 * 60;
    setIsAuctionActive(true);
    setCurrentTokenSupply(initialTokenSupply);
    setBids([]);
    
    // Reset chart data
    const priceData = [];
    const tokenData = [];
    
    for (let hour = 0; hour <= duration; hour++) {
      const elapsedRatio = hour / duration;
      const price = startPrice - (startPrice - endPrice) * elapsedRatio;
      const time = `${hour}h`;
      
      priceData.push({ time, price: Math.max(endPrice, price) });
      tokenData.push({ time, tokens: initialTokenSupply });
    }
    
    setTokenChartData(tokenData);
  };

  // If not on Sepolia, show switch chain message
  if (!isOnSepolia) {
    return <WrongNetworkMessage />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-8">
      <div className="w-full max-w-4xl space-y-6 p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Dutch Auction</CardTitle>
              <CardDescription>Token auction with decreasing price over time</CardDescription>
            </div>
            <Gavel className="h-8 w-8 text-purple-500" />
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Token Information */}
            <TokenInfo
              tokenName={tokenName}
              initialTokenSupply={initialTokenSupply}
              currentTokenSupply={currentTokenSupply}
            />
          
            {/* Auction Status */}
            <AuctionStatus 
              currentPrice={currentPrice}
              timeRemaining={timeRemaining}
              isAuctionActive={isAuctionActive}
              formatTimeRemaining={formatTimeRemaining}
            />
            
            {/* Price Chart */}
            <PriceChart data={priceChartData} />
            
            {/* Token Supply Chart */}
            <TokenSupplyChart 
              data={tokenChartData} 
              tokenName={tokenName}
              initialTokenSupply={initialTokenSupply}
            />
            
            {/* Bid Section */}
            <BidForm
              isAuctionActive={isAuctionActive}
              currentTokenSupply={currentTokenSupply}
              bidAmount={bidAmount}
              setBidAmount={setBidAmount}
              placeBid={placeBid}
              address={address}
              currentPrice={currentPrice}
              tokenName={tokenName}
            />
            
            {/* Recent Bids */}
            <BidHistory bids={bids} tokenName={tokenName} />
            
            {/* Admin Controls */}
            <AuctionControls
              isAuctionActive={isAuctionActive}
              startPrice={startPrice}
              setStartPrice={setStartPrice}
              endPrice={endPrice}
              setEndPrice={setEndPrice}
              duration={duration}
              setDuration={setDuration}
              initialTokenSupply={initialTokenSupply}
              setInitialTokenSupply={setInitialTokenSupply}
              tokenName={tokenName}
              setTokenName={setTokenName}
              resetAuction={resetAuction}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auction;
