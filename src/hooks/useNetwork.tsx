
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useConfig, useChainId, useSwitchChain, useAccount } from "wagmi";
import { mainnet, sepolia, polygon } from "wagmi/chains";
import { toast } from "sonner";

// Import Chain as a type specifically
import type { Chain } from "wagmi/chains";

export const SUPPORTED_CHAINS = [
  mainnet,
  sepolia,
  polygon,
];

interface NetworkContextType {
  currentChain: Chain | undefined;
  isSwitchingNetwork: boolean;
  switchNetwork: (chainId: number) => Promise<void>;
  supportedNetworks: Chain[];
  isSepoliaChain: boolean;
  switchToSepolia: () => Promise<boolean>;
  ensureSepolia: () => boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  currentChain: undefined,
  isSwitchingNetwork: false,
  switchNetwork: async () => {},
  supportedNetworks: SUPPORTED_CHAINS,
  isSepoliaChain: false,
  switchToSepolia: async () => false,
  ensureSepolia: () => false
});

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const config = useConfig();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending } = useSwitchChain();
  const [currentChain, setCurrentChain] = useState<Chain | undefined>(undefined);
  
  // We only want to support Ethereum, Sepolia testnet, and Polygon
  const supportedNetworks = SUPPORTED_CHAINS;
  
  // Check if current chain is Sepolia
  const isSepoliaChain = currentChain?.id === sepolia.id;
  
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
  }, [chainId, isConnected, config.chains, supportedNetworks]);
  
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
  
  // Function to switch to Sepolia
  const switchToSepolia = async (): Promise<boolean> => {
    if (isSepoliaChain) return true;
    
    try {
      await switchNetwork(sepolia.id);
      return true;
    } catch (error) {
      console.error("Failed to switch to Sepolia:", error);
      toast.error("This feature requires the Sepolia testnet");
      return false;
    }
  };
  
  // Function to ensure we're on Sepolia
  const ensureSepolia = (): boolean => {
    if (isSepoliaChain) return true;
    
    toast.error("This feature requires the Sepolia testnet", {
      action: {
        label: "Switch Network",
        onClick: () => switchToSepolia()
      }
    });
    
    return false;
  };
  
  const value = {
    currentChain,
    isSwitchingNetwork: isPending,
    switchNetwork,
    supportedNetworks,
    isSepoliaChain,
    switchToSepolia,
    ensureSepolia
  };
  
  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
