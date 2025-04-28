
import { useTokenStore } from '@/stores/useTokenStore';

export const useTokens = () => {
  const store = useTokenStore();

  return {
    tokens: store.tokens,
    isLoading: store.isLoading,
    storeDecrypt: store.storeDecrypt,
  };
};

// Re-export Token type from types file
export type { Token } from '@/types/tokenTypes';
