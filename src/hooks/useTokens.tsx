
import { useContext } from 'react';
import TokenContext from '@/contexts/TokenContext';
import { Token, TokenContextType } from '@/types/tokenTypes';

export type { Token, TokenContextType };
export { default as TokenProvider } from '@/providers/TokenProvider';
export const useTokens = () => useContext(TokenContext);
