
import PageTransition from "@/components/layout/PageTransition";
import { useWallet } from "@/hooks/useWallet";
import WalletNotConnected from "@/components/wallet/WalletNotConnected";
import SwapForm from "@/components/transfers/SwapForm";
import { motion } from "framer-motion";

const Swap = () => {
  const { isConnected } = useWallet();

  return (
    <PageTransition>
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-12 text-center"
        >
          <h1 className="font-medium text-6xl mb-4">Swap confidential</h1>
          <p className="text-muted-foreground text-lg">
            Swap your tokens to confidential versions for enhanced privacy.
          </p>
        </motion.div>

        {isConnected ? (
          <div className="mt-8 max-w-xl mx-auto">
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
