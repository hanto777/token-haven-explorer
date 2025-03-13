
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTokens, Token } from "@/hooks/useTokens";
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
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TransferForm = () => {
  const [searchParams] = useSearchParams();
  const initialTokenId = searchParams.get('token');
  const { tokens, sendToken, isLoading } = useTokens();
  
  const [selectedTokenId, setSelectedTokenId] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [formError, setFormError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  // Set initial token selection from URL params
  useEffect(() => {
    if (initialTokenId && tokens.some(t => t.id === initialTokenId)) {
      setSelectedTokenId(initialTokenId);
    } else if (tokens.length > 0) {
      // Default to first non-encrypted token
      const firstToken = tokens.find(t => !t.isEncrypted);
      if (firstToken) {
        setSelectedTokenId(firstToken.id);
      }
    }
  }, [initialTokenId, tokens]);
  
  // Update selected token when ID changes
  useEffect(() => {
    const token = tokens.find(t => t.id === selectedTokenId);
    setSelectedToken(token || null);
  }, [selectedTokenId, tokens]);
  
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
    
    if (selectedToken && Number(amount) > Number(selectedToken.balance)) {
      setFormError(`Insufficient balance. You have ${selectedToken.balance} ${selectedToken.symbol}`);
      return false;
    }
    
    setFormError("");
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const success = await sendToken(selectedTokenId, recipient, amount);
      
      if (success) {
        setIsSuccess(true);
        // Reset form after 3 seconds
        setTimeout(() => {
          setIsSuccess(false);
          setAmount("");
          setRecipient("");
        }, 3000);
      }
    } catch (error) {
      console.error("Transfer error:", error);
      setFormError("Transfer failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto border bg-card/60 backdrop-blur-xs">
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
                {amount} {selectedToken?.symbol} has been sent to the recipient
              </p>
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
                <Label htmlFor="token">Token</Label>
                <Select
                  value={selectedTokenId}
                  onValueChange={setSelectedTokenId}
                  disabled={isLoading || isSubmitting}
                >
                  <SelectTrigger id="token" className="w-full">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens
                      .filter(token => !token.isEncrypted || token.isDecrypted)
                      .map(token => (
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
                              {token.balance}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="amount">Amount</Label>
                  {selectedToken && (
                    <span className="text-xs text-muted-foreground">
                      Balance: {selectedToken.balance} {selectedToken.symbol}
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
                    disabled={isSubmitting}
                    className="pr-16"
                    step="any"
                  />
                  {selectedToken && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-muted-foreground">
                        {selectedToken.symbol}
                      </span>
                    </div>
                  )}
                </div>
                
                {selectedToken && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-auto py-1"
                    onClick={() => setAmount(selectedToken.balance)}
                    disabled={isSubmitting}
                  >
                    Use Max
                  </Button>
                )}
              </div>
              
              {formError && (
                <div className="flex items-center gap-2 text-sm text-destructive rounded-md p-2 bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <p>{formError}</p>
                </div>
              )}
              
              <Button
                type="submit"
                disabled={isSubmitting || !selectedToken}
                className="w-full group"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                ) : (
                  <>
                    Send {selectedToken?.symbol}
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

export default TransferForm;
