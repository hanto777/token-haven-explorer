import { useEffect, useState } from 'react'
import { useClient, useWatchContractEvent } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { auctionAbi } from '@/utils/auctionAbi';
import { getBlock, getBlockNumber, getLogs } from 'viem/actions'

import { VITE_AUCTION_CONTRACT_ADDRESS } from '@/config/env';
import { Bid } from '@/types/bidTypes';

export const useBidsActivity = () => {
  const publicClient = useClient()
  const [bids, setBids] = useState<Bid[]>([])

  // Fetch logs
  const { data: logs } = useQuery({
    queryKey: ['bidsSumbitted', VITE_AUCTION_CONTRACT_ADDRESS],
    queryFn: async () => {
      if (!publicClient) throw new Error('Public client is not defined')
      const blockNumber = await getBlockNumber(publicClient)
      return getLogs(publicClient, {
        address: VITE_AUCTION_CONTRACT_ADDRESS,
        event: {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'address',
              name: 'buyer',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'pricePerToken',
              type: 'uint256',
            },
          ],
          name: 'BidSubmitted',
          type: 'event',
        },

        fromBlock: blockNumber - 10000n, // TODO: optim: should be contract block publication number
        toBlock: blockNumber,
      })
    },
  })

  useEffect(() => {
    if (!publicClient) throw new Error('Public client is not defined')
      async function updateBids () {
        for (const log of logs) {
          const { timestamp } = await getBlock(publicClient, {blockHash: log.blockHash})
          setBids((prevBids) => {
            // avoid adding twice the same bid
            if(prevBids.find((bid) => bid.transactionHash === log.transactionHash)) {
              return prevBids
            }
            return [
            ...prevBids,
            {
              address: log.args.buyer,
              amount: log.args.pricePerToken.toString(),
              timestamp: new Date(Number(timestamp) * 1000),
              tokens: Number(timestamp),
              transactionHash: log.transactionHash
            }
          ]})
        }
    }

    if (logs) {
      updateBids()
    }
  }, [logs, publicClient])

  // live bids
  useWatchContractEvent({
    address: VITE_AUCTION_CONTRACT_ADDRESS,
    abi: auctionAbi,
    eventName: 'BidSubmitted',
    onLogs(nlogs) {
      console.log('New logs!', nlogs.length)

      nlogs.forEach((log) => {
        setBids((prevBids) => {
            // avoid adding twice the same bid
            if(prevBids.find((bid) => bid.transactionHash === log.transactionHash)) {
            return prevBids
          }
          return [
          ...prevBids,
          {
            address: log.address,
            amount: log.data.length.toString(),
            timestamp: new Date(),
            tokens: 1,
            transactionHash: log.transactionHash
          },
        ]})
      })
    },
  })
  return {
    bids,
  }
}