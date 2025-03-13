
import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { 
  useSendTransaction, 
  useWaitForTransactionReceipt,
  type BaseError
} from "wagmi";
import { parseEther } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { getNativeToken } from "@/utils/tokenUtils";
import { toast } from "sonner";

const NativeTransferForm = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  // Get native token data
  const nativeToken = getNativeToken(chainId);

  // Fetch real-time balance for the native token
  const tokenBalance = useTokenBalance({
    address: address,
    tokenAddress: 'native',
    enabled: !!address
  });

  // Wagmi hooks for transactions
  const { 
    data: hash,
    error,
    isPending,
    sendTransaction 
  } = useSendTransaction();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({ 
    hash, 
  });
  
  // Show transaction result in toast when confirmed
  useEffect(() => {
    if (isConfirmed && hash) {
      setIsSuccess(true);
      toast.success("Transfer successful", {
        description: `Transaction confirmed: ${hash.slice(0, 10)}...${hash.slice(-8)}`
      });
      // Reset form after success
      setTimeout(() => {
        setIsSuccess(false);
        setAmount("");
        setRecipient("");
      }, 3000);
    }
  }, [isConfirmed, hash]);

  // Show error in toast
  useEffect(() => {
    if (error) {
      const errorMessage = (error as BaseError).shortMessage || error.message;
      toast.error("Transfer failed", {
        description: errorMessage
      });
    }
  }, [error]);
  
  const validateForm = (): boolean => {
    if (!recipient || !/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      setFormError("Please enter a valid Ethereum address");
      return false;
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setFormError("Please enter a valid amount");
      return false;
    }
    
    if (Number(amount) > Number(tokenBalance.balance)) {
      setFormError(`Insufficient balance. You have ${tokenBalance.balance} ${tokenBalance.symbol}`);
      return false;
    }
    
    setFormError("");
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      sendTransaction({ 
        to: recipient as `0x${string}`, 
        value: parseEther(amount) 
      });
    } catch (error) {
      console.error("Transfer error:", error);
      setFormError("Transfer failed. Please try again.");
    }
  };
  
  return (
    <Card className="w-full border bg-card/60 backdrop-blur-xs">
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center py-10 text-center space-y-4"
            >
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-medium">Transfer Successful</h3>
              <p className="text-muted-foreground">
                {amount} {tokenBalance.symbol} has been sent to the recipient
              </p>
              {hash && (
                <a 
                  href={`https://etherscan.io/tx/${hash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View transaction
                </a>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setIsSuccess(false);
                  setAmount("");
                  setRecipient("");
                }}
                className="mt-4"
              >
                Make Another Transfer
              </Button>
            </motion.div>
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
                
                <div className="bg-muted/50 rounded-md p-3 mt-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Available Balance:</span>
                    <span className="font-medium">
                      {tokenBalance.isLoading ? (
                        <span className="h-4 w-16 bg-muted animate-pulse rounded"></span>
                      ) : (
                        `${tokenBalance.balance} ${tokenBalance.symbol}`
                      )}
                    </span>
                  </div>
                </div>
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
              
              {formError && (
                <div className="flex items-center gap-2 text-sm text-destructive rounded-md p-2 bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <p>{formError}</p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive rounded-md p-2 bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <p>{(error as BaseError).shortMessage || error.message}</p>
                </div>
              )}
              
              {hash && !isConfirmed && (
                <div className="flex items-center gap-2 text-sm text-primary rounded-md p-2 bg-primary/10">
                  <p>
                    Transaction submitted: {hash.slice(0, 6)}...{hash.slice(-4)}
                  </p>
                </div>
              )}
              
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
