import { ReactNode, useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import { useAccount, useChainId } from 'wagmi';
import TokenContext from '@/contexts/TokenContext';
import { Token } from '@/types/tokenTypes';
import { getNativeToken, getDefaultTokens, getTokenPrice } from '@/utils/tokenUtils';

export const TokenProvider = ({ children }: { children: ReactNode }) => {
  const { isConnected } = useWallet();
  const { address } = useAccount();
  const chainId = useChainId();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (isConnected && address) {
      setIsLoading(true);
      
      // Get the native token based on current chain
      const nativeToken = getNativeToken(chainId);
      
      // Get other default tokens based on the current chain
      const otherTokens = getDefaultTokens(chainId);
      
      // Initialize tokens with default values, always putting native token first
      const initialTokens = [
        { ...nativeToken, balance: '0', value: 0, change24h: 0 },
        ...otherTokens.map(token => ({
          ...token,
          balance: '0',
          value: 0,
          change24h: 0
        }))
      ];
      
      setTokens(initialTokens);
      
      // Start fetching real balances for each token
      fetchTokenBalances(address, chainId);
    } else {
      setTokens([]);
      setIsLoading(false);
    }
  }, [isConnected, address, chainId]);

  // Function to fetch real balances for all tokens
  const fetchTokenBalances = async (walletAddress: string, currentChainId: number) => {
    try {
      // Get the native token based on current chain
      const nativeToken = getNativeToken(currentChainId);
      
      // Get other default tokens based on the current chain
      const otherTokens = getDefaultTokens(currentChainId);

      // Generate random 24h changes for demo purposes
      const nativeChange24h = Math.random() * 10 - 5; // Random value between -5% and +5%
      
      // Create the native token with balance placeholder - real balance will be fetched by useTokenBalance in TokenCard
      const nativeTokenWithBalance = {
        ...nativeToken,
        balance: '0',
        value: 0,
        change24h: nativeChange24h
      };
      
      // Create other tokens with balance placeholders
      const otherTokensWithBalances = otherTokens.map(token => {
        const change24h = Math.random() * 10 - 5; // Random value between -5% and +5%
        return {
          ...token,
          balance: '0',
          value: 0,
          change24h
        };
      });
      
      // Combine native token and other tokens, always putting native token first
      const allTokens = [nativeTokenWithBalance, ...otherTokensWithBalances];
      
      setTokens(allTokens);
    } catch (error) {
      console.error("Error initializing tokens:", error);
      toast.error("Failed to load token data");
    } finally {
      setIsLoading(false);
    }
  };
  
  const decryptToken = (id: string) => {
    setTokens(prevTokens => prevTokens.map(token => {
      if (token.id === id && token.isEncrypted) {
        // For confidential tokens, we simulate decryption
        if (token.isConfidential) {
          toast.success("Confidential token balance decrypted", {
            description: "Your encrypted balance is now visible."
          });
          
          // Simulate a "decrypted" balance for the confidential token
          const decryptedBalance = (Math.random() * 1000).toFixed(2);
          const value = parseFloat(decryptedBalance) * getTokenPrice(token.symbol, chainId);
          
          return {
            ...token,
            isDecrypted: true,
            balance: decryptedBalance,
            value
          };
        }
        
        // For regular encrypted tokens (future feature)
        return {
          ...token,
          isDecrypted: true
        };
      }
      return token;
    }));
  };
  
  const sendToken = async (id: string, to: string, amount: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const token = tokens.find(t => t.id === id);
      if (!token) throw new Error("Token not found");
      
      // For this demo, we'll simulate the transfer success and UI update
      // In a real implementation with on-chain transfers, we would wait for 
      // the transaction confirmation instead of manually updating the UI

      toast.success("Transfer successful", {
        description: `Sent ${amount} ${token.symbol} to ${to.slice(0, 6)}...${to.slice(-4)}`
      });
      
      return true;
    } catch (error) {
      console.error("Transfer error:", error);
      toast.error("Transfer failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const value = {
    tokens,
    isLoading,
    decryptToken,
    sendToken
  };
  
  return (
    <TokenContext.Provider value={value}>
      {children}
    </TokenContext.Provider>
  );
};

export default TokenProvider;
