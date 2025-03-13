
import { ReactNode, useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import TokenContext from '@/contexts/TokenContext';
import { Token } from '@/types/tokenTypes';
import { DEFAULT_TOKENS } from '@/utils/tokenUtils';

export const TokenProvider = ({ children }: { children: ReactNode }) => {
  const { isConnected } = useWallet();
  const { address } = useAccount();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (isConnected && address) {
      setIsLoading(true);
      
      // Initialize tokens with default values
      const initialTokens = DEFAULT_TOKENS.map(token => ({
        ...token,
        balance: '0',
        value: 0,
        change24h: 0
      }));
      
      setTokens(initialTokens);
      
      // Start fetching real balances for each token
      fetchRealBalances(initialTokens, address);
    } else {
      setTokens([]);
      setIsLoading(false);
    }
  }, [isConnected, address]);
  
  // Function to fetch real balances for all tokens
  const fetchRealBalances = async (initialTokens: Token[], walletAddress: string) => {
    try {
      const updatedTokens = await Promise.all(
        initialTokens.map(async (token) => {
          // Skip encrypted tokens that haven't been decrypted
          if (token.isEncrypted && !token.isDecrypted) {
            return token;
          }
          
          try {
            if (token.address) {
              // Use our custom hook to fetch token balance
              const tokenBalance = useTokenBalance({
                address: walletAddress,
                tokenAddress: token.address,
                enabled: true
              });
              
              // Wait for the balance to load
              if (!tokenBalance.isLoading && !tokenBalance.error) {
                // Generate a random 24h change for demo purposes
                const change24h = Math.random() * 10 - 5; // Random value between -5% and +5%
                
                return {
                  ...token,
                  balance: tokenBalance.balance,
                  symbol: tokenBalance.symbol || token.symbol,
                  name: tokenBalance.name || token.name,
                  decimals: tokenBalance.decimals,
                  value: tokenBalance.value,
                  change24h
                };
              }
            }
          } catch (error) {
            console.error(`Error fetching balance for ${token.symbol}:`, error);
          }
          
          return token;
        })
      );
      
      setTokens(updatedTokens);
    } catch (error) {
      console.error("Error fetching token balances:", error);
      toast.error("Failed to load token balances");
    } finally {
      setIsLoading(false);
    }
  };
  
  const decryptToken = (id: string) => {
    console.log("No encrypted tokens to decrypt");
  };
  
  const sendToken = async (id: string, to: string, amount: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const token = tokens.find(t => t.id === id);
      if (!token) throw new Error("Token not found");
      
      if (parseFloat(amount) > parseFloat(token.balance)) {
        toast.error("Insufficient balance", {
          description: `You don't have enough ${token.symbol} to complete this transaction.`
        });
        return false;
      }
      
      // In a real implementation, this would call the token contract's transfer method
      // For now, we just simulate the transfer by updating the UI
      
      // Update the token balance
      setTokens(prevTokens => 
        prevTokens.map(t => {
          if (t.id === id) {
            const newBalance = (parseFloat(t.balance) - parseFloat(amount)).toFixed(2);
            return {
              ...t,
              balance: newBalance,
              value: parseFloat(newBalance) * (t.value / parseFloat(t.balance))
            };
          }
          return t;
        })
      );
      
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
