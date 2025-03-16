import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";
import { createFhevmInstance } from "@/lib/fhevm/fhevmjs";
import { init } from "@/lib/fhevm/fhevmjs";

export const useFhevm = () => {
  const { isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const chainId = useChainId();
  const isSepoliaChain = chainId === sepolia.id;

  useEffect(() => {
    const initialize = async () => {
      try {
        await init();
        setIsInitialized(true);

        if (isConnected && isSepoliaChain) {
          await createFhevmInstance();
        }
      } catch (error) {
        console.error("Failed to initialize FHEVM:", error);
        setIsInitialized(false);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [isConnected, isSepoliaChain]);

  return {
    loading,
    isSepoliaChain,
    isInitialized,
  };
};
