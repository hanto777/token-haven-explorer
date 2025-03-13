
import PageTransition from "@/components/layout/PageTransition";
import TokenList from "@/components/tokens/TokenList";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { WalletIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";

const Dashboard = () => {
  const { isConnected, connect } = useWallet();
  const { address } = useAccount();

  const handleConnect = () => {
    if (!isConnected && connect) {
      connect();
    }
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 text-center"
        >
          <span className="inline-block text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full mb-2">
            Dashboard
          </span>
          <h1 className="text-4xl font-semibold tracking-tight mb-3">Your Token Portfolio</h1>
          <p className="text-muted-foreground text-balance max-w-xl mx-auto">
            View, manage, and transfer your tokens securely from a single dashboard. Encrypted tokens need to be decrypted before transferring.
          </p>
          {address && (
            <div className="mt-2 text-sm text-muted-foreground">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          )}
        </motion.div>

        {isConnected ? (
          <div className="mt-12">
            <TokenList />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex flex-col items-center justify-center mt-12 p-12 border border-dashed rounded-lg bg-muted/30"
          >
            <WalletIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Connect your wallet to view your token balances and manage your portfolio.
            </p>
            <Button size="lg" className="mt-2" onClick={handleConnect}>
              Connect Wallet
            </Button>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default Dashboard;
