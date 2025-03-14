
import { useState } from "react";
import { useTokens } from "@/hooks/useTokens";
import { useAccount } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { sepolia } from "wagmi/chains";
import { useNetwork } from "@/hooks/useNetwork";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import NoConfidentialTokensMessage from "./confidential/NoConfidentialTokensMessage";
import ConfidentialTransferFormFields from "./confidential/ConfidentialTransferFormFields";
import TransferSuccessMessage from "./TransferSuccessMessage";

const ConfidentialTransferForm = () => {
  const { tokens, transferState } = useTokens();
  const { address } = useAccount();
  const { currentChain, switchNetwork } = useNetwork();
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
  const isOnSepolia = currentChain?.id === sepolia.id;
  
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
    return <NoConfidentialTokensMessage />;
  }
  
  return (
    <Card className="w-full border bg-card/60 backdrop-blur-xs">
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <TransferSuccessMessage
              amount={amount}
              symbol={tokens.find(t => t.id === selectedTokenId)?.symbol || "tokens"}
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
