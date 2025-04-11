
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useChainId, useSwitchChain } from "wagmi";
import { sepolia } from "wagmi/chains";
import { toast } from "sonner";

interface NetworkContextType {
  isMainnet: boolean;
  isTestnet: boolean;
  isSepoliaChain: boolean;
  chainName: string;
  networkColor: string;
  switchToSepolia: () => Promise<void>;
  // To fix build errors in other components, add these properties
  currentChain?: string;
  switchNetwork?: (chainId: number) => Promise<void>;
  supportedNetworks?: { id: number; name: string }[];
}

const NetworkContext = createContext<NetworkContextType>({
  isMainnet: false,
  isTestnet: false,
  isSepoliaChain: false,
  chainName: "",
  networkColor: "",
  switchToSepolia: async () => {}
});

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const [networkState, setNetworkState] = useState({
    isMainnet: false,
    isTestnet: false,
    isSepoliaChain: false,
    chainName: "Unknown",
    networkColor: "text-gray-500"
  });
  
  // Define supported networks to fix build errors in other components
  const supportedNetworks = [
    { id: 11155111, name: "Sepolia" },
    { id: 1, name: "Ethereum" },
    { id: 80001, name: "Mumbai" },
    { id: 137, name: "Polygon" }
  ];
  
  useEffect(() => {
    let isMainnet = false;
    let isTestnet = false;
    let isSepoliaChain = false;
    let chainName = "Unknown";
    let networkColor = "text-gray-500";
    
    // Determine network type based on chainId
    switch (chainId) {
      case 1: // Ethereum Mainnet
        isMainnet = true;
        chainName = "Ethereum";
        networkColor = "text-blue-500";
        break;
      case 11155111: // Sepolia
        isTestnet = true;
        isSepoliaChain = true;
        chainName = "Sepolia";
        networkColor = "text-purple-500";
        break;
      case 80001: // Mumbai
        isTestnet = true;
        chainName = "Mumbai";
        networkColor = "text-pink-500";
        break;
      case 137: // Polygon
        isMainnet = true;
        chainName = "Polygon";
        networkColor = "text-purple-500";
        break;
      case 10: // Optimism
        isMainnet = true;
        chainName = "Optimism";
        networkColor = "text-red-500";
        break;
      case 8453: // Base
        isMainnet = true;
        chainName = "Base";
        networkColor = "text-blue-400";
        break;
      case 42161: // Arbitrum
        isMainnet = true;
        chainName = "Arbitrum";
        networkColor = "text-blue-600";
        break;
      default:
        // Unknown chain
        chainName = `Chain ${chainId}`;
        networkColor = "text-gray-500";
    }
    
    setNetworkState({
      isMainnet,
      isTestnet,
      isSepoliaChain,
      chainName,
      networkColor
    });
  }, [chainId]);
  
  const switchToSepolia = async () => {
    try {
      await switchChain({ chainId: sepolia.id });
      toast.success("Network switched to Sepolia");
    } catch (error) {
      console.error("Failed to switch network:", error);
      toast.error("Failed to switch network", {
        description: "Please try switching networks manually in your wallet"
      });
    }
  };
  
  // Function to switch to any network - to fix build errors in other components
  const switchNetwork = async (chainId: number) => {
    try {
      await switchChain({ chainId });
      toast.success(`Network switched to ${supportedNetworks.find(n => n.id === chainId)?.name || 'new network'}`);
    } catch (error) {
      console.error("Failed to switch network:", error);
      toast.error("Failed to switch network", {
        description: "Please try switching networks manually in your wallet"
      });
    }
  };
  
  return (
    <NetworkContext.Provider value={{ 
      ...networkState, 
      switchToSepolia,
      // Add these properties to fix build errors in other components
      currentChain: chainName,
      switchNetwork,
      supportedNetworks
    }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
