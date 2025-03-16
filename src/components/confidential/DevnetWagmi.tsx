import { useEffect, useState, useCallback } from "react";
import { getInstance } from "@/lib/fhevm/fhevmjs";
import { ZeroAddress } from "ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reencryptEuint64 } from "@/lib/reencrypt";
import { Unlock, Loader2 } from "lucide-react";
import { Input } from "../ui/input.tsx";
import { toast } from "sonner";
import { useWalletClient, useAccount } from "wagmi";
import { isAddress } from "viem";
import { getEthersSigner } from "@/lib/wagmi-adapter/client-to-signer.ts";
import { config } from "@/App.tsx";
import { Signer } from "ethers";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { mainnet, sepolia, polygon, optimism, arbitrum } from "wagmi/chains";
import {
  type BaseError,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { toHexString } from "@/lib/helper";
import { PAYMENT_TOKEN_ADDRESS } from "@/utils/confidentialErc20Abi.ts";

export const DevnetWagmi = () => {
  const { address } = useAccount();

  // Remove the chain switch logic since we only support Sepolia
  const chain = sepolia;

  const [decryptedBalance, setDecryptedBalance] = useState("???");
  const [lastUpdated, setLastUpdated] = useState<string>("Never");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const contractAddress = PAYMENT_TOKEN_ADDRESS;

  const [transferAmount, setTransferAmount] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);

  const [inputValueAddress, setInputValueAddress] = useState("");
  const [chosenAddress, setChosenAddress] = useState("0x");
  const [errorMessage, setErrorMessage] = useState("");

  const { data: walletClient } = useWalletClient();
  const [signer, setSigner] = useState<Signer | null>(null);

  // Use the token balance hook to get real-time balance
  const tokenBalance = useTokenBalance({
    address: address,
    tokenAddress: contractAddress || "native",
    enabled: !!address,
  });

  console.log(tokenBalance.rawBalance);

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

  useEffect(() => {
    const trimmedValue = inputValueAddress.trim().toLowerCase();
    if (trimmedValue === "") {
      setChosenAddress("0x");
      setErrorMessage("");
    } else if (isAddress(trimmedValue)) {
      setChosenAddress(trimmedValue as `0x${string}`);
      setErrorMessage("");
    } else {
      setChosenAddress("0x");
      setErrorMessage("Invalid Ethereum address.");
    }
  }, [inputValueAddress]);

  const instance = getInstance();

  useEffect(() => {
    const initSigner = async () => {
      try {
        const s = await getEthersSigner(config);
        if (!s) {
          console.warn("Failed to initialize signer");
          return;
        }
        setSigner(s);
      } catch (error) {
        console.error("Error initializing signer:", error);
      }
    };
    initSigner();
  }, []);

  const decrypt = async () => {
    setIsDecrypting(true);
    try {
      if (!walletClient) throw new Error("Wallet client not found");
      if (!signer)
        throw new Error("Signer not initialized - please connect your wallet");
      if (!tokenBalance.balance) throw new Error("Balance not found");

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

  const transferToken = async () => {
    if (!transferAmount) return;

    setIsEncrypting(true);
    try {
      const result = await instance
        .createEncryptedInput(contractAddress, address)
        .add64(BigInt(transferAmount))
        .encrypt();

      setIsEncrypting(false);

      console.log("Encrypted transfer data:", {
        to: chosenAddress,
        handle: toHexString(result.handles[0]),
        proof: toHexString(result.inputProof),
      });

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
          chosenAddress as `0x${string}`,
          toHexString(result.handles[0]) as `0x${string}`,
          toHexString(result.inputProof) as `0x${string}`,
        ],
        account: address,
        chain: chain,
      });

      toast.info("Confidential Transfer Initiated", {
        description:
          "Processing encrypted transaction. This may take longer than regular transfers.",
      });

      // Clear the form
      setTransferAmount("");
      setInputValueAddress("");
    } catch (error) {
      console.error("Transfer failed:", error);
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-1">
        {/* Encrypted Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Encrypted Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="font-mono text-xl">
                  {decryptedBalance.toString()} {tokenBalance.symbol}
                </div>
                <div className="font-mono text-gray-600 text-sm">
                  Last updated: {lastUpdated}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => decrypt()}
                disabled={isDecrypting}
              >
                {isDecrypting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Decrypting...
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    Decrypt
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transfer Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Transfer Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Recepient Address</label>
              <Input
                type="text"
                value={inputValueAddress}
                onChange={(e) => setInputValueAddress(e.target.value)}
                placeholder="0x...."
              />
              {errorMessage && (
                <div style={{ color: "red" }}>
                  <p>{errorMessage}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-600">Amount</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  value={transferAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || parseFloat(value) >= 0) {
                      setTransferAmount(value);
                    }
                  }}
                  placeholder="Enter amount to transfer"
                />
              </div>
            </div>

            <div>
              <Button
                className="w-full"
                size="lg"
                onClick={transferToken}
                disabled={
                  isPending ||
                  isEncrypting ||
                  !transferAmount ||
                  chosenAddress === "0x"
                }
              >
                {isEncrypting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Encrypting amount...
                  </>
                ) : isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming transaction...
                  </>
                ) : (
                  "Transfer Tokens"
                )}
              </Button>
            </div>
            {transferHash && <div>Transaction Hash: {transferHash}</div>}
            {isConfirming && <div>Waiting for confirmation...</div>}
            {isConfirmed && <div>Transaction confirmed.</div>}
            {transferError && (
              <div>
                Error:{" "}
                {(transferError as BaseError).shortMessage ||
                  transferError.message}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
