import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useConfig, useChainId, useSwitchChain } from "wagmi";
import { mainnet, sepolia, polygon, optimism, arbitrum } from "wagmi/chains";
import { toast } from "sonner";

// Use type import for Chain
import type { Chain } from "wagmi";

export const SUPPORTED_CHAINS = [
  mainnet,
  sepolia,
  polygon,
  optimism,
  arbitrum,
];

interface NetworkContextType {
  currentChain: Chain | undefined;
  isSwitchingNetwork: boolean;
  switchNetwork: (chainId: number) => Promise<void>;
  supportedNetworks: Chain[];
}

const NetworkContext = createContext<NetworkContextType>({
  currentChain: undefined,
  isSwitchingNetwork: false,
  switchNetwork: async () => {},
  supportedNetworks: SUPPORTED_CHAINS,
});

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const config = useConfig();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending } = useSwitchChain();
  const [currentChain, setCurrentChain] = useState<Chain | undefined>(undefined);
  
  // We only want to support Ethereum, Sepolia testnet, and Polygon
  const supportedNetworks = SUPPORTED_CHAINS;
  
  useEffect(() => {
    if (isConnected && chainId) {
      const chain = config.chains.find(c => c.id === chainId);
      setCurrentChain(chain);
      
      // Check if connected to an unsupported network
      if (chain && !supportedNetworks.some(n => n.id === chain.id)) {
        toast.warning(`Network ${chain.name} is not fully supported`);
      }
    } else {
      setCurrentChain(undefined);
    }
  }, [chainId, isConnected, config.chains]);
  
  const switchNetwork = async (chainId: number) => {
    if (!isConnected) {
      toast.error("Connect your wallet first");
      return;
    }
    
    try {
      await switchChainAsync({ chainId });
      const newChain = config.chains.find(c => c.id === chainId);
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
  };
  
  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
