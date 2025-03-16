import { useState } from "react";
import { getInstance } from "@/lib/fhevm/fhevmjs";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toHexString } from "@/lib/helper";
import { toast } from "sonner";
import { Chain } from "wagmi/chains";

interface UseEncryptedTransferProps {
  contractAddress: `0x${string}`;
  userAddress?: `0x${string}`;
  chain: Chain; // Replace with proper chain type
}

export const useEncryptedTransfer = ({
  contractAddress,
  userAddress,
  chain,
}: UseEncryptedTransferProps) => {
  const [isEncrypting, setIsEncrypting] = useState(false);

  const {
    data: transferHash,
    error: transferError,
    isPending,
    writeContract,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: transferHash,
    });

  const transfer = async (amount: string, recipientAddress: `0x${string}`) => {
    if (!amount || !userAddress) return;

    setIsEncrypting(true);
    try {
      const instance = getInstance();
      const result = await instance
        .createEncryptedInput(contractAddress, userAddress)
        .add64(BigInt(amount))
        .encrypt();

      await writeContract({
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
        account: userAddress,
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
    } finally {
      setIsEncrypting(false);
    }
  };

  return {
    transfer,
    isEncrypting,
    isPending,
    isConfirming,
    isConfirmed,
    transferHash,
    transferError,
  };
};
