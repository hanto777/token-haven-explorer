// Update this page (the content is just a fallback if you fail to update the page)
import { useAccount, usePublicClient, useChainId } from "wagmi";

import { useEffect, useState } from "react";
import { createFhevmInstance } from "@/lib/fhevm/fhevmjs";
import { DevnetWagmi } from "@/components/confidential/DevnetWagmi";
import { mainnet, sepolia, polygon, optimism, arbitrum } from "wagmi/chains";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Fhevm = () => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const chainId = useChainId();

  // Add check for Sepolia chain
  const isSepoliaChain = chainId === sepolia.id;

  useEffect(() => {
    const initializeFhevm = async () => {
      try {
        if (isConnected && isSepoliaChain) {
          await createFhevmInstance();
          setLoading(false);
        } else {
          // Reset loading state when disconnected or wrong chain
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to initialize FHEVM:", error);
        setLoading(false);
      }
    };

    initializeFhevm();
  }, [isConnected, isSepoliaChain]);

  // If not on Sepolia, show switch chain message
  if (!isSepoliaChain) {
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <p>Loading FHEVM...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-2xl space-y-4 p-4">
        {address && <DevnetWagmi />}
      </div>
    </div>
  );
};

export default Fhevm;
