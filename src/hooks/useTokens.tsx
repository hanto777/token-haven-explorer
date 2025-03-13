
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import { useAccount, useReadContract } from 'wagmi';
import { useTokenBalance } from './useTokenBalance';

export interface Token {
  id: string;
  symbol: string;
  name: string;
  balance: string;
  value: number;
  change24h: number;
  isEncrypted: boolean;
  isDecrypted?: boolean;
  logo: string;
  address?: string;
  decimals?: number;
}

// Default tokens to check for
const DEFAULT_TOKENS = [
  {
    id: '1',
    symbol: 'ETH',
    name: 'Ethereum',
    address: 'native',
    isEncrypted: false,
    isDecrypted: false,
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  },
  {
    id: '2',
    symbol: 'MATIC',
    name: 'Polygon',
    address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', // Ethereum Mainnet MATIC
    isEncrypted: false,
    isDecrypted: false,
    logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  },
  {
    id: '3',
    symbol: 'LINK',
    name: 'Chainlink',
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', // Ethereum Mainnet LINK
    isEncrypted: false,
    isDecrypted: false,
    logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png',
  },
  {
    id: '4',
    symbol: 'PRIVATE',
    name: 'Private Token',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // This is WETH, just for demo
    isEncrypted: true,
    isDecrypted: false,
    logo: 'https://cryptologos.cc/logos/mask-network-mask-logo.png',
  },
  {
    id: '5',
    symbol: 'SECRET',
    name: 'Secret Token',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // This is UNI, just for demo
    isEncrypted: true,
    isDecrypted: false,
    logo: 'https://cryptologos.cc/logos/secret-scrt-logo.png',
  }
];

// Helper function to get a price for a token (in a real app, you'd use an API)
const getTokenPrice = (symbol: string): number => {
  const prices: Record<string, number> = {
    'ETH': 1940,
    'MATIC': 1.1,
    'LINK': 11.5,
    'WETH': 1940,
    'UNI': 9.8,
    'PRIVATE': 120,
    'SECRET': 45
  };
  
  return prices[symbol] || 1;
};

interface TokenContextType {
  tokens: Token[];
  isLoading: boolean;
  decryptToken: (id: string) => void;
  sendToken: (id: string, to: string, amount: string) => Promise<boolean>;
}

const TokenContext = createContext<TokenContextType>({
  tokens: [],
  isLoading: true,
  decryptToken: () => {},
  sendToken: async () => false,
});

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
        balance: token.isEncrypted ? '???' : '0',
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
    setTokens(prevTokens => 
      prevTokens.map(token => {
        if (token.id === id && token.isEncrypted) {
          // For encrypted tokens, now fetch their real balances
          const updatedToken = {
            ...token,
            isDecrypted: true
          };
          
          // If we're connected and have an address, fetch the real balance
          if (isConnected && address && token.address) {
            toast.success("Decrypting token balance...");
            // This will trigger a re-render which will fetch the real balance
            // in the useEffect hook
          }
          
          return updatedToken;
        }
        return token;
      })
    );
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

export const useTokens = () => useContext(TokenContext);
