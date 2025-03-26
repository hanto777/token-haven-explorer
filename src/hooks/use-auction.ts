import { VITE_AUCTION_CONTRACT_ADDRESS } from '@/config/env';
import { auctionAbi } from '@/utils/auctionAbi';
import { useReadContract } from "wagmi";

const CONTRACT_ADDRESS = VITE_AUCTION_CONTRACT_ADDRESS;

export const useAuctionCurrentPrice = () => {
  const { data, refetch } = useReadContract({
    abi: auctionAbi,
    address: CONTRACT_ADDRESS,
    functionName: 'getPrice',
  })
  return { currentPrice: Number(data) || 0, refreshCurrentPrice: refetch }
}

export const useAuctionTokensLeft = () => {
  const { data, refetch } = useReadContract({
    abi: auctionAbi,
    address: CONTRACT_ADDRESS,
    functionName: 'tokensLeftReveal',
  })
  return { tokensLeft: Number(data) || 0, refreshTokensLeft: refetch }
}

export const useAuctionDetails = () => {
  const { data: startPrice } = useReadContract({
    abi: auctionAbi,
    address: CONTRACT_ADDRESS,
    functionName: 'startingPrice',
  })
  
  const { data: discountRate } = useReadContract({
    abi: auctionAbi,
    address: CONTRACT_ADDRESS,
    functionName: 'discountRate',
  })
  
  const { data: startAt } = useReadContract({
    abi: auctionAbi,
    address: CONTRACT_ADDRESS,
    functionName: 'startAt',
  })
  
  const { data: expiresAt } = useReadContract({
    abi: auctionAbi,
    address: CONTRACT_ADDRESS,
    functionName: 'expiresAt',
  })

  const { data: reservePrice } = useReadContract({
    abi: auctionAbi,
    address: CONTRACT_ADDRESS,
    functionName: 'reservePrice',
  })

  const { data: initialTokenSupply } = useReadContract({
    abi: auctionAbi,
    address: CONTRACT_ADDRESS,
    functionName: 'amount',
  })

  const { data: isAuctionActive } = useReadContract({
    abi: auctionAbi,
    address: CONTRACT_ADDRESS,
    functionName: 'auctionStart',
  })


  return {
    startPrice: Number(startPrice),
    discountRate: Number(discountRate),
    startAt: Number(startAt),
    expiresAt: Number(expiresAt),
    reservePrice: Number(reservePrice),
    initialTokenSupply: Number(initialTokenSupply),
    isAuctionActive: Boolean(isAuctionActive),
  }
}