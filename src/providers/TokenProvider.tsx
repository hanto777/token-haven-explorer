
import { ReactNode, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useAccount, useChainId } from "wagmi";
import TokenContext from "@/contexts/TokenContext";
import { useTokenStore } from "@/stores/useTokenStore";

export const TokenProvider = ({ children }: { children: ReactNode }) => {
  const { isConnected } = useWallet();
  const { address } = useAccount();
  const chainId = useChainId();
  const { tokens, isLoading, initializeTokens, decryptToken, sendToken } = useTokenStore();

  useEffect(() => {
    if (isConnected && address) {
      initializeTokens(chainId, address);
    }
  }, [isConnected, address, chainId, initializeTokens]);

  return (
    <TokenContext.Provider value={{ tokens, isLoading, decryptToken, sendToken }}>
      {children}
    </TokenContext.Provider>
  );
};

export default TokenProvider;
