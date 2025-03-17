import { useState, useEffect } from "react";
import { useTokens, Token } from "@/hooks/useTokens";
import TokenCard from "./TokenCard";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins } from "lucide-react";

const TokenList = () => {
  const { tokens, isLoading, decryptToken } = useTokens();
  const [nativeToken, setNativeToken] = useState<Token | null>(null);
  const [otherTokens, setOtherTokens] = useState<Token[]>([]);

  // Separate native token from other tokens
  useEffect(() => {
    if (!isLoading && tokens.length > 0) {
      const native = tokens.find((t) => t.address === "native") || null;
      const others = tokens.filter((t) => t.address !== "native");

      setNativeToken(native);

      // Stagger loading of other tokens
      setOtherTokens([]);
      others.forEach((token, index) => {
        setTimeout(() => {
          setOtherTokens((prev) => [...prev, token]);
        }, index * 100);
      });
    } else {
      setNativeToken(null);
      setOtherTokens([]);
    }
  }, [tokens, isLoading]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Native token skeleton */}
        <div className="h-[220px]">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>

        {/* Other tokens skeleton */}
        <div>
          <div className="mb-4">
            <Skeleton className="h-7 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[220px]">
                <Skeleton className="h-full w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium">No tokens found</h3>
        <p className="text-muted-foreground mt-2">
          Connect your wallet to view your tokens
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Native Currency Section */}
      {nativeToken && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Native Token
          </h2>
          <div className="max-w-md">
            <TokenCard token={nativeToken} decryptToken={decryptToken} />
          </div>
        </motion.div>
      )}

      {/* Other Tokens Section */}
      {otherTokens.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-xl font-medium mb-4">Other Tokens</h2>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {otherTokens.map((token) => (
                <motion.div
                  key={token.id}
                  variants={item}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full"
                >
                  <TokenCard
                    token={token}
                    decryptToken={decryptToken}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default TokenList;
