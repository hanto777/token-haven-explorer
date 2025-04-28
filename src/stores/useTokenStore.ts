
import { create } from 'zustand';
import { Token } from '@/types/tokenTypes';
import { getDefaultTokens, getNativeToken } from '@/utils/tokenUtils';

interface TokenStore {
  tokens: Token[];
  isLoading: boolean;
  setTokens: (tokens: Token[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  storeDecrypt: (tokenAddress: string, newBalance: string) => void;
  initializeTokens: (chainId: number) => void;
}

export const useTokenStore = create<TokenStore>((set) => ({
  tokens: [],
  isLoading: true,
  setTokens: (tokens) => set({ tokens }),
  setIsLoading: (isLoading) => set({ isLoading }),
  storeDecrypt: (tokenAddress, newBalance) =>
    set((state) => ({
      tokens: state.tokens.map((token) =>
        token.address?.toLowerCase() === tokenAddress.toLowerCase()
          ? {
              ...token,
              balance: newBalance,
              isDecrypted: true,
            }
          : token
      ),
    })),
  initializeTokens: (chainId: number) => {
    // Get the native token based on current chain
    const nativeToken = getNativeToken(chainId);

    // Get other default tokens based on the current chain
    const otherTokens = getDefaultTokens(chainId);

    // Initialize tokens with default values, always putting native token first
    const initialTokens = [
      {
        ...nativeToken,
        balance: '0',
        rawBalance: '0',
        value: 0,
        change24h: 0,
      },
      ...otherTokens.map((token) => ({
        ...token,
        balance: '0',
        rawBalance: '0',
        value: 0,
        change24h: 0,
      })),
    ];

    set({ tokens: initialTokens });
  },
}));
