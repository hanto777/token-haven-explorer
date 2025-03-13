
// Default tokens to check for
export const DEFAULT_TOKENS = [
  {
    id: '1',
    symbol: 'ETH',
    name: 'Ethereum',
    address: 'native',
    isEncrypted: false,
    isDecrypted: false,
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  },
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
export const getTokenPrice = (symbol: string): number => {
  const prices: Record<string, number> = {
    'ETH': 1940,
    'MATIC': 1.1,
    'LINK': 11.5,
    'WETH': 1940,
    'UNI': 9.8
  };
  
  return prices[symbol] || 1;
};
