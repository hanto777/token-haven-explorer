import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAccount, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";
import { createFhevmInstance } from "@/lib/fhevm/fhevmjs";
import { init } from "@/lib/fhevm/fhevmjs";
import { useWallet } from "@/hooks/useWallet";

interface FhevmContextType {
  loading: boolean;
  isSepoliaChain: boolean;
  isInitialized: boolean;
}

export const FhevmContext = createContext<FhevmContextType | undefined>(
  undefined
);

export function FhevmProvider({ children }: { children: ReactNode }) {
  const { isConnected } = useWallet();
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <p>Loading FHEVM...</p>
      </div>
    );
  }

  return (
    <FhevmContext.Provider value={{ loading, isSepoliaChain, isInitialized }}>
      {children}
    </FhevmContext.Provider>
  );
}

export function useFhevm() {
  const context = useContext(FhevmContext);
  if (context === undefined) {
    throw new Error("useFhevm must be used within a FhevmProvider");
  }
  return context;
}
