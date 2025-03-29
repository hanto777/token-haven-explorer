
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, ArrowRight, Clock, Tag, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAllAuctions } from "@/hooks/use-all-auctions";
import { useAccount } from "wagmi";
import { useNetwork } from "@/hooks/useNetwork";
import AuctionCard from "@/components/auction/AuctionCard";
import WrongNetworkMessage from "@/components/auction/WrongNetworkMessage";
import { sepolia } from "wagmi/chains";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function AuctionMain() {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const { currentChain, switchToSepolia } = useNetwork();
  const chain = sepolia;
  const { activeAuctions, endedAuctions, myAuctions, isLoading, error } = useAllAuctions();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Reload the page after a short delay
    setTimeout(() => {
      window.location.reload();
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto pb-12"
        >
          <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium mb-4">
            Dutch Auction Platform
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Discover and Participate in Auctions
          </h1>
          <p className="text-muted-foreground text-lg mb-8 mx-auto max-w-2xl">
            Explore ongoing Dutch auctions with decreasing prices over time. Buy
            tokens at your desired price or create your own auction.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/deploy-auction")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" /> Create Auction
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Network Check */}
        {currentChain?.id !== chain.id && (
          <div className="mb-12">
            <WrongNetworkMessage onSwitchNetwork={switchToSepolia} />
          </div>
        )}

        {isConnected ? (
          <>
            <Tabs defaultValue="active" className="mt-8 mb-16" onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-6">
                <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
                  <TabsTrigger value="active">Active Auctions</TabsTrigger>
                  <TabsTrigger value="ended">Ended Auctions</TabsTrigger>
                  <TabsTrigger value="my">My Auctions</TabsTrigger>
                </TabsList>
                <Button
                  variant="ghost"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="hidden md:flex items-center gap-2"
                >
                  Back to top <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              <TabsContent value="active" className="mt-6">
                <h2 className="text-2xl font-bold mb-6">Active Auctions</h2>
                <Separator className="mb-8" />
                
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="h-[280px] animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                          <div className="h-10 bg-gray-200 rounded w-full"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12 bg-muted/50 rounded-lg border border-dashed">
                    <p className="text-red-500 mb-4">Failed to load auctions</p>
                    <Button variant="outline" onClick={handleRefresh}>
                      Try Again
                    </Button>
                  </div>
                ) : activeAuctions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center py-16 bg-muted/50 rounded-lg border border-dashed"
                  >
                    <div className="inline-flex items-center justify-center p-4 bg-background rounded-full mb-4">
                      <Tag className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">
                      No active auctions found
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Be the first to create an auction on the platform
                    </p>
                    <Button onClick={() => navigate("/deploy-auction")}>
                      Create Your First Auction
                    </Button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeAuctions.map((auction) => (
                      <motion.div
                        key={auction.address}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AuctionCard auction={auction} variant="active" />
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="ended" className="mt-6">
                <h2 className="text-2xl font-bold mb-6">Ended Auctions</h2>
                <Separator className="mb-8" />
                
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2].map((i) => (
                      <Card key={i} className="h-[280px] animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                          <div className="h-10 bg-gray-200 rounded w-full"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12 bg-muted/50 rounded-lg border border-dashed">
                    <p className="text-red-500 mb-4">Failed to load auctions</p>
                    <Button variant="outline" onClick={handleRefresh}>
                      Try Again
                    </Button>
                  </div>
                ) : endedAuctions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center py-16 bg-muted/50 rounded-lg border border-dashed"
                  >
                    <div className="inline-flex items-center justify-center p-4 bg-background rounded-full mb-4">
                      <Clock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">
                      No ended auctions yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      All current auctions are still active
                    </p>
                    <Button variant="outline" onClick={() => setActiveTab("active")}>
                      View Active Auctions
                    </Button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {endedAuctions.map((auction) => (
                      <motion.div
                        key={auction.address}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AuctionCard auction={auction} variant="ended" />
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="my" className="mt-6">
                <h2 className="text-2xl font-bold mb-6">My Auctions</h2>
                <Separator className="mb-8" />
                
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2].map((i) => (
                      <Card key={i} className="h-[280px] animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                          <div className="h-10 bg-gray-200 rounded w-full"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12 bg-muted/50 rounded-lg border border-dashed">
                    <p className="text-red-500 mb-4">Failed to load auctions</p>
                    <Button variant="outline" onClick={handleRefresh}>
                      Try Again
                    </Button>
                  </div>
                ) : myAuctions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center py-16 bg-muted/50 rounded-lg border border-dashed"
                  >
                    <div className="inline-flex items-center justify-center p-4 bg-background rounded-full mb-4">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">
                      You haven't created any auctions yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first auction to see it here
                    </p>
                    <Button onClick={() => navigate("/deploy-auction")}>
                      Create Your First Auction
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myAuctions.map((auction) => (
                        <motion.div
                          key={auction.address}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <AuctionCard auction={auction} variant="owned" />
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-8 text-center">
                      <Button
                        onClick={() => navigate("/deploy-auction")}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create Another Auction
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-muted/50 rounded-lg border border-dashed mt-12"
          >
            <div className="inline-flex items-center justify-center p-4 bg-background rounded-full mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">
              Connect Wallet to View Auctions
            </h3>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to browse and participate in auctions
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
