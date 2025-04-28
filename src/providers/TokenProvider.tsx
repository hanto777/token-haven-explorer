import { ReactNode, useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import { useAccount, useChainId } from 'wagmi';
import TokenContext from '@/providers/TokenContext';
import { useTokenStore } from '@/stores/useTokenStore';

export const TokenProvider = ({ children }: { children: ReactNode }) => {
  const { isConnected } = useWallet();
  const chainId = useChainId();
  const { initializeTokens, setIsLoading } = useTokenStore();

  useEffect(() => {
    if (isConnected) {
      setIsLoading(true);
      try {
        initializeTokens(chainId);
      } catch (error) {
        console.error('Error initializing tokens:', error);
        toast.error('Failed to load token data');
      } finally {
        setIsLoading(false);
      }
    }
  }, [isConnected, chainId, initializeTokens, setIsLoading]);

  return (
    <TokenContext.Provider
      value={{
        tokens: useTokenStore.getState().tokens,
        isLoading: useTokenStore.getState().isLoading,
        decryptToken: useTokenStore.getState().decryptToken,
        updateTokenBalance: useTokenStore.getState().updateTokenBalance,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};

export default TokenProvider;
