import { useState, useEffect } from "react";
import { useTokens } from "@/hooks/useTokens";
import { useAccount, useChainId } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sepolia } from "wagmi/chains";
import { useNetwork } from "@/hooks/useNetwork";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import NoConfidentialTokensMessage from "./confidential/NoConfidentialTokensMessage";
import ConfidentialTransferFormFields from "./confidential/ConfidentialTransferFormFields";
import TransferSuccessMessage from "./TransferSuccessMessage";
import { useEncryptedTransfer } from "@/hooks/useEncryptedTransfer";

const ConfidentialTransferForm = () => {
  const { tokens, transferState } = useTokens();
  const chain = sepolia;
  const chainId = useChainId();

  const { address } = useAccount();
  const { currentChain, switchNetwork } = useNetwork();
  const { toast } = useToast();

  const [selectedTokenId, setSelectedTokenId] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [formError, setFormError] = useState<string>("");

  const {
    transfer,
    isEncrypting,
    isPending: isPendingTransfer,
    isConfirming,
    isConfirmed,
    transferHash,
    transferError,
  } = useEncryptedTransfer({
    userAddress: address,
    chain,
  });

  // Extract transfer state properties
  const { hash, isPending, isError, error, isSuccess } = transferState;

  // Filter tokens to only show confidential tokens
  const confidentialTokens = tokens.filter((token) => token.isConfidential);

  // Check if user is on the right network (Sepolia)
  const isOnSepolia = chainId === sepolia.id;

  // Add useEffect to watch transfer states
  useEffect(() => {
    if (isEncrypting) {
      toast({
        title: "Encrypting Transaction",
        description: "Generating encrypted proof for your transaction...",
      });
    }
  }, [isEncrypting, toast]);

  useEffect(() => {
    if (isPendingTransfer) {
      toast({
        title: "Transaction Pending",
        description: `Sending ${amount} ${
          tokens.find((t) => t.id === selectedTokenId)?.symbol
        } confidentially...`,
      });
    }
  }, [isPendingTransfer, amount, selectedTokenId, tokens, toast]);

  useEffect(() => {
    if (isConfirming) {
      toast({
        title: "Confirming Transaction",
        description: "Waiting for confirmation...",
      });
    }
  }, [isConfirming, toast]);

  useEffect(() => {
    if (isConfirmed) {
      toast({
        title: "Transfer Complete",
        description: `Successfully sent ${amount} ${
          tokens.find((t) => t.id === selectedTokenId)?.symbol
        }`,
      });
    }
  }, [isConfirmed, amount, selectedTokenId, tokens, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is on Sepolia network
    if (!isOnSepolia) {
      toast({
        title: "Wrong Network",
        description:
          "Confidential tokens are only available on Sepolia testnet. Please switch networks.",
        variant: "destructive",
      });
      return;
    }

    // Validate form
    if (!selectedTokenId) {
      setFormError("Please select a confidential token");
      return;
    }

    if (!recipient || !/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      setFormError("Please enter a valid Ethereum address");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setFormError("Please enter a valid amount");
      return;
    }

    setFormError("");

    try {
      const selectedToken = tokens.find((t) => t.id === selectedTokenId);
      await transfer(
        selectedToken.address as `0x${string}`,
        amount,
        recipient as `0x${string}`
      );

      if (transferError) {
        throw transferError;
      }
    } catch (error) {
      console.error("Confidential transfer error:", error);
      setFormError("Transfer failed. Please try again.");
      toast({
        title: "Transfer Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setAmount("");
    setRecipient("");
  };

  // If no confidential tokens available, show proper message
  if (confidentialTokens.length === 0) {
    return <NoConfidentialTokensMessage />;
  }

  // If not on Sepolia, show switch chain message
  if (!isOnSepolia) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="w-full max-w-2xl space-y-4 p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Wrong Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p>This application only works on Sepolia testnet.</p>
                <p>Please switch your network to Sepolia to continue.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full border bg-card/60 backdrop-blur-xs">
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <TransferSuccessMessage
              amount={amount}
              symbol={
                tokens.find((t) => t.id === selectedTokenId)?.symbol || "tokens"
              }
              hash={hash}
              onReset={handleReset}
            />
          ) : (
            <ConfidentialTransferFormFields
              isOnSepolia={isOnSepolia}
              switchNetwork={switchNetwork}
              confidentialTokens={confidentialTokens}
              selectedTokenId={selectedTokenId}
              setSelectedTokenId={setSelectedTokenId}
              recipient={recipient}
              setRecipient={setRecipient}
              amount={amount}
              setAmount={setAmount}
              formError={formError}
              isPending={isPending}
              handleSubmit={handleSubmit}
            />
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default ConfidentialTransferForm;
