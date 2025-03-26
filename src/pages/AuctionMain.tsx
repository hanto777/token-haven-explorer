
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useAllAuctions } from "@/hooks/use-all-auctions";
import { useAccount } from "wagmi";
import { useNetwork } from "@/hooks/useNetwork";
import { Card, CardContent } from "@/components/ui/card";
import AuctionCard from "@/components/auction/AuctionCard";
import WrongNetworkMessage from "@/components/auction/WrongNetworkMessage";

export default function AuctionMain() {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const { currentChain } = useNetwork();
  const isSepoliaChain = currentChain?.id === 11155111; // Sepolia chain ID
  const { auctions, isLoading, error } = useAllAuctions();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const switchToSepolia = async () => {
    try {
      await window.ethereum?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID in hex
      });
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Reload the page after a short delay
    setTimeout(() => {
      window.location.reload();
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Auctions</h1>
          <p className="text-muted-foreground">View and interact with ongoing Dutch auctions</p>
        </div>
        
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          {isConnected && isSepoliaChain && (
            <Button 
              onClick={() => navigate("/deploy-auction")}
            >
              <Plus className="mr-2 h-4 w-4" /> Create Auction
            </Button>
          )}
        </div>
      </div>

      {!isSepoliaChain && isConnected && (
        <WrongNetworkMessage onSwitchNetwork={switchToSepolia} />
      )}

      {isConnected && isSepoliaChain && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-[200px] animate-pulse">
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
            <div className="text-center py-10">
              <p className="text-red-500 mb-4">Failed to load auctions</p>
              <Button variant="outline" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          ) : auctions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg mb-4">No active auctions found</p>
              <Button onClick={() => navigate("/deploy-auction")}>
                Create Your First Auction
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((auction) => (
                <AuctionCard key={auction.address} auction={auction} />
              ))}
            </div>
          )}
        </>
      )}

      {!isConnected && (
        <div className="text-center py-10">
          <p className="text-lg mb-4">Connect your wallet to view auctions</p>
        </div>
      )}
    </div>
  );
}
