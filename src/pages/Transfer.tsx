
import PageTransition from "@/components/layout/PageTransition";
import TransferForm from "@/components/transfers/TransferForm";
import NativeTransferForm from "@/components/transfers/NativeTransferForm";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletIcon, CoinsIcon, BanknoteIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Transfer = () => {
  const { isConnected } = useWallet();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialToken = searchParams.get('token');
  const initialTab = initialToken === '1' ? 'native' : 'tokens';

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    navigate(value === 'native' ? '/transfer?token=1' : '/transfer', { replace: true });
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
            Transfer
          </span>
          <h1 className="text-4xl font-semibold tracking-tight mb-3">Send Assets</h1>
          <p className="text-muted-foreground text-balance max-w-xl mx-auto">
            Transfer your assets to any address quickly and securely.
          </p>
        </motion.div>

        {isConnected ? (
          <div className="mt-8 max-w-md mx-auto">
            <Tabs defaultValue={initialTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="native" className="flex items-center gap-2">
                  <BanknoteIcon className="h-4 w-4" />
                  <span>Send Balance</span>
                </TabsTrigger>
                <TabsTrigger value="tokens" className="flex items-center gap-2">
                  <CoinsIcon className="h-4 w-4" />
                  <span>Send Tokens</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="native">
                <NativeTransferForm />
              </TabsContent>
              <TabsContent value="tokens">
                <TransferForm />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex flex-col items-center justify-center mt-12 p-12 border border-dashed rounded-lg bg-muted/30 max-w-md mx-auto"
          >
            <WalletIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Connect your wallet to transfer tokens.
            </p>
            <Button size="lg" className="mt-2">
              Connect Wallet
            </Button>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default Transfer;
