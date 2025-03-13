
import { mainnet, sepolia, polygon } from 'wagmi/chains';

// Get the default native token based on chainId
export const getNativeToken = (chainId: number) => {
  switch (chainId) {
    case mainnet.id:
      return {
        id: '1',
        symbol: 'ETH',
        name: 'Ethereum',
        address: 'native',
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
        isEncrypted: false,
        isDecrypted: false,
        logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      };
  }
};

// Get the rest of the default tokens (non-native)
export const getDefaultTokens = () => [
  {
    id: '2',
    symbol: 'MATIC',
    name: 'Polygon',
    address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', // Ethereum Mainnet MATIC
    isEncrypted: false,
    isDecrypted: false,
    logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  },
  {
    id: '3',
    symbol: 'LINK',
    name: 'Chainlink',
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', // Ethereum Mainnet LINK
    isEncrypted: false,
    isDecrypted: false,
    logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png',
  }
];

// Helper function to get a price for a token (in a real app, you'd use an API)
export const getTokenPrice = (symbol: string, chainId?: number): number => {
  // If it's MATIC on Polygon network, it's the native token
  if (symbol === 'MATIC' && chainId === polygon.id) {
    return 1.1; // Native MATIC price
  }
  
  const prices: Record<string, number> = {
    'ETH': 1940,
    'MATIC': 1.1,
    'LINK': 11.5,
    'WETH': 1940,
    'UNI': 9.8
  };
  
  return prices[symbol] || 1;
};
