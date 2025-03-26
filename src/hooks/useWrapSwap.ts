import { useState } from "react";
import { getInstance } from "@/lib/fhevm/fhevmjs";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toHexString } from "@/lib/helper";
import { toast } from "sonner";
import { Chain } from "wagmi/chains";
import { confidentialWETHAbi } from "@/utils/confidentialWETHAbi";
import { VITE_PAYMENT_TOKEN_CONTRACT_ADDRESS } from "@/config/env";

interface UseWrapSwapProps {
  userAddress?: `0x${string}`;
  chain: Chain; // Replace with proper chain type
}

export const useWrapSwap = ({ userAddress, chain }: UseWrapSwapProps) => {
  const {
    data: wrapHash,
    error: wrapError,
    isPending,
    isError,
    writeContract,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: wrapHash,
    });

  const wrap = async (amount: string) => {
    if (!amount || !userAddress) return;

    try {
      await writeContract({
        address: VITE_PAYMENT_TOKEN_CONTRACT_ADDRESS,
        abi: confidentialWETHAbi,
        functionName: "wrap",
        account: userAddress,
        chain,
        value: amount,
      });

      toast.info("Confidential wrap Initiated", {
        description: "Processing transaction.",
      });

      return true;
    } catch (error) {
      console.error("wrap failed:", error);
      return false;
    }
  };

  return {
    wrap,
    isPending,
    isConfirming,
    isConfirmed,
    isError,
    wrapHash,
    wrapError,
  };
};
