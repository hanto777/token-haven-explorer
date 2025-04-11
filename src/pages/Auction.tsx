
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PageTransition from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import BidHistory from "@/components/auction/BidHistory";
import BidForm from "@/components/auction/BidForm";
import AuctionStatus from "@/components/auction/AuctionStatus";
import TokenInfo from "@/components/auction/TokenInfo";
import PriceChart from "@/components/auction/PriceChart";
import AuctionControls from "@/components/auction/AuctionControls";
import TokenSupplyChart from "@/components/auction/TokenSupplyChart";
import { useAuction } from "@/hooks/use-auction";
import { useAccount } from "wagmi";
import { ArrowLeftIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useNetwork } from "@/hooks/useNetwork";
import WrongNetworkMessage from "@/components/auction/WrongNetworkMessage";

interface RouteParams {
  id: string;
}

const Auction = () => {
  const [selectedTab, setSelectedTab] = useState("bid");
  const { address } = useAccount();
  const { isSepoliaChain, switchToSepolia } = useNetwork();
  
  // Mock data for demo
  const auctionState = {
    isLoaded: true,
    isLoading: false,
    error: null,
    isStarted: true,
    isEnded: false,
    isFinalized: false,
    isAuctioneer: false,
    totalTokensForSale: "1000000",
    totalCollectedPaymentTokens: "520",
    remainingTokensForSale: "300000",
    tokenAddress: "0x123...abc",
    paymentTokenAddress: "0xdef...456",
    minimumPrice: "0.05",
    tokenName: "Demo Token",
    tokenSymbol: "DEMO",
    paymentTokenName: "Test USD",
    paymentTokenSymbol: "TUSD",
    startTime: Math.floor(Date.now() / 1000) - 86400 * 2,
    endTime: Math.floor(Date.now() / 1000) + 86400 * 3,
    address: "0x789...def",
  };
  
  // Mock data for demo
  const userBidsState = {
    isLoaded: true,
    isLoading: false,
    userBids: [
      {
        id: "1",
        amount: "100",
        price: "0.1",
        timestamp: Date.now() - 1000 * 60 * 60,
        value: 10,
      },
      {
        id: "2",
        amount: "200",
        price: "0.12",
        timestamp: Date.now() - 1000 * 60 * 30,
        value: 24,
      },
    ],
  };
  
  // We can make a complete mockup for demo purposes
  const demoAuction = {
    ...auctionState,
    ...userBidsState,
    isOwnerViewingAuction: Math.random() > 0.5,
    userHasBids: true,
    bidCount: 37,
    highestBid: "0.25",
    lowestBid: "0.07",
    averageBid: "0.15",
    tokenPrice: "0.18",
    yourTokensAtCurrentPrice: "133.33",
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="flex items-center mb-8">
          <Link to="/auctions" className="flex items-center text-sm text-muted-foreground hover:text-primary mr-4">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Auctions
          </Link>
          <h1 className="text-2xl font-semibold">
            {demoAuction.tokenName} ({demoAuction.tokenSymbol}) Auction
          </h1>
        </div>

        {!isSepoliaChain && (
          <WrongNetworkMessage 
            onSwitch={switchToSepolia} 
            expectedNetwork="Sepolia Testnet" 
          />
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Price Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <PriceChart data={[]} />
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Token Supply</CardTitle>
                </CardHeader>
                <CardContent>
                  <TokenSupplyChart 
                    totalSupply={Number(demoAuction.totalTokensForSale)} 
                    remainingSupply={Number(demoAuction.remainingTokensForSale)} 
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Token Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <TokenInfo 
                    tokenSymbol={demoAuction.tokenSymbol}
                    tokenAddress={demoAuction.tokenAddress}
                    paymentTokenSymbol={demoAuction.paymentTokenSymbol}
                    paymentTokenAddress={demoAuction.paymentTokenAddress}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="space-y-6">
            <AuctionStatus 
              startTime={demoAuction.startTime}
              endTime={demoAuction.endTime}
              isStarted={demoAuction.isStarted}
              isEnded={demoAuction.isEnded}
              isFinalized={demoAuction.isFinalized}
            />
            
            {demoAuction.isStarted && !demoAuction.isEnded && (
              <BidForm />
            )}
            
            {demoAuction.isOwnerViewingAuction && demoAuction.isEnded && !demoAuction.isFinalized && (
              <AuctionControls />
            )}
            
            <BidHistory bids={[]} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Auction;
