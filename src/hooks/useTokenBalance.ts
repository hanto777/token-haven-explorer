
import { useEffect, useState } from 'react';
import { useBalance, useToken } from 'wagmi';
import { formatUnits } from 'viem';

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
    enabled: enabled && !isNativeToken
  });
  
  // Balance query
  const balanceData = useBalance({
    address: address as `0x${string}`,
    token: isNativeToken ? undefined : tokenAddress as `0x${string}`,
    enabled: enabled && !!address
  });
  
  useEffect(() => {
    setIsLoading(balanceData.isLoading || tokenData.isLoading);
    
    if (balanceData.error) {
      setError(balanceData.error);
    } else if (tokenData.error && !isNativeToken) {
      setError(tokenData.error);
    } else {
      setError(null);
    }
    
    if (balanceData.data && !balanceData.isLoading) {
      const formattedBalance = balanceData.data.formatted;
      setBalance(formattedBalance);
      
      // In a real application, you would get the token price from an API
      // For this example, we'll use a mock price calculation
      const mockPrice = isNativeToken ? 1940 : 
                       (tokenData.data?.symbol === 'LINK' ? 11.5 : 
                        tokenData.data?.symbol === 'MATIC' ? 1.1 : 5);
      
      setValue(parseFloat(formattedBalance) * mockPrice);
    }
  }, [
    balanceData.data, 
    balanceData.isLoading, 
    balanceData.error,
    tokenData.data,
    tokenData.isLoading,
    tokenData.error,
    isNativeToken
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
