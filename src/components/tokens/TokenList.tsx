import { useState, useEffect } from "react";
import { useTokens, Token } from "@/hooks/useTokens";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins } from "lucide-react";
import { useSigner } from "@/hooks/useSigner";
import { useNetwork } from "@/hooks/useNetwork";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  LockKeyhole,
  UnlockKeyhole,
  Loader2,
} from "lucide-react";

const TokenList = () => {
  const { tokens, isLoading, decryptToken } = useTokens();
  const [nativeToken, setNativeToken] = useState<Token | null>(null);
  const [otherTokens, setOtherTokens] = useState<Token[]>([]);
  const { signer } = useSigner();

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

  const formatValue = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Native token skeleton */}
        <div className="h-[80px]">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>

        {/* Other tokens skeleton */}
        <div>
          <div className="mb-4">
            <Skeleton className="h-7 w-40" />
          </div>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[60px]">
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

  const TokenRow = ({ token }: { token: Token }) => {
    const { decryptedBalance, isDecrypting, decrypt } = useEncryptedBalance({ signer });

    const handleDecrypt = async () => {
      if (!signer) {
        console.error("Signer not initialized - please connect your wallet");
        return;
      }
      try {
        await decrypt();
      } catch (error) {
        console.error("Failed to decrypt balance:", error);
      }
    };

    return (
      <TableRow className="hover:bg-muted/60">
        <TableCell>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {token.logo ? (
                <img
                  src={token.logo}
                  alt={token.name}
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span className="text-sm font-semibold">
                  {token.symbol.slice(0, 2)}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium">{token.name}</p>
              <p className="text-xs text-muted-foreground">{token.symbol}</p>
            </div>
          </div>
        </TableCell>
        <TableCell>
          {token.isEncrypted ? (
            token.isDecrypted ? (
              decryptedBalance
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDecrypt}
                className="h-6 gap-1"
                disabled={isDecrypting}
              >
                {isDecrypting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Decrypting...</span>
                  </>
                ) : (
                  <>
                    <LockKeyhole className="h-3 w-3" />
                    <span>Decrypt</span>
                  </>
                )}
              </Button>
            )
          ) : (
            token.balance
          )}
        </TableCell>
        <TableCell>
          {!token.isEncrypted && formatValue(token.value)}
          {token.isEncrypted && token.isDecrypted && decryptedBalance}
        </TableCell>
        <TableCell>
          {!token.isEncrypted || token.isDecrypted ? (
            <span
              className={`text-xs px-1.5 py-0.5 rounded-md ${
                token.change24h >= 0
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {token.change24h >= 0 ? "+" : ""}
              {token.change24h.toFixed(2)}%
            </span>
          ) : null}
        </TableCell>
        <TableCell>
          {(!token.isEncrypted || token.isDecrypted) && (
            <Link to={`/transfer?token=${token.id}`}>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <ArrowUpRight className="h-4 w-4" />
                <span className="sr-only">Transfer</span>
              </Button>
            </Link>
          )}
        </TableCell>
      </TableRow>
    );
  };

  const useEncryptedBalance = ({ signer }: { signer: any }) => {
    return {
      decryptedBalance: "Encrypted",
      lastUpdated: "",
      isDecrypting: false,
      decrypt: async () => {},
      error: null,
    };
  };

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
          <div className="w-full overflow-hidden rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>24h</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TokenRow token={nativeToken} />
              </TableBody>
            </Table>
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
          <div className="w-full overflow-hidden rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>24h</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {otherTokens.map((token) => (
                    <motion.tr
                      key={token.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b hover:bg-muted/60"
                    >
                      <TokenRow token={token} />
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TokenList;
