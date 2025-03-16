import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Unlock, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useAccount, useConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { type BaseError } from "wagmi";
import { PAYMENT_TOKEN_ADDRESS } from "@/utils/confidentialErc20Abi.ts";
import { useEncryptedBalance } from "@/hooks/useEncryptedBalance";
import { useEncryptedTransfer } from "@/hooks/useEncryptedTransfer";
import { useSigner } from "@/hooks/useSigner";
import { useAddressValidation } from "@/hooks/useAddressValidation";

export const DevnetWagmi = () => {
  const { address } = useAccount();
  const chain = sepolia;
  const contractAddress = PAYMENT_TOKEN_ADDRESS;
  const config = useConfig();
  const { signer } = useSigner(config);

  const [transferAmount, setTransferAmount] = useState("");
  const [inputValueAddress, setInputValueAddress] = useState("");
  const { chosenAddress, errorMessage } =
    useAddressValidation(inputValueAddress);

  // Use custom hooks
  const { decryptedBalance, lastUpdated, isDecrypting, decrypt, tokenBalance } =
    useEncryptedBalance({
      userAddress: address,
      contractAddress,
      signer,
    });

  const {
    transfer,
    isEncrypting,
    isPending,
    isConfirming,
    isConfirmed,
    transferHash,
    transferError,
  } = useEncryptedTransfer({
    contractAddress,
    userAddress: address,
    chain,
  });

  const handleTransfer = async () => {
    if (await transfer(transferAmount, chosenAddress)) {
      setTransferAmount("");
      setInputValueAddress("");
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
                onClick={handleTransfer}
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
