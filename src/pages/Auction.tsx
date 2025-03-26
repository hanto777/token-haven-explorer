
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Plus, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useNetwork } from "@/hooks/useNetwork";
import { useAccount } from "wagmi";

import TokenInfo from "@/components/auction/TokenInfo";
import AuctionStatus from "@/components/auction/AuctionStatus";
import PriceChart from "@/components/auction/PriceChart";
import TokenSupplyChart from "@/components/auction/TokenSupplyChart";
import BidForm from "@/components/auction/BidForm";
import BidHistory from "@/components/auction/BidHistory";
import AuctionControls from "@/components/auction/AuctionControls";
import WrongNetworkMessage from "@/components/auction/WrongNetworkMessage";

import { useAuctionChartData } from "@/hooks/useAuctionChartData";
import { useAuctionTimer } from "@/hooks/useAuctionTimer";
import { useBidsActivity } from "@/hooks/use-bids-activity";
import { useAuction } from "@/hooks/use-auction";

export default function Auction() {
  const { isConnected } = useAccount();
  const { isSepoliaChain, switchToSepolia } = useNetwork();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const auctionAddress = queryParams.get("address");
  
  const { 
    currentPrice, 
    startingPrice, 
    reservePrice, 
    initialTokens, 
    remainingTokens,
    endTime,
    isActive,
    isLoading
  } = useAuction();
  
  const { timeRemaining, formattedTimeRemaining } = useAuctionTimer(endTime, isActive);
  const chartData = useAuctionChartData();
  const { bids } = useBidsActivity();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2" 
            onClick={() => navigate("/auctions")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Auctions
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold">Dutch Auction</h1>
            <p className="text-muted-foreground">
              {auctionAddress 
                ? `Auction ${auctionAddress.slice(0, 6)}...${auctionAddress.slice(-4)}`
                : "Bid on tokens with decreasing prices over time"}
            </p>
          </div>
        </div>
        
        {isConnected && isSepoliaChain && (
          <Button 
            className="mt-4 sm:mt-0"
            onClick={() => navigate("/deploy-auction")}
          >
            <Plus className="mr-2 h-4 w-4" /> Create New Auction
          </Button>
        )}
      </div>

      {!isSepoliaChain && (
        <WrongNetworkMessage onSwitchNetwork={() => switchToSepolia()} />
      )}

      {isSepoliaChain && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TokenInfo 
                initialSupply={initialTokens} 
                remainingSupply={remainingTokens} 
                isLoading={isLoading}
              />
              
              <AuctionStatus 
                currentPrice={currentPrice} 
                timeRemaining={timeRemaining}
                formatTimeRemaining={() => formattedTimeRemaining}
                isActive={isActive}
                isLoading={isLoading}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <PriceChart data={chartData.priceChartData} />
              <TokenSupplyChart data={chartData.tokenChartData} />
            </div>
          </div>
          
          <div className="space-y-6">
            <BidForm 
              currentPrice={currentPrice} 
              isActive={isActive}
              isLoading={isLoading}
            />
            
            <BidHistory bids={bids} />
            
            <AuctionControls />
          </div>
        </div>
      )}
    </div>
  );
}
