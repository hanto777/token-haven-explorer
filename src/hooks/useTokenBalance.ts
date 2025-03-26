import { useEffect, useState } from "react";
import { useBalance, useReadContract, useChainId } from "wagmi";
import { formatUnits } from "viem";
import { mainnet, sepolia, polygon } from "wagmi/chains";

// ERC-20 ABI for the balanceOf function
const erc20ABI = [
  {
    constant: true,
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
];

interface UseTokenBalanceProps {
  address?: string;
  tokenAddress: string;
  enabled?: boolean;
}

export function useTokenBalance({
  address,
  tokenAddress,
  enabled = true,
}: UseTokenBalanceProps) {
  const chainId = useChainId();
  const [balance, setBalance] = useState("0");
  const [rawBalance, setRawBalance] = useState<bigint>(BigInt(0));
  const [value, setValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);

  const isNativeToken = tokenAddress === "native";

  // Remove tokenData and add separate queries for symbol and decimals
  const tokenSymbolData = useReadContract({
    address: isNativeToken ? undefined : (tokenAddress as `0x${string}`),
    abi: erc20ABI,
    functionName: "symbol",
    query: {
      enabled: enabled && !isNativeToken && !!tokenAddress,
    },
  });

  const tokenDecimalsData = useReadContract({
    address: isNativeToken ? undefined : (tokenAddress as `0x${string}`),
    abi: erc20ABI,
    functionName: "decimals",
    query: {
      enabled: enabled && !isNativeToken && !!tokenAddress,
    },
  });

  // Native token balance query
  const nativeBalanceData = useBalance({
    address: address as `0x${string}`,
    query: {
      enabled: enabled && !!address && isNativeToken,
    },
  });

  // ERC20 token balance query using balanceOf
  const tokenBalanceData = useReadContract({
    address: isNativeToken ? undefined : (tokenAddress as `0x${string}`),
    abi: erc20ABI,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: enabled && !!address && !isNativeToken && !!tokenAddress,
    },
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
        setRawBalance(nativeBalanceData.data.value);

        // Get the appropriate token price based on the current network
        let nativePrice = 1940; // Default ETH price
        let nativeSymbol = "ETH";

        if (chainId === polygon.id) {
          nativePrice = 1.1; // MATIC price
          nativeSymbol = "MATIC";
        }

        setValue(parseFloat(formattedBalance) * nativePrice);
      }
    }
    // For ERC20 tokens
    else {
      setIsLoading(
        tokenBalanceData.isLoading ||
          tokenSymbolData.isLoading ||
          tokenDecimalsData.isLoading
      );

      if (tokenBalanceData.error) {
        setError(tokenBalanceData.error);
      } else if (tokenSymbolData.error) {
        setError(tokenSymbolData.error);
      } else if (tokenDecimalsData.error) {
        setError(tokenDecimalsData.error);
      } else {
        setError(null);
      }

      // Update symbol and decimals when available
      if (tokenSymbolData.data) {
        setTokenSymbol(tokenSymbolData.data as string);
      }

      if (tokenDecimalsData.data) {
        setTokenDecimals(Number(tokenDecimalsData.data));
      }

      if (
        tokenBalanceData.data &&
        !tokenBalanceData.isLoading &&
        tokenDecimals
      ) {
        const rawBalance = tokenBalanceData.data as bigint;
        setRawBalance(rawBalance);
        const formattedBalance = formatUnits(rawBalance, tokenDecimals);
        setBalance(formattedBalance);

        // Mock price calculation based on token symbol
        const mockPrice =
          tokenSymbol === "LINK"
            ? 11.5
            : tokenSymbol === "MATIC"
            ? 1.1
            : tokenSymbol === "WETH"
            ? 1940
            : tokenSymbol === "UNI"
            ? 9.8
            : 5;

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
    tokenSymbolData.data,
    tokenSymbolData.isLoading,
    tokenSymbolData.error,
    tokenDecimalsData.data,
    tokenDecimalsData.isLoading,
    tokenDecimalsData.error,
    tokenDecimals,
    tokenSymbol,
  ]);

  // Get the appropriate native token symbol based on the chain
  const getNativeSymbol = () => {
    if (chainId === polygon.id) return "MATIC";
    return "ETH"; // Default for Ethereum networks (mainnet, sepolia, etc.)
  };

  // Get the appropriate native token name based on the chain
  const getNativeName = () => {
    if (chainId === mainnet.id) return "Ethereum";
    if (chainId === sepolia.id) return "Sepolia ETH";
    if (chainId === polygon.id) return "Polygon";
    return "Ethereum"; // Default
  };

  return {
    balance,
    rawBalance,
    value,
    isLoading,
    error,
    symbol: isNativeToken ? getNativeSymbol() : tokenSymbol,
    name: isNativeToken ? getNativeName() : tokenSymbol,
    decimals: isNativeToken ? 18 : tokenDecimals,
  };
}
