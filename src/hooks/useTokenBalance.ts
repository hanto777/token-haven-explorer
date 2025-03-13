import { useEffect, useState } from 'react';
import { useBalance, useToken, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';

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
        
        // In a real application, you would get the token price from an API
        const ethPrice = 1940; // Mock ETH price in USD
        setValue(parseFloat(formattedBalance) * ethPrice);
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
  
  return {
    balance,
    value,
    isLoading,
    error,
    symbol: isNativeToken ? 'ETH' : tokenData.data?.symbol,
    name: isNativeToken ? 'Ethereum' : tokenData.data?.name,
    decimals: isNativeToken ? 18 : tokenData.data?.decimals
  };
}
