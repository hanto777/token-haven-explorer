import { useEffect, useState, useCallback } from "react";
import { getInstance } from "@/lib/fhevm/fhevmjs";
import { ZeroAddress } from "ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reencryptEuint64 } from "@/lib/reencrypt";
import { Unlock, Loader2 } from "lucide-react";
import { Input } from "../ui/input.tsx";
import {
  useReadContract,
  useWriteContract,
  useWalletClient,
  usePublicClient,
  useChainId,
  useAccount,
} from "wagmi";
import { isAddress } from "viem";
import { getEthersSigner } from "@/lib/wagmi-adapter/client-to-signer.ts";
import { config } from "@/App.tsx";
import { Signer } from "ethers";
import { useTokenBalance } from "@/hooks/useTokenBalance";

const toHexString = (bytes: Uint8Array) =>
  "0x" +
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

// ERC-20 ABI for the balanceOf function
const erc20ABI = [
  {
    constant: true,
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
];

export const DevnetWagmi = () => {
  const { address } = useAccount();

  const [contractAddress, setContractAddress] = useState<`0x${string}`>(
    ZeroAddress as `0x${string}`
  );
  const [tokenSymbol, setTokenSymbol] = useState("");

  const [decryptedBalance, setDecryptedBalance] = useState("???");
  const [lastUpdated, setLastUpdated] = useState<string>("Never");
  const [isDecrypting, setIsDecrypting] = useState(false);

  const [transferAmount, setTransferAmount] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

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
    isPending: isTransferPending,
    writeContract,
  } = useWriteContract();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Conditional import based on MOCKED environment variable
        let MyConfidentialERC20;
        if (!import.meta.env.MOCKED) {
          MyConfidentialERC20 = await import(
            "@/deployments/sepolia/MyConfidentialERC20.json"
          );
          console.log(
            `Using ${MyConfidentialERC20.address} for the token address on Sepolia`
          );
        } else {
          MyConfidentialERC20 = await import(
            "@/deployments/localhost/MyConfidentialERC20.json"
          );
          console.log(
            `Using ${MyConfidentialERC20.address} for the token address on Hardhat Local Node`
          );
        }

        setContractAddress(MyConfidentialERC20.address);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

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
      const s = await getEthersSigner(config);
      setSigner(s);
    };
    initSigner();
  }, []);

  const decrypt = async () => {
    setIsDecrypting(true);
    try {
      if (!walletClient) throw new Error("Wallet client not found");
      if (!signer) throw new Error("Signer not initialized");
      if (!tokenBalance.balance) throw new Error("Balance not found");

      // Generate new keypair and create EIP712 data for signing
      const { publicKey, privateKey } = instance.generateKeypair();
      const eip712 = instance.createEIP712(publicKey, contractAddress);

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
      setIsTransferring(true);

      console.log("Encrypted transfer data:", {
        to: chosenAddress,
        handle: toHexString(result.handles[0]),
        proof: toHexString(result.inputProof),
      });

      await writeContract({
        address: contractAddress,
        abi: [
          "function transfer(address,bytes32,bytes) external returns (bool)",
        ],
        functionName: "transfer",
        args: [
          chosenAddress as `0x${string}`,
          toHexString(result.handles[0]) as `0x${string}`,
          toHexString(result.inputProof) as `0x${string}`,
        ],
        chain: chainId,
        address: address as `0x${string}`,
      });

      // Clear the form
      setTransferAmount("");
      setInputValueAddress("");
    } catch (error) {
      console.error("Transfer failed:", error);
    } finally {
      setIsEncrypting(false);
      setIsTransferring(false);
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
                  {decryptedBalance.toString()} {tokenSymbol}
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
                  isTransferPending ||
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
                ) : isTransferPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  "Transfer Tokens"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
