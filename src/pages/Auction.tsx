
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAccount, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";
import { Gavel, Clock, ArrowDown, Info, Trophy, Timer, Coins } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

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
  const [bids, setBids] = useState<Array<{address: string, amount: string, timestamp: Date, tokens: number}>>([]);
  const [isAuctionActive, setIsAuctionActive] = useState<boolean>(true);
  
  // Token data
  const [initialTokenSupply, setInitialTokenSupply] = useState<number>(1000);
  const [currentTokenSupply, setCurrentTokenSupply] = useState<number>(1000);
  const [tokenName, setTokenName] = useState<string>("CRYPTO");
  
  // Chart data
  const [priceChartData, setPriceChartData] = useState<Array<{time: string, price: number}>>([]);
  const [tokenChartData, setTokenChartData] = useState<Array<{time: string, tokens: number}>>([]);

  // Generate initial chart data
  useEffect(() => {
    const generateChartData = () => {
      const priceData = [];
      const tokenData = [];
      
      // Generate data points for the entire auction duration
      for (let hour = 0; hour <= duration; hour++) {
        const elapsedRatio = hour / duration;
        const price = startPrice - (startPrice - endPrice) * elapsedRatio;
        const time = `${hour}h`;
        
        priceData.push({ time, price: Math.max(endPrice, price) });
        
        // For token chart, we'll just use a linear decrease for now as a placeholder
        // In a real application, this would be based on actual token sales
        tokenData.push({ time, tokens: initialTokenSupply - (initialTokenSupply * 0.1 * elapsedRatio) });
      }
      
      setPriceChartData(priceData);
      setTokenChartData(tokenData);
    };
    
    generateChartData();
  }, [startPrice, endPrice, duration, initialTokenSupply]);

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
    setTimeRemaining(duration * 60 * 60);
    setCurrentPrice(startPrice);
    setCurrentTokenSupply(initialTokenSupply);
    setBids([]);
    setIsAuctionActive(true);
    
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
    
    setPriceChartData(priceData);
    setTokenChartData(tokenData);
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
            {/* Token Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Token Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <Coins className="h-8 w-8 text-purple-500 mb-2" />
                    <h4 className="text-sm text-gray-500">Token Name</h4>
                    <p className="text-xl font-bold">{tokenName}</p>
                  </div>
                  
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm text-gray-500">Initial Supply</h4>
                    <p className="text-xl font-bold">{initialTokenSupply.toLocaleString()} {tokenName}</p>
                  </div>
                  
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm text-gray-500">Remaining Supply</h4>
                    <p className="text-xl font-bold">{currentTokenSupply.toLocaleString()} {tokenName}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div 
                        className="bg-purple-600 h-2.5 rounded-full" 
                        style={{ width: `${(currentTokenSupply / initialTokenSupply) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          
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
            
            {/* Price Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Price Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ChartContainer 
                    config={{
                      price: { color: "#9333ea" }
                    }}
                  >
                    <LineChart data={priceChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis 
                        domain={[0, 'dataMax + 10']}
                        tickFormatter={(value) => `${value} ETH`}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-2 border rounded shadow-md">
                                <p className="text-sm">{`Time: ${payload[0].payload.time}`}</p>
                                <p className="text-sm font-semibold">{`Price: ${payload[0].value} ETH`}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#9333ea" 
                        strokeWidth={2} 
                        name="Price (ETH)" 
                        dot={false}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Token Supply Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Token Supply Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ChartContainer 
                    config={{
                      tokens: { color: "#4f46e5" }
                    }}
                  >
                    <AreaChart data={tokenChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis 
                        domain={[0, initialTokenSupply * 1.1]}
                        tickFormatter={(value) => `${value} ${tokenName}`}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-2 border rounded shadow-md">
                                <p className="text-sm">{`Time: ${payload[0].payload.time}`}</p>
                                <p className="text-sm font-semibold">{`Tokens: ${payload[0].value} ${tokenName}`}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="tokens" 
                        stroke="#4f46e5" 
                        fill="#4f46e5" 
                        fillOpacity={0.3} 
                        name={`Available ${tokenName}`}
                      />
                    </AreaChart>
                  </ChartContainer>
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
                          You will receive approximately {
                            isNaN(parseFloat(bidAmount)) ? 0 : 
                            Math.min(
                              Math.floor((parseFloat(bidAmount) / currentPrice) * 10), 
                              currentTokenSupply
                            )
                          } {tokenName} tokens
                        </p>
                      </div>
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
                        <TableHead>Tokens</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bids.map((bid, index) => (
                        <TableRow key={index}>
                          <TableCell>{bid.address}</TableCell>
                          <TableCell>{bid.amount}</TableCell>
                          <TableCell>{bid.tokens} {tokenName}</TableCell>
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
                <div className="space-y-6">
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="initial-supply">Initial Token Supply</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          id="initial-supply"
                          value={[initialTokenSupply]}
                          min={100}
                          max={10000}
                          step={100}
                          onValueChange={(values) => {
                            setInitialTokenSupply(values[0]);
                            if (!isAuctionActive) {
                              setCurrentTokenSupply(values[0]);
                            }
                          }}
                          disabled={isAuctionActive}
                        />
                        <span className="w-20 text-center">{initialTokenSupply}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="token-name">Token Name</Label>
                      <Input
                        id="token-name"
                        value={tokenName}
                        onChange={(e) => setTokenName(e.target.value)}
                        placeholder="Token Name"
                        disabled={isAuctionActive}
                        maxLength={10}
                      />
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
