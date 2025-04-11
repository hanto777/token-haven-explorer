
import PageTransition from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useNetwork } from "@/hooks/useNetwork";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import WrongNetworkMessage from "@/components/auction/WrongNetworkMessage";

const AuctionMain = () => {
  const { address } = useAccount();
  const { currentChain, isSepoliaChain, switchToSepolia } = useNetwork();
  const [loading, setLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Modified to return Promise<void> instead of Promise<boolean>
  const handleSwitchNetwork = async () => {
    try {
      await switchToSepolia();
      return;  // Just return without a value for void
    } catch (error) {
      console.error("Failed to switch network:", error);
      return;  // Just return without a value for void
    }
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 text-center"
        >
          <span className="inline-block text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full mb-2">
            Auctions
          </span>
          <h1 className="text-4xl font-semibold tracking-tight mb-3">Confidential Auctions</h1>
          <p className="text-muted-foreground text-balance max-w-xl mx-auto">
            Participate in sealed-bid auctions for token offerings with FHE blockchain privacy.
          </p>
        </motion.div>

        {!isSepoliaChain && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <WrongNetworkMessage 
              onSwitch={handleSwitchNetwork}
              expectedNetwork="Sepolia Testnet" 
              message="Auctions are only available on Sepolia Testnet"
            />
          </motion.div>
        )}
        
        {isSepoliaChain && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-12"
          >
            <div className="flex justify-between mb-6 items-center">
              <h2 className="text-2xl font-semibold">Available Auctions</h2>
              <Link to="/deploy-auction">
                <Button>Create Auction</Button>
              </Link>
            </div>
            
            <Tabs defaultValue="live">
              <TabsList className="mb-6">
                <TabsTrigger value="live">Live Auctions</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="ended">Ended</TabsTrigger>
                <TabsTrigger value="my">My Auctions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="live">
                {/* Live auctions content */}
                <div className="text-center py-8">
                  <p>No live auctions available at the moment</p>
                </div>
              </TabsContent>
              
              <TabsContent value="upcoming">
                {/* Upcoming auctions content */}
                <div className="text-center py-8">
                  <p>No upcoming auctions scheduled</p>
                </div>
              </TabsContent>
              
              <TabsContent value="ended">
                {/* Ended auctions content */}
                <div className="text-center py-8">
                  <p>No ended auctions to display</p>
                </div>
              </TabsContent>
              
              <TabsContent value="my">
                {/* User's auctions content */}
                <div className="text-center py-8">
                  <p>You haven't participated in any auctions yet</p>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default AuctionMain;
