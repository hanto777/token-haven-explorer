
import { useState } from "react";
import { useTokens } from "@/hooks/useTokens";
import { useAccount } from "wagmi";
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
import { ArrowRight, AlertCircle, LockIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TransactionStatus from "./TransactionStatus";
import TransferFormError from "./TransferFormError";
import TransferSuccessMessage from "./TransferSuccessMessage";
import { sepolia } from "wagmi/chains";
import { useNetwork } from "@/hooks/useNetwork";
import { useToast } from "@/components/ui/use-toast";

const ConfidentialTransferForm = () => {
  const { tokens, transferState } = useTokens();
  const { address } = useAccount();
  const { network, switchNetwork } = useNetwork();
  const { toast } = useToast();
  
  const [selectedTokenId, setSelectedTokenId] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  
  // Extract transfer state properties
  const { hash, isPending, isError, error, isSuccess } = transferState;
  
  // Filter tokens to only show confidential tokens
  const confidentialTokens = tokens.filter(token => token.isConfidential);
  
  // Check if user is on the right network (Sepolia)
  const isOnSepolia = network?.id === sepolia.id;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is on Sepolia network
    if (!isOnSepolia) {
      toast({
        title: "Wrong Network",
        description: "Confidential tokens are only available on Sepolia testnet. Please switch networks.",
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
    
    // Mock confidential transfer logic
    try {
      toast({
        title: "Preparing Confidential Transfer",
        description: "Generating encrypted proof for your transaction...",
      });
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate a confidential transfer (this would be a real transaction in production)
      // In a real implementation, we would use the confidential transfer functionality
      const selectedToken = tokens.find(t => t.id === selectedTokenId);
      
      toast({
        title: "Transfer Initiated",
        description: `Sending ${amount} ${selectedToken?.symbol} confidentially...`,
      });
    } catch (error) {
      console.error("Confidential transfer error:", error);
      setFormError("Transfer failed. Please try again.");
    }
  };
  
  const handleReset = () => {
    setAmount("");
    setRecipient("");
  };

  // If no confidential tokens available, show proper message
  if (confidentialTokens.length === 0) {
    return (
      <Card className="w-full border bg-card/60 backdrop-blur-xs">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
              <LockIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium">No Confidential Tokens</h3>
            <p className="text-muted-foreground max-w-xs">
              You don't have any confidential tokens. You can swap regular tokens for confidential tokens in the Swap page.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.href = '/swap'}
            >
              Go to Swap
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full border bg-card/60 backdrop-blur-xs">
      <CardContent className="p-6">
        {!isOnSepolia && (
          <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <div className="flex-1 text-sm">
              Confidential tokens are only available on Sepolia testnet.
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => switchNetwork && switchNetwork(sepolia.id)}
              className="text-xs border-amber-300 dark:border-amber-700"
            >
              Switch to Sepolia
            </Button>
          </div>
        )}
      
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <TransferSuccessMessage
              amount={amount}
              symbol={tokens.find(t => t.id === selectedTokenId)?.symbol || "tokens"}
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
                <Label htmlFor="token">Confidential Token</Label>
                <Select
                  value={selectedTokenId}
                  onValueChange={setSelectedTokenId}
                  disabled={isPending || !isOnSepolia}
                >
                  <SelectTrigger id="token" className="w-full">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    {confidentialTokens.map(token => (
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
                            {token.isDecrypted ? token.balance : "Encrypted"}
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
                  disabled={isPending || !isOnSepolia}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="amount">Amount</Label>
                  {selectedTokenId && (
                    <span className="text-xs text-muted-foreground">
                      {!tokens.find(t => t.id === selectedTokenId)?.isDecrypted && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs h-auto py-0 px-1"
                          onClick={() => tokens.find(t => t.id === selectedTokenId) && 
                            tokens.find(t => t.id === selectedTokenId)?.isDecrypted === false && 
                            useTokens().decryptToken(selectedTokenId)}
                        >
                          Decrypt Balance
                        </Button>
                      )}
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
                    disabled={isPending || !isOnSepolia}
                    className="pr-16"
                    step="any"
                  />
                  {selectedTokenId && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-muted-foreground">
                        {tokens.find(t => t.id === selectedTokenId)?.symbol}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <TransferFormError message={formError} />
              
              <TransactionStatus hash={hash} isConfirmed={false} />
              
              <Button
                type="submit"
                disabled={isPending || !isOnSepolia}
                className="w-full group"
              >
                {isPending ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                    Processing Transfer...
                  </>
                ) : (
                  <>
                    Send Confidential Tokens
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
              
              {!isOnSepolia && (
                <div className="text-center text-sm text-muted-foreground">
                  You need to switch to Sepolia testnet to send confidential tokens.
                </div>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default ConfidentialTransferForm;
