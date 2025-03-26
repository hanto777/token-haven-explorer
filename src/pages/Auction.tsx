
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Plus } from "lucide-react";
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
import { useAccount } from "wagmi";

export default function Auction() {
  const { isConnected } = useAccount();
  const { isSepoliaChain, switchToSepolia } = useNetwork();
  const navigate = useNavigate();
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
  const chartData = useAuctionChartData(startingPrice, reservePrice, initialTokens, remainingTokens, endTime);
  const { bids } = useBidsActivity();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dutch Auction</h1>
          <p className="text-muted-foreground">Bid on tokens with decreasing prices over time</p>
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
        <WrongNetworkMessage onSwitchNetwork={switchToSepolia} />
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
                formattedTimeRemaining={formattedTimeRemaining}
                isActive={isActive}
                isLoading={isLoading}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <PriceChart data={chartData.priceData} isLoading={isLoading} />
              <TokenSupplyChart data={chartData.supplyData} isLoading={isLoading} />
            </div>
          </div>
          
          <div className="space-y-6">
            <BidForm 
              currentPrice={currentPrice} 
              remainingTokens={remainingTokens}
              isActive={isActive}
              isLoading={isLoading}
            />
            
            <BidHistory bids={bids} isLoading={isLoading} />
            
            <AuctionControls 
              isActive={isActive} 
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
