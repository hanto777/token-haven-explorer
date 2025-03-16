import { useState } from "react";
import { getInstance } from "@/lib/fhevm/fhevmjs";
import { reencryptEuint64 } from "@/lib/reencrypt";
import { Signer } from "ethers";
import { useTokenBalance } from "@/hooks/useTokenBalance";

interface UseEncryptedBalanceProps {
  userAddress?: `0x${string}`;
  contractAddress: `0x${string}`;
  signer: Signer | null;
}

export const useEncryptedBalance = ({
  userAddress,
  contractAddress,
  signer,
}: UseEncryptedBalanceProps) => {
  const [decryptedBalance, setDecryptedBalance] = useState("???");
  const [lastUpdated, setLastUpdated] = useState<string>("Never");
  const [isDecrypting, setIsDecrypting] = useState(false);

  const tokenBalance = useTokenBalance({
    address: userAddress,
    tokenAddress: contractAddress || "native",
    enabled: !!userAddress,
  });

  const decrypt = async () => {
    setIsDecrypting(true);
    try {
      if (!signer)
        throw new Error("Signer not initialized - please connect your wallet");
      if (!tokenBalance.balance) throw new Error("Balance not found");

      const instance = getInstance();
      const clearBalance = await reencryptEuint64(
        signer,
        instance,
        BigInt(tokenBalance.rawBalance),
        contractAddress
      );
      setDecryptedBalance(clearBalance.toString());
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error("Decryption error:", error);
      if (error === "Handle is not initialized") {
        setDecryptedBalance("0");
      } else {
        throw error;
      }
    } finally {
      setIsDecrypting(false);
    }
  };

  return {
    decryptedBalance,
    lastUpdated,
    isDecrypting,
    decrypt,
    tokenBalance,
  };
};
