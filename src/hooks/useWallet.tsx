
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { toast } from 'sonner';

interface WalletContextType {
  isConnected: boolean;
  address: string | undefined;
  isReady: boolean;
  openConnectModal?: () => void;
  switchAccount?: () => void;
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: undefined,
  isReady: false,
});

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { isConnected, address } = useAccount();
  const [isReady, setIsReady] = useState(false);
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  
  // Create a function to open the connect modal
  const openConnectModal = async () => {
    try {
      // Find the first available connector (usually injected like MetaMask)
      const connector = connectors[0];
      if (connector) {
        await connectAsync({ connector });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  // Add function to switch accounts
  const switchAccount = async () => {
    try {
      // First disconnect the current account
      await disconnectAsync();
      
      // Short delay to ensure disconnect completes
      setTimeout(async () => {
        // Then reconnect - this will usually prompt the wallet to show account selection
        const connector = connectors[0];
        if (connector) {
          await connectAsync({ connector });
          toast.success('Please select an account in your wallet');
        }
      }, 500);
    } catch (error) {
      console.error('Failed to switch accounts:', error);
      toast.error('Failed to switch accounts');
    }
  };
  
  useEffect(() => {
    setIsReady(true);
  }, []);
  
  useEffect(() => {
    if (isConnected && address) {
      toast.success('Wallet connected', {
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    }
  }, [isConnected, address]);
  
  const value = {
    isConnected,
    address,
    isReady,
    openConnectModal,
    switchAccount
  };
  
  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
