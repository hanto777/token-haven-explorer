
import { useState, useEffect, useMemo } from "react";
import { readContract } from "wagmi/actions";
import { useAccount } from "wagmi";
import { useNetwork } from "@/hooks/useNetwork";
import { factoryAuctionAbi } from "@/utils/factoryAuctionAbi";
import { VITE_AUCTION_FACTORY_CONTRACT_ADDRESS } from "@/config/env";
import { wagmiConfig } from "@/providers/wagmiConfig";
import { useAuctionDetails } from "./use-auction";

export interface AuctionSummary {
  address: `0x${string}`;
  hasAuctionStarted?: boolean;
  expiresAt?: number;
  seller?: string;
}

export function useAllAuctions() {
  const { address, isConnected } = useAccount();
  const { currentChain } = useNetwork();
  const [auctions, setAuctions] = useState<AuctionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      if (!isConnected || !currentChain) {
        setAuctions([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Read all auctions from the factory contract
        const result = await readContract(wagmiConfig, {
          address: VITE_AUCTION_FACTORY_CONTRACT_ADDRESS as `0x${string}`,
          abi: factoryAuctionAbi,
          functionName: "getAllAuctions",
        });

        if (result && Array.isArray(result)) {
          const auctionAddresses = result as `0x${string}`[];

          // Map auction addresses to AuctionSummary objects
          const auctionSummaries: AuctionSummary[] = auctionAddresses.map(
            (auctionAddress) => ({
              address: auctionAddress,
            })
          );

          // Get additional details for each auction
          const auctionDetailsPromises = auctionAddresses.map(async (auctionAddress) => {
            try {
              const hasStarted = await readContract(wagmiConfig, {
                address: auctionAddress,
                abi: [
                  {
                    inputs: [],
                    name: "auctionStart",
                    outputs: [{ internalType: "bool", name: "", type: "bool" }],
                    stateMutability: "view",
                    type: "function",
                  },
                ],
                functionName: "auctionStart",
              });

              const expiresAtResult = await readContract(wagmiConfig, {
                address: auctionAddress,
                abi: [
                  {
                    inputs: [],
                    name: "expiresAt",
                    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
                    stateMutability: "view",
                    type: "function",
                  },
                ],
                functionName: "expiresAt",
              });

              const sellerResult = await readContract(wagmiConfig, {
                address: auctionAddress,
                abi: [
                  {
                    inputs: [],
                    name: "seller",
                    outputs: [{ internalType: "address payable", name: "", type: "address" }],
                    stateMutability: "view",
                    type: "function",
                  },
                ],
                functionName: "seller",
              });

              return {
                address: auctionAddress,
                hasAuctionStarted: Boolean(hasStarted),
                expiresAt: Number(expiresAtResult),
                seller: sellerResult as string,
              };
            } catch (err) {
              console.error(`Error fetching details for auction ${auctionAddress}:`, err);
              return {
                address: auctionAddress,
                hasAuctionStarted: false,
                expiresAt: 0,
                seller: "",
              };
            }
          });

          const auctionsWithDetails = await Promise.all(auctionDetailsPromises);
          setAuctions(auctionsWithDetails);
        } else {
          setAuctions([]);
        }
      } catch (err) {
        console.error("Error fetching auctions:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch auctions")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctions();
  }, [isConnected, currentChain, address]);

  // Filter for active auctions
  const activeAuctions = useMemo(() => {
    if (!auctions.length) return [];
    const now = Math.floor(Date.now() / 1000);
    return auctions.filter(
      (auction) => auction.hasAuctionStarted && auction.expiresAt && auction.expiresAt > now
    );
  }, [auctions]);

  // Filter for ended auctions
  const endedAuctions = useMemo(() => {
    if (!auctions.length) return [];
    const now = Math.floor(Date.now() / 1000);
    return auctions.filter(
      (auction) => auction.hasAuctionStarted && auction.expiresAt && auction.expiresAt <= now
    );
  }, [auctions]);

  // Filter for user's auctions
  const myAuctions = useMemo(() => {
    if (!auctions.length || !address) return [];
    return auctions.filter(
      (auction) => auction.seller?.toLowerCase() === address.toLowerCase()
    );
  }, [auctions, address]);

  return {
    auctions,
    activeAuctions,
    endedAuctions,
    myAuctions,
    isLoading,
    error,
  };
}
