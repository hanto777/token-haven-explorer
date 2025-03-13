
import { mainnet, sepolia, polygon, optimism, arbitrum } from 'wagmi/chains';
import { CONFIDENTIAL_TOKEN_ADDRESS } from './confidentialErc20Abi';

// Get the default native token based on chainId
export const getNativeToken = (chainId: number) => {
  switch (chainId) {
    case mainnet.id:
      return {
        id: '1',
        symbol: 'ETH',
        name: 'Ethereum',
        address: 'native',
        decimals: 18,
        isEncrypted: false,
        isDecrypted: false,
        logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      };
    case sepolia.id:
      return {
        id: '1',
        symbol: 'ETH',
        name: 'Sepolia ETH',
        address: 'native',
        decimals: 18,
        isEncrypted: false,
        isDecrypted: false,
        logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      };
    case polygon.id:
      return {
        id: '1',
        symbol: 'MATIC',
        name: 'Polygon',
        address: 'native',
        decimals: 18,
        isEncrypted: false,
        isDecrypted: false,
        logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
      };
    default:
      return {
        id: '1',
        symbol: 'ETH',
        name: 'Ethereum',
        address: 'native',
        decimals: 18,
        isEncrypted: false,
        isDecrypted: false,
        logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      };
  }
};

// Get the rest of the default tokens (non-native) based on chain
export const getDefaultTokens = (chainId: number) => {
  switch (chainId) {
    case mainnet.id:
      return [
        {
          id: '2',
          symbol: 'USDC',
          name: 'USD Coin',
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          decimals: 6,
          isEncrypted: false,
          isDecrypted: false,
          logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
        },
        {
          id: '3',
          symbol: 'WBTC',
          name: 'Wrapped Bitcoin',
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          decimals: 8,
          isEncrypted: false,
          isDecrypted: false,
          logo: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png',
        }
      ];
    case sepolia.id:
      return [
        {
          id: '2',
          symbol: 'USDC',
          name: 'USD Coin (Sepolia)',
          address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
          decimals: 6,
          isEncrypted: false,
          isDecrypted: false,
          logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
        },
        {
          id: '3',
          symbol: 'WETH',
          name: 'Wrapped Ether (Sepolia)',
          address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
          decimals: 18,
          isEncrypted: false,
          isDecrypted: false,
          logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
        },
        {
          id: '4',
          symbol: 'cUSDC',
          name: 'Confidential USD Coin',
          address: CONFIDENTIAL_TOKEN_ADDRESS,
          decimals: 6,
          isEncrypted: true,
          isDecrypted: false,
          isConfidential: true,
          logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
        }
      ];
    case polygon.id:
      return [
        {
          id: '2',
          symbol: 'WBTC',
          name: 'Wrapped Bitcoin (Polygon)',
          address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
          decimals: 8,
          isEncrypted: false,
          isDecrypted: false,
          logo: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png',
        },
        {
          id: '3',
          symbol: 'USDC',
          name: 'USD Coin (Polygon)',
          address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
          decimals: 6,
          isEncrypted: false,
          isDecrypted: false,
          logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
        }
      ];
    default:
      return [
        {
          id: '2',
          symbol: 'USDC',
          name: 'USD Coin',
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          decimals: 6,
          isEncrypted: false,
          isDecrypted: false,
          logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
        }
      ];
  }
};

// Helper function to get a price for a token (in a real app, you'd use an API)
export const getTokenPrice = (symbol: string, chainId?: number): number => {
  // If it's MATIC on Polygon network, it's the native token
  if (symbol === 'MATIC' && chainId === polygon.id) {
    return 1.1; // Native MATIC price
  }
  
  const prices: Record<string, number> = {
    'ETH': 1940,
    'MATIC': 1.1,
    'WETH': 1940,
    'UNI': 9.8,
    'USDC': 1.0,
    'WBTC': 49000,
    'cUSDC': 1.0 // Add price for confidential USDC
  };
  
  return prices[symbol] || 1;
};
