import PageTransition from "@/components/layout/PageTransition";
import SwapForm from "@/components/transfers/SwapForm";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { WalletIcon, ArrowLeftRight } from "lucide-react";
import { motion } from "framer-motion";
import WalletNotConnected from "@/components/wallet/WalletNotConnected";

const Swap = () => {
  const { isConnected, openConnectModal } = useWallet();

  return (
    <PageTransition>
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-semibold tracking-tight mb-3">
            Swap to Confidential
          </h1>
          <p className="text-muted-foreground text-balance max-w-xl mx-auto">
            Swap your tokens to confidential versions for enhanced privacy.
          </p>
        </motion.div>

        {isConnected ? (
          <div className="mt-8 max-w-md mx-auto">
            <SwapForm />
          </div>
        ) : (
          <WalletNotConnected />
        )}
      </div>
    </PageTransition>
  );
};

export default Swap;
