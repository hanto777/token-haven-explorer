
import { useContext } from 'react';
import TokenContext from '@/contexts/TokenContext';
import { Token, TokenContextType } from '@/types/tokenTypes';
import { useWriteContract, useAccount, useChainId } from 'wagmi';
import { mainnet, sepolia, polygon, optimism, arbitrum } from 'wagmi/chains';
import { toast } from 'sonner';
import { erc20Abi } from '@/utils/erc20Abi';
import { parseUnits } from 'viem';

export type { Token, TokenContextType };
export { default as TokenProvider } from '@/providers/TokenProvider';

export const useTokens = () => {
  const context = useContext(TokenContext);
  const { address } = useAccount();
  const chainId = useChainId();
  
  const { 
    data: hash, 
    isPending,
    isError,
    error,
    isSuccess,
    writeContract 
  } = useWriteContract();
  
  const sendToken = async (id: string, to: string, amount: string): Promise<boolean> => {
    try {
      const token = context.tokens.find(t => t.id === id);
      
      if (!token) {
        throw new Error("Token not found");
      }
      
      // Native token transactions are handled separately in NativeTransferForm
      if (token.address === 'native') {
        return context.sendToken(id, to, amount);
      }
      
      // Get token decimals (default to 18 if not specified)
      const decimals = token.decimals || 18;
      
      // Convert the amount to the correct decimal representation
      const parsedAmount = parseUnits(amount, decimals);
      
      // Get the appropriate chain object based on chainId
      let chain;
      switch (chainId) {
        case mainnet.id:
          chain = mainnet;
          break;
        case sepolia.id:
          chain = sepolia;
          break;
        case polygon.id:
          chain = polygon;
          break;
        case optimism.id:
          chain = optimism;
          break;
        case arbitrum.id:
          chain = arbitrum;
          break;
        default:
          // Default to mainnet if chainId is not recognized
          chain = mainnet;
      }
      
      // Execute the ERC20 transfer transaction
      writeContract({
        address: token.address as `0x${string}`,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [to as `0x${string}`, parsedAmount],
        // Use the full chain object instead of just the ID
        account: address,
        chain: chain
      });
      
      // We return true to indicate the transaction was initiated
      // The actual success/failure will be handled by the UI through the isPending/isSuccess/isError states
      return true;
    } catch (error) {
      console.error("Transfer error:", error);
      toast.error("Transfer failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
      return false;
    }
  };
  
  return {
    ...context,
    sendToken,
    transferState: {
      hash,
      isPending,
      isError,
      error,
      isSuccess
    }
  };
};
