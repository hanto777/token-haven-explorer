
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { toast } from 'sonner';

interface WalletContextType {
  isConnected: boolean;
  address: string | undefined;
  isReady: boolean;
  openConnectModal?: () => void;
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: undefined,
  isReady: false,
});

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { isConnected, address } = useAccount();
  const [isReady, setIsReady] = useState(false);
  const { openConnectModal } = useConnect();
  
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
    openConnectModal
  };
  
  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
