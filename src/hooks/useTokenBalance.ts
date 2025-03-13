
import { useEffect, useState } from 'react';
import { useBalance, useToken, useReadContract, useChainId } from 'wagmi';
import { formatUnits } from 'viem';
import { mainnet, sepolia, polygon } from 'wagmi/chains';

// ERC-20 ABI for the balanceOf function
const erc20ABI = [
  {
    constant: true,
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function'
  }
];

interface UseTokenBalanceProps {
  address?: string;
  tokenAddress: string;
  enabled?: boolean;
}

export function useTokenBalance({ address, tokenAddress, enabled = true }: UseTokenBalanceProps) {
  const chainId = useChainId();
  const [balance, setBalance] = useState('0');
  const [value, setValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const isNativeToken = tokenAddress === 'native';
  
  // Token data query (for ERC20 tokens)
  const tokenData = useToken({
    address: isNativeToken ? undefined : tokenAddress as `0x${string}`,
    query: {
      enabled: enabled && !isNativeToken && !!tokenAddress
    }
  });
  
  // Native token balance query
  const nativeBalanceData = useBalance({
    address: address as `0x${string}`,
    query: {
      enabled: enabled && !!address && isNativeToken
    }
  });
  
  // ERC20 token balance query using balanceOf
  const tokenBalanceData = useReadContract({
    address: isNativeToken ? undefined : tokenAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: enabled && !!address && !isNativeToken && !!tokenAddress
    }
  });
  
  useEffect(() => {
    // For native token
    if (isNativeToken) {
      setIsLoading(nativeBalanceData.isLoading);
      
      if (nativeBalanceData.error) {
        setError(nativeBalanceData.error);
      } else {
        setError(null);
      }
      
      if (nativeBalanceData.data && !nativeBalanceData.isLoading) {
        const formattedBalance = nativeBalanceData.data.formatted;
        setBalance(formattedBalance);
        
        // Get the appropriate token price based on the current network
        let nativePrice = 1940; // Default ETH price
        let nativeSymbol = 'ETH';
        
        if (chainId === polygon.id) {
          nativePrice = 1.1; // MATIC price
          nativeSymbol = 'MATIC';
        }
        
        setValue(parseFloat(formattedBalance) * nativePrice);
      }
    } 
    // For ERC20 tokens
    else {
      setIsLoading(tokenBalanceData.isLoading || tokenData.isLoading);
      
      if (tokenBalanceData.error) {
        setError(tokenBalanceData.error);
      } else if (tokenData.error) {
        setError(tokenData.error);
      } else {
        setError(null);
      }
      
      if (tokenBalanceData.data && tokenData.data && !tokenBalanceData.isLoading && !tokenData.isLoading) {
        const rawBalance = tokenBalanceData.data as bigint;
        const formattedBalance = formatUnits(rawBalance, tokenData.data.decimals);
        setBalance(formattedBalance);
        
        // Mock price calculation based on token symbol
        const mockPrice = tokenData.data?.symbol === 'LINK' ? 11.5 : 
                         tokenData.data?.symbol === 'MATIC' ? 1.1 : 
                         tokenData.data?.symbol === 'WETH' ? 1940 : 
                         tokenData.data?.symbol === 'UNI' ? 9.8 : 5;
        
        setValue(parseFloat(formattedBalance) * mockPrice);
      }
    }
  }, [
    isNativeToken,
    chainId,
    nativeBalanceData.data, 
    nativeBalanceData.isLoading, 
    nativeBalanceData.error,
    tokenBalanceData.data,
    tokenBalanceData.isLoading,
    tokenBalanceData.error,
    tokenData.data,
    tokenData.isLoading,
    tokenData.error
  ]);
  
  // Get the appropriate native token symbol based on the chain
  const getNativeSymbol = () => {
    if (chainId === polygon.id) return 'MATIC';
    return 'ETH'; // Default for Ethereum networks (mainnet, sepolia, etc.)
  };
  
  // Get the appropriate native token name based on the chain
  const getNativeName = () => {
    if (chainId === mainnet.id) return 'Ethereum';
    if (chainId === sepolia.id) return 'Sepolia ETH';
    if (chainId === polygon.id) return 'Polygon';
    return 'Ethereum'; // Default
  };
  
  return {
    balance,
    value,
    isLoading,
    error,
    symbol: isNativeToken ? getNativeSymbol() : tokenData.data?.symbol,
    name: isNativeToken ? getNativeName() : tokenData.data?.name,
    decimals: isNativeToken ? 18 : tokenData.data?.decimals
  };
}
