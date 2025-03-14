
import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { getNativeToken } from "@/utils/tokenUtils";
import { useNativeTransfer } from "@/hooks/useNativeTransfer";
import { type BaseError } from "wagmi";

// Import our newly created components
import TransferSuccessMessage from "./TransferSuccessMessage";
import TransferFormError from "./TransferFormError";
import TransactionStatus from "./TransactionStatus";
import RecipientInputField from "./RecipientInputField";
import NativeTokenHeader from "./native/NativeTokenHeader";
import NativeAmountInput from "./native/NativeAmountInput";
import NativeTransferButton from "./native/NativeTransferButton";

const NativeTransferForm = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  
  // Get native token data
  const nativeToken = getNativeToken(chainId);

  // Fetch real-time balance for the native token
  const tokenBalance = useTokenBalance({
    address: address,
    tokenAddress: 'native',
    enabled: !!address
  });

  // Use our custom hook for transfer logic
  const { 
    hash, 
    error, 
    formError, 
    isPending, 
    isConfirming, 
    isConfirmed,
    isSuccess,
    validateAndSendTransaction,
    resetTransfer
  } = useNativeTransfer({
    onSuccess: () => {
      // Reset form after success with a small delay
      setTimeout(() => {
        setAmount("");
        setRecipient("");
        resetTransfer();
      }, 3000);
    }
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    validateAndSendTransaction(recipient, amount, tokenBalance.balance);
  };
  
  const handleReset = () => {
    resetTransfer();
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
              symbol={tokenBalance.symbol || ''} 
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
              <NativeTokenHeader 
                nativeToken={nativeToken}
                tokenBalance={tokenBalance}
              />
              
              <RecipientInputField
                recipient={recipient}
                setRecipient={setRecipient}
                isPending={isPending || isConfirming}
              />
              
              <NativeAmountInput
                amount={amount}
                setAmount={setAmount}
                symbol={tokenBalance.symbol}
                balance={tokenBalance.balance}
                isDisabled={isPending || isConfirming || tokenBalance.isLoading}
              />
              
              <TransferFormError message={formError} />

              {error && (
                <TransferFormError message={(error as BaseError).shortMessage || error.message} />
              )}
              
              <TransactionStatus hash={hash} isConfirmed={isConfirmed} />
              
              <NativeTransferButton
                isPending={isPending}
                isConfirming={isConfirming}
                symbol={tokenBalance.symbol}
              />
            </motion.form>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default NativeTransferForm;
