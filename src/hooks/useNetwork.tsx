
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useConfig, useChainId, useSwitchChain, useAccount } from "wagmi";
import { toast } from "sonner";
import { SUPPORTED_CHAINS } from "@/config/constants";

// Import Chain as a type specifically
import type { Chain } from "wagmi/chains";
import { sepolia } from "wagmi/chains";

interface NetworkContextType {
  currentChain: Chain | undefined;
  isSwitchingNetwork: boolean;
  switchNetwork: (chainId: number) => Promise<void>;
  supportedNetworks: Chain[];
  isSepoliaChain: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  currentChain: undefined,
  isSwitchingNetwork: false,
  switchNetwork: async () => {},
  supportedNetworks: SUPPORTED_CHAINS,
  isSepoliaChain: false,
});

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const config = useConfig();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending } = useSwitchChain();
  const [currentChain, setCurrentChain] = useState<Chain | undefined>(
    undefined
  );
  const [isSepoliaChain, setIsSepoliaChain] = useState(false);

  // We only want to support Ethereum, Sepolia testnet, and Polygon
  const supportedNetworks = SUPPORTED_CHAINS;

  useEffect(() => {
    if (isConnected && chainId) {
      const chain = config.chains.find((c) => c.id === chainId);
      setCurrentChain(chain);
      
      // Check if current chain is Sepolia
      setIsSepoliaChain(chainId === sepolia.id);

      // Check if connected to an unsupported network
      if (chain && !supportedNetworks.some((n) => n.id === chain.id)) {
        toast.warning(`Network ${chain.name} is not fully supported`);
      }
    } else {
      setCurrentChain(undefined);
      setIsSepoliaChain(false);
    }
  }, [chainId, isConnected, config.chains, supportedNetworks]);

  const switchNetwork = async (chainId: number) => {
    if (!isConnected) {
      toast.error("Connect your wallet first");
      return;
    }

    try {
      await switchChainAsync({ chainId });
      const newChain = config.chains.find((c) => c.id === chainId);
      if (newChain) {
        toast.success(`Switched to ${newChain.name}`);
      }
    } catch (error) {
      console.error("Failed to switch network:", error);
      toast.error("Failed to switch network");
    }
  };

  const value = {
    currentChain,
    isSwitchingNetwork: isPending,
    switchNetwork,
    supportedNetworks,
    isSepoliaChain,
  };

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
