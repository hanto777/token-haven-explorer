
import { create } from 'zustand';
import { Token } from '@/types/tokenTypes';
import { getNativeToken, getDefaultTokens } from '@/utils/tokenUtils';

interface TokenStore {
  tokens: Token[];
  isLoading: boolean;
  setTokens: (tokens: Token[]) => void;
  setIsLoading: (loading: boolean) => void;
  decryptToken: (id: string, decryptedBalance: string) => void;
  initializeTokens: (chainId: number, address: string) => void;
  sendToken: (id: string, to: string, amount: string) => Promise<boolean>;
}

export const useTokenStore = create<TokenStore>((set, get) => ({
  tokens: [],
  isLoading: true,
  setTokens: (tokens) => set({ tokens }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  decryptToken: (id, decryptedBalance) => {
    const { tokens } = get();
    const updatedTokens = tokens.map((token) => {
      if (token.id === id && token.isEncrypted) {
        if (token.isConfidential) {
          const value = 20; // Mock value for demonstration
          return {
            ...token,
            isDecrypted: true,
            balance: decryptedBalance,
            value,
          };
        }
        return { ...token, isDecrypted: true };
      }
      return token;
    });
    set({ tokens: updatedTokens });
  },

  initializeTokens: async (chainId, address) => {
    set({ isLoading: true });
    try {
      const nativeToken = getNativeToken(chainId);
      const otherTokens = getDefaultTokens(chainId);

      // Generate random 24h changes for demo purposes
      const nativeChange24h = Math.random() * 10 - 5;

      const nativeTokenWithBalance = {
        ...nativeToken,
        balance: "0",
        rawBalance: "0",
        value: 0,
        change24h: nativeChange24h,
      };

      const otherTokensWithBalances = otherTokens.map((token) => {
        const change24h = Math.random() * 10 - 5;
        return {
          ...token,
          balance: "0",
          rawBalance: "0",
          value: 0,
          change24h,
        };
      });

      const allTokens = [nativeTokenWithBalance, ...otherTokensWithBalances];
      set({ tokens: allTokens });
    } catch (error) {
      console.error("Error initializing tokens:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  sendToken: async (id, to, amount) => {
    try {
      set({ isLoading: true });
      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return true;
    } catch (error) {
      console.error("Transfer error:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
