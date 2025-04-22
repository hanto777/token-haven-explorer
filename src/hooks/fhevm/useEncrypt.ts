import { useState } from "react";
import { getInstance } from "@/lib/fhevm/fhevmjs";
import { parseUnits } from "viem";

export const useEncrypt = () => {
  const [isEncrypting, setIsEncrypting] = useState(false);

  const encryptAmount = async (
    contractAddress: `0x${string}`,
    userAddress: `0x${string}`,
    amount: bigint,
  ) => {
    setIsEncrypting(true);
    try {
      const instance = getInstance();
      const result = await instance
        .createEncryptedInput(contractAddress, userAddress)
        .add64(BigInt(amount))
        .encrypt();

      return result;
    } catch (error) {
      console.error("Encryption failed:", error);
      throw error;
    } finally {
      setIsEncrypting(false);
    }
  };

  return { encryptAmount, isEncrypting };
};