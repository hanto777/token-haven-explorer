
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowUpRight, LockKeyhole, UnlockKeyhole } from "lucide-react";
import { Token } from "@/hooks/useTokens";
import { Link } from "react-router-dom";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useAccount } from "wagmi";

interface TokenCardProps {
  token: Token;
  onDecrypt: (id: string) => void;
}

const TokenCard = ({ token, onDecrypt }: TokenCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { address } = useAccount();
  
  // Use the token balance hook to get real-time balance
  const tokenBalance = useTokenBalance({
    address: address,
    tokenAddress: token.address || 'native',
    enabled: !!address
  });
  
  // Use the fetched balance if available, otherwise use the token's balance
  const displayBalance = !tokenBalance.isLoading ? tokenBalance.balance : token.balance;
  const displaySymbol = tokenBalance.symbol || token.symbol;
  const displayValue = !tokenBalance.isLoading ? tokenBalance.value : token.value;
  
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const cardVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02 }
  };
  
  const handleDecrypt = () => {
    onDecrypt(token.id);
  };
  
  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      animate={isHovered ? "hover" : "initial"}
      variants={cardVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <Card className="overflow-hidden h-full border border-border/40 bg-card/70 backdrop-blur-xs transition-all duration-300 shadow-sm hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                {token.logo ? (
                  <img 
                    src={token.logo} 
                    alt={token.name} 
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      // If image fails to load, show initials instead
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-lg font-semibold">
                    {token.symbol.slice(0, 2)}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{token.name}</h3>
                <p className="text-sm text-muted-foreground">{displaySymbol}</p>
              </div>
            </div>
            
            {token.isEncrypted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDecrypt}
                className="h-8 w-8 rounded-full"
                disabled={token.isDecrypted}
              >
                {token.isDecrypted ? (
                  <UnlockKeyhole className="h-4 w-4" />
                ) : (
                  <LockKeyhole className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-2xl font-medium tracking-tight">
                {token.isEncrypted && !token.isDecrypted ? '•••••••' : `${displayBalance} ${displaySymbol}`}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Value</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-medium">
                  {token.isEncrypted && !token.isDecrypted ? '•••••••' : formatValue(displayValue)}
                </p>
                
                {!token.isEncrypted || token.isDecrypted ? (
                  <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                    token.change24h >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                  </span>
                ) : null}
              </div>
            </div>
            
            <div className="pt-2">
              {(!token.isEncrypted || token.isDecrypted) && (
                <Link to={`/transfer?token=${token.id}`}>
                  <Button 
                    variant="outline" 
                    className="w-full gap-1 group"
                  >
                    Transfer
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TokenCard;
