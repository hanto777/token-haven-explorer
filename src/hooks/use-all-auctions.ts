
import { useState, useEffect } from "react";
import { readContract } from "wagmi/actions";
import { parseAbiItem } from "viem";
import { useAccount } from "wagmi";
import { useNetwork } from "@/hooks/useNetwork";
import { factoryAuctionAbi } from "@/utils/factoryAuctionAbi";
import { VITE_AUCTION_FACTORY_CONTRACT_ADDRESS } from "@/config/env";
import { wagmiConfig } from "@/providers/wagmiConfig";

export interface AuctionSummary {
  address: `0x${string}`;
  isUserAuction: boolean;
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
              isUserAuction: address
                ? address.toLowerCase() === auctionAddress.toLowerCase()
                : false,
            })
          );

          setAuctions(auctionSummaries);
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

  return {
    auctions,
    isLoading,
    error,
  };
}
