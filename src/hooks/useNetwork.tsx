
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useChains, useConfig, useSwitchChain } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { toast } from 'sonner';

interface NetworkContextType {
  currentChain: ReturnType<typeof useChains>[0] | undefined;
  supportedChains: ReturnType<typeof useChains>;
  switchToSepolia: () => Promise<boolean>;
}

const NetworkContext = createContext<NetworkContextType>({
  currentChain: undefined,
  supportedChains: [],
  switchToSepolia: async () => false,
});

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const chains = useChains();
  const config = useConfig();
  const [currentChain, setCurrentChain] = useState<ReturnType<typeof useChains>[0] | undefined>();
  const { switchChain } = useSwitchChain();
  
  // Get current chain
  useEffect(() => {
    if (chains.length > 0) {
      setCurrentChain(chains[0]);
    }
  }, [chains]);
  
  // Function to switch to Sepolia
  const switchToSepolia = async (): Promise<boolean> => {
    try {
      if (currentChain?.id === sepolia.id) {
        return true; // Already on Sepolia
      }
      
      await switchChain({ chainId: sepolia.id });
      toast.success(`Switched to ${sepolia.name}`);
      return true;
    } catch (error) {
      console.error('Failed to switch network:', error);
      toast.error('Failed to switch network. Please try manually in your wallet.');
      return false;
    }
  };
  
  const value = {
    currentChain,
    supportedChains: chains,
    switchToSepolia,
  };
  
  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
