import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTokens, Token } from "@/hooks/useTokens";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useAccount } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import TransactionStatus from "./TransactionStatus";
import TransferFormError from "./TransferFormError";
import TokenSelectField from "./TokenSelectField";
import RecipientInputField from "./RecipientInputField";
import AmountInputField from "./AmountInputField";
import TransferButton from "./TransferButton";
import TransferSuccessMessage from "./TransferSuccessMessage";
import { type BaseError } from "wagmi";

const TransferForm = () => {
  const [searchParams] = useSearchParams();
  const initialTokenId = searchParams.get("token");
  const { tokens, sendToken, transferState } = useTokens();
  const { address } = useAccount();

  const [selectedTokenId, setSelectedTokenId] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [formError, setFormError] = useState<string>("");

  // Extract transfer state properties
  const { hash, isPending, isError, error, isSuccess } = transferState;

  // Fetch real-time balance for the selected token
  const tokenBalance = useTokenBalance({
    address: address,
    tokenAddress: selectedToken?.address || "",
    enabled: !!address && !!selectedToken && selectedToken.id !== "1", // Don't fetch for native token
  });

  // Set initial token selection from URL params, but ignore native token (id=1)
  useEffect(() => {
    if (
      initialTokenId &&
      initialTokenId !== "1" &&
      tokens.some((t) => t.id === initialTokenId)
    ) {
      setSelectedTokenId(initialTokenId);
    } else if (tokens.length > 0) {
      // Filter out native token (id=1) and find the first non-native token
      const firstToken = tokens.find((t) => t.id !== "1" && !t.isEncrypted);
      if (firstToken) {
        setSelectedTokenId(firstToken.id);
      }
    }
  }, [initialTokenId, tokens]);

  // Update selected token when ID changes
  useEffect(() => {
    const token = tokens.find((t) => t.id === selectedTokenId);
    setSelectedToken(token || null);
  }, [selectedTokenId, tokens]);

  // Reset the form when a transfer is successful
  useEffect(() => {
    if (isSuccess) {
      // Reset form after 3 seconds
      setTimeout(() => {
        setAmount("");
        setRecipient("");
      }, 3000);
    }
  }, [isSuccess]);

  const validateForm = (): boolean => {
    if (!selectedToken) {
      setFormError("Please select a token");
      return false;
    }

    if (!recipient || !/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      setFormError("Please enter a valid Ethereum address");
      return false;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setFormError("Please enter a valid amount");
      return false;
    }

    // Use the real-time balance from useTokenBalance if available
    const currentBalance = !tokenBalance.isLoading
      ? tokenBalance.balance
      : selectedToken.balance;

    if (Number(amount) > Number(currentBalance)) {
      setFormError(
        `Insufficient balance. You have ${currentBalance} ${selectedToken.symbol}`
      );
      return false;
    }

    setFormError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await sendToken(selectedTokenId, recipient, amount);
    } catch (error) {
      console.error("Transfer error:", error);
      setFormError("Transfer failed. Please try again.");
    }
  };

  // Get the current balance to display - use tokenBalance hook data if available
  const displayBalance = !tokenBalance.isLoading
    ? tokenBalance.balance
    : selectedToken?.balance || "0";

  // Filter out the native token (id=1) from the tokens list
  const filteredTokens = tokens.filter((token) => token.id !== "1");

  const handleReset = () => {
    setAmount("");
    setRecipient("");
  };

  return (
    <Card className="w-full border bg-card/60 backdrop-blur-xs">
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <TransferSuccessMessage
              amount={amount}
              symbol={selectedToken?.symbol || ""}
              hash={hash}
              onReset={handleReset}
            />
          ) : (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <TokenSelectField
                selectedTokenId={selectedTokenId}
                setSelectedTokenId={setSelectedTokenId}
                tokens={filteredTokens}
                displayBalance={displayBalance}
                isPending={isPending}
              />

              <RecipientInputField
                recipient={recipient}
                setRecipient={setRecipient}
                isPending={isPending}
              />

              <AmountInputField
                amount={amount}
                setAmount={setAmount}
                selectedToken={selectedToken}
                displayBalance={displayBalance}
                isPending={isPending}
              />

              {formError && <TransferFormError message={formError} />}

              {isError && error && (
                <TransferFormError
                  message={
                    (error as BaseError).shortMessage || "Transfer failed"
                  }
                />
              )}

              <TransactionStatus hash={hash} isConfirmed={false} />

              <TransferButton
                isPending={isPending}
                selectedToken={selectedToken}
              />
            </motion.form>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default TransferForm;
