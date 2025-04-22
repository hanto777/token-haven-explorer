import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toHexString } from "@/lib/helper";
import { toast } from "sonner";
import { useChain } from "@/hooks/useChain";
import { useWallet } from "@/hooks/useWallet";
import { parseUnits } from "viem";
import { useEncrypt } from "@/hooks/fhevm/useEncrypt";
import { useState } from "react";

export const useConfidentialTransfer = () => {
  const { address } = useWallet();
  const { chain } = useChain();
  const { encryptAmount, isEncrypting } = useEncrypt();
  const {
    data: hash,
    isPending,
    isError,
    error,
    isSuccess,
    writeContract,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const transfer = async (
    contractAddress: `0x${string}`,
    amount: string,
    recipientAddress: `0x${string}`,
    tokenDecimals?: number
  ) => {
    if (!amount || !address) return;

    // Convert the amount to the correct decimal representation
    const parsedAmount = parseUnits(amount, tokenDecimals || 6);

    const result = await encryptAmount(
      contractAddress,
      address as `0x${string}`,
      parsedAmount
    );

    try {
      writeContract({
        address: contractAddress,
        abi: [
          {
            name: "transfer",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "to", type: "address" },
              { name: "handle", type: "bytes32" },
              { name: "proof", type: "bytes" },
            ],
            outputs: [{ name: "", type: "bool" }],
          },
        ],
        functionName: "transfer",
        args: [
          recipientAddress,
          toHexString(result.handles[0]) as `0x${string}`,
          toHexString(result.inputProof) as `0x${string}`,
        ],
        account: address as `0x${string}`,
        chain,
      });

      toast.info("Confidential Transfer Initiated", {
        description:
          "Processing encrypted transaction. This may take longer than regular transfers.",
      });

      return true;
    } catch (error) {
      console.error("Transfer failed:", error);
      return false;
    }
  };

  return {
    transfer,
    isEncrypting,
    isConfirming,
    isConfirmed,
    hash,
    isPending,
    isError,
    error,
    isSuccess,
    resetTransfer: reset,
  };
};
