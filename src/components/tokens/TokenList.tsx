
import { useState, useEffect } from "react";
import { useTokens, Token } from "@/hooks/useTokens";
import TokenCard from "./TokenCard";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const TokenList = () => {
  const { tokens, isLoading, decryptToken } = useTokens();
  const [displayedTokens, setDisplayedTokens] = useState<Token[]>([]);
  
  // Stagger the loading of tokens for a nicer visual effect
  useEffect(() => {
    if (!isLoading && tokens.length > 0) {
      tokens.forEach((token, index) => {
        setTimeout(() => {
          setDisplayedTokens(prev => [...prev, token]);
        }, index * 100);
      });
    } else {
      setDisplayedTokens([]);
    }
  }, [tokens, isLoading]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-[220px]">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }
  
  if (tokens.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium">No tokens found</h3>
        <p className="text-muted-foreground mt-2">Connect your wallet to view your tokens</p>
      </div>
    );
  }
  
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AnimatePresence>
        {displayedTokens.map((token) => (
          <motion.div 
            key={token.id}
            variants={item}
            exit={{ opacity: 0, y: -20 }}
            className="h-full"
          >
            <TokenCard token={token} onDecrypt={decryptToken} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default TokenList;
