
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import { useAccount, useBalance, useToken } from 'wagmi';
import { formatUnits } from 'viem';

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
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  },
  {
    id: '2',
    symbol: 'MATIC',
    name: 'Polygon',
    address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', // Ethereum Mainnet MATIC
    isEncrypted: false,
    logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  },
  {
    id: '3',
    symbol: 'LINK',
    name: 'Chainlink',
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', // Ethereum Mainnet LINK
    isEncrypted: false,
    logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png',
  },
  {
    id: '4',
    symbol: 'PRIVATE',
    name: 'Private Token',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // This is WETH, just for demo
    isEncrypted: true,
    logo: 'https://cryptologos.cc/logos/mask-network-mask-logo.png',
  },
  {
    id: '5',
    symbol: 'SECRET',
    name: 'Secret Token',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // This is UNI, just for demo
    isEncrypted: true,
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
      
      // For each token, we'll fetch its balance and details separately
      const fetchTokenBalances = async () => {
        try {
          const updatedTokens = await Promise.all(
            initialTokens.map(async (token) => {
              if (token.isEncrypted && !token.isDecrypted) {
                return token;
              }
              
              try {
                // For native token (ETH)
                if (token.address === 'native') {
                  const ethBalance = await fetchNativeBalance(address);
                  const price = getTokenPrice(token.symbol);
                  const value = parseFloat(ethBalance) * price;
                  
                  return {
                    ...token,
                    balance: ethBalance,
                    value,
                    change24h: Math.random() * 10 - 5, // Random change for demo
                  };
                } 
                // For ERC-20 tokens
                else if (token.address) {
                  const { tokenBalance, decimals, symbol, name } = await fetchTokenBalance(token.address, address);
                  const price = getTokenPrice(symbol);
                  const value = parseFloat(tokenBalance) * price;
                  
                  return {
                    ...token,
                    balance: tokenBalance,
                    symbol: symbol || token.symbol,
                    name: name || token.name,
                    decimals,
                    value,
                    change24h: Math.random() * 10 - 5, // Random change for demo
                  };
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
      
      fetchTokenBalances();
    } else {
      setTokens([]);
      setIsLoading(false);
    }
  }, [isConnected, address]);
  
  const fetchNativeBalance = async (walletAddress: string): Promise<string> => {
    try {
      // This is a placeholder - in a real app you would use wagmi's useBalance hook
      // For simplicity in this example, we're using a mock value
      // In production, you'd implement proper balance fetching
      return '0.01';
    } catch (error) {
      console.error('Error fetching native balance:', error);
      return '0';
    }
  };
  
  const fetchTokenBalance = async (tokenAddress: string, walletAddress: string): Promise<{ 
    tokenBalance: string;
    decimals: number;
    symbol: string;
    name: string;
  }> => {
    try {
      // This is a placeholder - in a real app you would use wagmi's hooks
      // For simplicity in this example, we're using mock values
      // In production, you'd implement proper token balance fetching
      const mockBalances: Record<string, string> = {
        '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0': '150.75', // MATIC
        '0x514910771AF9Ca656af840dff83E8264EcF986CA': '10.5',   // LINK
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': '0.5',    // WETH (PRIVATE)
        '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984': '25.0',   // UNI (SECRET)
      };
      
      return {
        tokenBalance: mockBalances[tokenAddress] || '0',
        decimals: 18,
        symbol: DEFAULT_TOKENS.find(t => t.address === tokenAddress)?.symbol || 'UNKNOWN',
        name: DEFAULT_TOKENS.find(t => t.address === tokenAddress)?.name || 'Unknown Token'
      };
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return {
        tokenBalance: '0',
        decimals: 18,
        symbol: 'UNKNOWN',
        name: 'Unknown Token'
      };
    }
  };
  
  const decryptToken = (id: string) => {
    setTokens(prevTokens => 
      prevTokens.map(token => {
        if (token.id === id && token.isEncrypted) {
          // Fetch the actual balance for encrypted tokens
          const mockDecryptedTokens: Record<string, { balance: string, value: number }> = {
            '4': { balance: '0.5', value: 970 },     // PRIVATE (WETH)
            '5': { balance: '25.0', value: 245 },    // SECRET (UNI)
          };
          
          const decryptedData = mockDecryptedTokens[id] || { balance: '0', value: 0 };
          
          toast.success(`Token decrypted successfully!`, {
            description: `You have ${decryptedData.balance} ${token.symbol} (${decryptedData.value.toFixed(2)} USD)`
          });
          
          return {
            ...token,
            balance: decryptedData.balance,
            value: decryptedData.value,
            change24h: (Math.random() * 10) - 5,
            isDecrypted: true
          };
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
