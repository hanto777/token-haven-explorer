
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';

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
}

// Mock token data for demo
const mockTokens: Token[] = [
  {
    id: '1',
    symbol: 'ETH',
    name: 'Ethereum',
    balance: '2.45',
    value: 4765.23,
    change24h: 2.3,
    isEncrypted: false,
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  },
  {
    id: '2',
    symbol: 'MATIC',
    name: 'Polygon',
    balance: '1250.50',
    value: 1375.55,
    change24h: -1.2,
    isEncrypted: false,
    logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  },
  {
    id: '3',
    symbol: 'LINK',
    name: 'Chainlink',
    balance: '75.00',
    value: 862.50,
    change24h: 5.7,
    isEncrypted: false,
    logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png',
  },
  {
    id: '4',
    symbol: 'PRIVATE',
    name: 'Private Token',
    balance: '???',
    value: 0,
    change24h: 0,
    isEncrypted: true,
    logo: 'https://cryptologos.cc/logos/mask-network-mask-logo.png',
  },
  {
    id: '5',
    symbol: 'SECRET',
    name: 'Secret Token',
    balance: '???',
    value: 0,
    change24h: 0,
    isEncrypted: true,
    logo: 'https://cryptologos.cc/logos/secret-scrt-logo.png',
  }
];

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
  const { isConnected, address } = useWallet();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (isConnected) {
      // Simulate API loading
      setIsLoading(true);
      setTimeout(() => {
        setTokens(mockTokens);
        setIsLoading(false);
      }, 1000);
    } else {
      setTokens([]);
    }
  }, [isConnected]);
  
  const decryptToken = (id: string) => {
    setTokens(prevTokens => 
      prevTokens.map(token => {
        if (token.id === id && token.isEncrypted) {
          // For demo, we'll reveal "random" balances when decrypting
          const decryptedBalance = (Math.random() * 1000).toFixed(2);
          const decryptedValue = parseFloat(decryptedBalance) * (Math.random() * 10);
          
          toast.success(`Token decrypted successfully!`, {
            description: `You have ${decryptedBalance} ${token.symbol} (${decryptedValue.toFixed(2)} USD)`
          });
          
          return {
            ...token,
            balance: decryptedBalance,
            value: decryptedValue,
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
