
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAccount, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";
import { Gavel, Clock, ArrowDown, Info, Trophy, Timer } from "lucide-react";

const Auction = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const isOnSepolia = chainId === sepolia.id;

  // Dutch auction state
  const [startPrice, setStartPrice] = useState<number>(100);
  const [endPrice, setEndPrice] = useState<number>(10);
  const [duration, setDuration] = useState<number>(24); // hours
  const [currentPrice, setCurrentPrice] = useState<number>(100);
  const [timeRemaining, setTimeRemaining] = useState<number>(24 * 60 * 60); // seconds
  const [bidAmount, setBidAmount] = useState<string>("0");
  const [bids, setBids] = useState<Array<{address: string, amount: string, timestamp: Date}>>([]);
  const [isAuctionActive, setIsAuctionActive] = useState<boolean>(true);

  // Mock auction timer
  useEffect(() => {
    if (!isAuctionActive) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setIsAuctionActive(false);
          return 0;
        }
        return prev - 1;
      });

      // Calculate current price based on time elapsed
      const elapsedRatio = 1 - (timeRemaining / (duration * 60 * 60));
      const newPrice = startPrice - (startPrice - endPrice) * elapsedRatio;
      setCurrentPrice(Math.max(endPrice, newPrice));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, startPrice, endPrice, duration, isAuctionActive]);

  // Format time remaining in HH:MM:SS
  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Place a bid
  const placeBid = () => {
    if (!isAuctionActive || !address) return;

    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue <= 0) return;

    const newBid = {
      address: address.slice(0, 6) + "..." + address.slice(-4),
      amount: bidAmount,
      timestamp: new Date()
    };

    setBids([newBid, ...bids]);
    setBidAmount("0");

    // If bid is placed at or above the current price, end the auction
    if (bidValue >= currentPrice) {
      setIsAuctionActive(false);
    }
  };

  // Reset auction
  const resetAuction = () => {
    setTimeRemaining(duration * 60 * 60);
    setCurrentPrice(startPrice);
    setBids([]);
    setIsAuctionActive(true);
  };

  // If not on Sepolia, show switch chain message
  if (!isOnSepolia) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="w-full max-w-2xl space-y-4 p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Wrong Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p>This application only works on Sepolia testnet.</p>
                <p>Please switch your network to Sepolia to continue.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
            {/* Auction Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Current Price</p>
                    <p className="text-3xl font-bold text-purple-600">{currentPrice.toFixed(2)} ETH</p>
                    <div className="flex items-center justify-center mt-2 text-gray-500">
                      <ArrowDown className="h-4 w-4 mr-1" />
                      <span className="text-xs">Decreasing</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Time Remaining</p>
                    <p className="text-3xl font-bold text-blue-600">{formatTimeRemaining(timeRemaining)}</p>
                    <div className="flex items-center justify-center mt-2 text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-xs">Until end price</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Auction Status</p>
                    <p className={`text-xl font-bold ${isAuctionActive ? 'text-green-600' : 'text-red-600'}`}>
                      {isAuctionActive ? 'Active' : 'Ended'}
                    </p>
                    <div className="flex items-center justify-center mt-2 text-gray-500">
                      <Info className="h-4 w-4 mr-1" />
                      <span className="text-xs">
                        {isAuctionActive ? 'Place a bid to win' : 'Auction complete'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Auction Price Chart */}
            <Card>
              <CardContent className="pt-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Price Decline</h3>
                  <div className="h-12 bg-gray-100 rounded-md relative overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-blue-400"
                      style={{ 
                        width: `${100 - ((currentPrice - endPrice) / (startPrice - endPrice) * 100)}%`,
                        transition: 'width 1s linear'
                      }}
                    />
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between px-4">
                      <span className="text-sm font-medium text-white z-10">{startPrice} ETH</span>
                      <span className="text-sm font-medium text-gray-800 z-10">{endPrice} ETH</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Bid Section */}
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
                        disabled={!isAuctionActive}
                        min="0"
                        step="0.01"
                      />
                      <Button 
                        onClick={placeBid} 
                        disabled={!isAuctionActive || !address}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Place Bid
                      </Button>
                    </div>
                    {isAuctionActive && (
                      <p className="text-sm text-gray-500 mt-1">
                        Bid at the current price of {currentPrice.toFixed(2)} ETH to win instantly
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Bids */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Recent Bids</CardTitle>
              </CardHeader>
              <CardContent>
                {bids.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bidder</TableHead>
                        <TableHead>Amount (ETH)</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bids.map((bid, index) => (
                        <TableRow key={index}>
                          <TableCell>{bid.address}</TableCell>
                          <TableCell>{bid.amount}</TableCell>
                          <TableCell>{bid.timestamp.toLocaleTimeString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>No bids yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Admin Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Auction Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-price">Start Price (ETH)</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          id="start-price"
                          value={[startPrice]}
                          min={endPrice}
                          max={200}
                          step={1}
                          onValueChange={(values) => setStartPrice(values[0])}
                          disabled={isAuctionActive}
                        />
                        <span className="w-12 text-center">{startPrice}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="end-price">End Price (ETH)</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          id="end-price"
                          value={[endPrice]}
                          min={1}
                          max={startPrice}
                          step={1}
                          onValueChange={(values) => setEndPrice(values[0])}
                          disabled={isAuctionActive}
                        />
                        <span className="w-12 text-center">{endPrice}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (hours)</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          id="duration"
                          value={[duration]}
                          min={1}
                          max={72}
                          step={1}
                          onValueChange={(values) => setDuration(values[0])}
                          disabled={isAuctionActive}
                        />
                        <span className="w-12 text-center">{duration}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={resetAuction} 
                    variant="outline" 
                    className="w-full"
                    disabled={isAuctionActive}
                  >
                    <Timer className="mr-2 h-4 w-4" />
                    Reset Auction
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auction;
