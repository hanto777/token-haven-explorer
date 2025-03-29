
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock, Tag, User, ArrowRight } from "lucide-react";
import { AuctionSummary } from "@/hooks/use-all-auctions";
import { useAuctionDetails } from "@/hooks/use-auction";
import { motion } from "framer-motion";

interface AuctionCardProps {
  auction: AuctionSummary;
}

const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
  const navigate = useNavigate();
  const shortAddress = `${auction.address.slice(
    0,
    6
  )}...${auction.address.slice(-4)}`;
  const {
    hasAuctionStarted,
    startAt,
    expiresAt,
    startPrice,
    reservePrice,
  } = useAuctionDetails(auction.address);

  // Format price values to be more readable
  const formattedStartPrice = startPrice ? (startPrice / 10**18).toFixed(4) : '0';
  const formattedReservePrice = reservePrice ? (reservePrice / 10**18).toFixed(4) : '0';

  // Format dates for better display
  const formatDate = (timestamp: number) => {
    if (!timestamp) return "Loading...";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate time remaining
  const calculateTimeRemaining = () => {
    if (!expiresAt) return "Loading...";
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = expiresAt - now;
    
    if (timeLeft <= 0) return "Ended";
    
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    
    return `${hours}h ${minutes}m left`;
  };

  return (
    <Card className="h-full overflow-hidden border shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/50">
      <CardContent className="pt-6 pb-2">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col">
            <span className="text-lg font-medium">Dutch Auction</span>
            <div className="flex items-center text-sm text-muted-foreground">
              <Tag className="h-3.5 w-3.5 mr-1" />
              {shortAddress}
            </div>
          </div>
          {auction.isUserAuction && (
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center">
              <User className="h-3 w-3 mr-1" />
              Your Auction
            </div>
          )}
        </div>

        <div className="space-y-2 mt-4">
          <div className="flex items-center text-sm bg-primary/5 p-2 rounded-md">
            <Clock className="h-4 w-4 mr-2 text-primary" />
            <span className={hasAuctionStarted ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
              {hasAuctionStarted ? calculateTimeRemaining() : "Not yet started"}
            </span>
          </div>

          <div className="mt-4 space-y-3 p-2 bg-muted/30 rounded-md">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Starting Price:</span>
              <span className="font-medium">{formattedStartPrice} ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reserve Price:</span>
              <span className="font-medium">{formattedReservePrice} ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Starts At:</span>
              <span className="font-medium">{formatDate(startAt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expires At:</span>
              <span className="font-medium">{formatDate(expiresAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/20 pt-3">
        <Button
          variant="default"
          className="w-full group"
          onClick={() => navigate(`/auction?address=${auction.address}`)}
        >
          <span className="flex items-center gap-2">
            View Auction 
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuctionCard;
