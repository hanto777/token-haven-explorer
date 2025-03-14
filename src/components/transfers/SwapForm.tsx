
import { useState, useEffect } from "react";
import { useTokens, Token } from "@/hooks/useTokens";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useAccount, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownUp, ArrowRight, AlertCircle, CheckCircle2, Lock, LockKeyhole } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TransactionStatus from "./TransactionStatus";
import { toast } from "sonner";
import { type BaseError } from "wagmi";
import { CONFIDENTIAL_TOKEN_ADDRESS } from "@/utils/confidentialErc20Abi";

const SwapForm = () => {
  const { tokens, transferState } = useTokens();
  const { address } = useAccount();
  const chainId = useChainId();
  
  const [sourceTokenId, setSourceTokenId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [sourceToken, setSourceToken] = useState<Token | null>(null);
  const [targetToken, setTargetToken] = useState<Token | null>(null);
  const [formError, setFormError] = useState<string>("");
  
  // Extract transfer state properties
  const { hash, isPending, isError, error, isSuccess } = transferState;

  // Check if on Sepolia network
  const isOnSepolia = chainId === sepolia.id;

  // Fetch real-time balance for the selected token
  const tokenBalance = useTokenBalance({
    address: address,
    tokenAddress: sourceToken?.address || '',
    enabled: !!address && !!sourceToken && sourceToken.address !== 'native'
  });
  
  // Set initial token selection
  useEffect(() => {
    if (tokens.length > 0) {
      // Find a non-native, non-confidential token (like USDC on Sepolia)
      const firstRegularToken = tokens.find(t => 
        t.address !== 'native' && 
        !t.isConfidential && 
        t.symbol === 'USDC'
      );
      
      if (firstRegularToken) {
        setSourceTokenId(firstRegularToken.id);
      }
    }
  }, [tokens]);
  
  // Update selected token when ID changes
  useEffect(() => {
    const token = tokens.find(t => t.id === sourceTokenId);
    if (token) {
      setSourceToken(token);
      
      // Find corresponding confidential token
      const confidentialVersion = tokens.find(t => 
        t.isConfidential && 
        t.symbol === `c${token.symbol}`
      );
      
      setTargetToken(confidentialVersion || null);
    } else {
      setSourceToken(null);
      setTargetToken(null);
    }
  }, [sourceTokenId, tokens]);
  
  // Reset the form when a transfer is successful
  useEffect(() => {
    if (isSuccess) {
      // Reset form after 3 seconds
      setTimeout(() => {
        setAmount("");
      }, 3000);
    }
  }, [isSuccess]);
  
  const validateForm = (): boolean => {
    if (!isOnSepolia) {
      setFormError("Confidential tokens are only available on Sepolia testnet");
      return false;
    }
    
    if (!sourceToken) {
      setFormError("Please select a token to wrap");
      return false;
    }
    
    if (!targetToken) {
      setFormError("No confidential version available for this token");
      return false;
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setFormError("Please enter a valid amount");
      return false;
    }
    
    // Use the real-time balance from useTokenBalance if available
    const currentBalance = !tokenBalance.isLoading ? tokenBalance.balance : sourceToken.balance;
    
    if (Number(amount) > Number(currentBalance)) {
      setFormError(`Insufficient balance. You have ${currentBalance} ${sourceToken.symbol}`);
      return false;
    }
    
    setFormError("");
    return true;
  };
  
  const handleWrap = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // For demonstration purposes, we'll simulate a successful wrap
      toast.info("Wrapping tokens...", {
        description: `Converting ${amount} ${sourceToken?.symbol} to ${targetToken?.symbol}`
      });
      
      // In a real implementation, you would call a smart contract method to wrap tokens
      // This would typically involve approving the confidential token contract to spend your tokens
      // and then calling a deposit/wrap function
      
      setTimeout(() => {
        toast.success("Tokens wrapped successfully", {
          description: `${amount} ${sourceToken?.symbol} converted to ${targetToken?.symbol}`
        });
      }, 2000);
      
    } catch (error) {
      console.error("Wrap error:", error);
      setFormError("Failed to wrap tokens. Please try again.");
    }
  };

  // Get the current balance to display
  const displayBalance = !tokenBalance.isLoading 
    ? tokenBalance.balance 
    : sourceToken?.balance || '0';
  
  // Filter only tokens that have confidential versions (for demo, just show USDC on Sepolia)
  const eligibleTokens = tokens.filter(token => 
    !token.isConfidential && 
    token.address !== 'native' &&
    token.symbol === 'USDC' &&
    chainId === sepolia.id
  );
  
  if (!isOnSepolia) {
    return (
      <Card className="w-full border bg-card/60 backdrop-blur-xs">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-xl font-medium">Network Not Supported</h3>
            <p className="text-muted-foreground max-w-md">
              Confidential tokens are only available on the Sepolia testnet. Please switch your network to continue.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
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
              <h3 className="text-xl font-medium">Wrap Successful</h3>
              <p className="text-muted-foreground">
                {amount} {sourceToken?.symbol} has been wrapped to {targetToken?.symbol}
              </p>
              <TransactionStatus hash={hash} isConfirmed={true} />
              <Button
                variant="outline"
                onClick={() => setAmount("")}
                className="mt-4"
              >
                Wrap More Tokens
              </Button>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleWrap}
              className="space-y-6"
            >
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="source-token">From</Label>
                  <Select
                    value={sourceTokenId}
                    onValueChange={setSourceTokenId}
                    disabled={isPending || eligibleTokens.length === 0}
                  >
                    <SelectTrigger id="source-token" className="w-full">
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleTokens.map(token => (
                        <SelectItem key={token.id} value={token.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                              {token.logo ? (
                                <img 
                                  src={token.logo} 
                                  alt={token.name} 
                                  className="w-4 h-4 object-contain"
                                />
                              ) : (
                                <span className="text-xs">{token.symbol.slice(0, 2)}</span>
                              )}
                            </div>
                            <span>{token.symbol}</span>
                            <span className="text-muted-foreground text-xs">
                              {token.id === sourceTokenId ? displayBalance : token.balance}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between">
                      <Label htmlFor="amount">Amount</Label>
                      {sourceToken && (
                        <span className="text-xs text-muted-foreground">
                          Balance: {displayBalance} {sourceToken.symbol}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.0"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        disabled={isPending}
                        className="pr-16"
                        step="any"
                      />
                      {sourceToken && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-muted-foreground">
                            {sourceToken.symbol}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {sourceToken && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs h-auto py-1"
                        onClick={() => setAmount(displayBalance)}
                        disabled={isPending}
                      >
                        Use Max
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center -my-2">
                <div className="bg-muted rounded-full p-2 border">
                  <ArrowDownUp className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-primary/5">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <LockKeyhole className="h-4 w-4" />
                    To (Confidential Version)
                  </Label>
                  <div className="flex items-center gap-2 border rounded-md p-3 bg-background">
                    {targetToken ? (
                      <>
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-muted flex items-center justify-center relative">
                          {targetToken.logo ? (
                            <>
                              <img 
                                src={targetToken.logo} 
                                alt={targetToken.name} 
                                className="w-6 h-6 object-contain"
                              />
                              <div className="absolute bottom-0 right-0 bg-primary rounded-full w-3 h-3 flex items-center justify-center">
                                <Lock className="w-2 h-2 text-primary-foreground" />
                              </div>
                            </>
                          ) : (
                            <span className="text-xs">{targetToken.symbol.slice(0, 2)}</span>
                          )}
                        </div>
                        <div>
                          <span className="font-medium">{targetToken.symbol}</span>
                          <p className="text-xs text-muted-foreground">{targetToken.name}</p>
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Select a token to wrap</span>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <div className="border border-dashed rounded-md p-3 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Confidential tokens hide your balance and transaction amounts, providing privacy on the blockchain.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {formError && (
                <div className="flex items-center gap-2 text-sm text-destructive rounded-md p-2 bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <p>{formError}</p>
                </div>
              )}
              
              {isError && error && (
                <div className="flex items-center gap-2 text-sm text-destructive rounded-md p-2 bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <p>{(error as BaseError).shortMessage || "Wrap failed"}</p>
                </div>
              )}
              
              <TransactionStatus hash={hash} isConfirmed={false} />
              
              <Button
                type="submit"
                disabled={isPending || !sourceToken || !targetToken}
                className="w-full group"
              >
                {isPending ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                    Wrapping Tokens...
                  </>
                ) : (
                  <>
                    Wrap to Confidential Token
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

export default SwapForm;
