console.log("Environment variables:", import.meta.env);

export const VITE_PAYMENT_TOKEN_CONTRACT_ADDRESS = import.meta.env
  .VITE_PAYMENT_TOKEN_CONTRACT_ADDRESS as `0x${string}`;
export const VITE_AUCTION_TOKEN_CONTRACT_ADDRESS = import.meta.env
  .VITE_AUCTION_TOKEN_CONTRACT_ADDRESS as `0x${string}`;
export const VITE_AUCTION_CONTRACT_ADDRESS = import.meta.env
  .VITE_AUCTION_CONTRACT_ADDRESS as `0x${string}`;
export const VITE_AUCTION_FACTORY_CONTRACT_ADDRESS = import.meta.env
  .VITE_AUCTION_FACTORY_CONTRACT_ADDRESS as `0x${string}`;
