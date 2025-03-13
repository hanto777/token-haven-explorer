
import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { getNativeToken } from "@/utils/tokenUtils";
import { useNativeTransfer } from "@/hooks/useNativeTransfer";
import TransferSuccessMessage from "./TransferSuccessMessage";
import TransferFormError from "./TransferFormError";
import TransactionStatus from "./TransactionStatus";
import TokenBalanceDisplay from "./TokenBalanceDisplay";

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
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {nativeToken.logo ? (
                      <img 
                        src={nativeToken.logo} 
                        alt={nativeToken.name} 
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      <span className="text-xs">{nativeToken.symbol.slice(0, 2)}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-medium">Send {tokenBalance.symbol}</h3>
                </div>
                
                <TokenBalanceDisplay 
                  balance={tokenBalance.balance} 
                  symbol={tokenBalance.symbol || ''} 
                  isLoading={tokenBalance.isLoading} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  disabled={isPending || isConfirming}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    disabled={isPending || isConfirming}
                    className="pr-16"
                    step="any"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-muted-foreground">
                      {tokenBalance.symbol}
                    </span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-auto py-1"
                  onClick={() => setAmount(tokenBalance.balance)}
                  disabled={isPending || isConfirming || tokenBalance.isLoading}
                >
                  Use Max
                </Button>
              </div>
              
              <TransferFormError message={formError} />

              {error && (
                <TransferFormError message={(error as BaseError).shortMessage || error.message} />
              )}
              
              <TransactionStatus hash={hash} isConfirmed={isConfirmed} />
              
              <Button
                type="submit"
                disabled={isPending || isConfirming || tokenBalance.isLoading}
                className="w-full group"
              >
                {isPending ? (
                  <>Preparing Transaction...</>
                ) : isConfirming ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                    Confirming Transaction...
                  </>
                ) : (
                  <>
                    Send {tokenBalance.symbol}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default NativeTransferForm;
