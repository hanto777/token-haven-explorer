import PageTransition from "@/components/layout/PageTransition";
import TransferForm from "@/components/transfers/TransferForm";
import NativeTransferForm from "@/components/transfers/NativeTransferForm";
import ConfidentialTransferForm from "@/components/transfers/ConfidentialTransferForm";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletIcon, CoinsIcon, BanknoteIcon, LockIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import WalletNotConnected from "@/components/wallet/WalletNotConnected";
import UniversalTransferForm from "@/components/transfers/UniversalTransferForm";

const Transfer = () => {
  const { isConnected } = useWallet();

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
            Send Assets
          </h1>
          <p className="text-muted-foreground text-balance max-w-xl mx-auto">
            Transfer your assets to any address securely and easily.
          </p>
        </motion.div>

        {isConnected ? (
          <div className="mt-8 max-w-md mx-auto">
            <UniversalTransferForm />
            {/*             
            <Tabs
              defaultValue={initialTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="native" className="flex items-center gap-2">
                  <BanknoteIcon className="h-4 w-4" />
                  <span>Send Native</span>
                </TabsTrigger>
                <TabsTrigger value="tokens" className="flex items-center gap-2">
                  <CoinsIcon className="h-4 w-4" />
                  <span>Send Tokens</span>
                </TabsTrigger>
                <TabsTrigger
                  value="confidential"
                  className="flex items-center gap-2"
                >
                  <LockIcon className="h-4 w-4" />
                  <span>Confidential</span>
                </TabsTrigger>
                <TabsTrigger
                  value="universal"
                  className="flex items-center gap-2"
                >
                  <span>Universal</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="native">
                <NativeTransferForm />
              </TabsContent>
              <TabsContent value="tokens">
                <TransferForm />
              </TabsContent>
              <TabsContent value="confidential">
                <ConfidentialTransferForm />
              </TabsContent>
              <TabsContent value="universal">
                
              </TabsContent>
            </Tabs> */}
          </div>
        ) : (
          <WalletNotConnected />
        )}
      </div>
    </PageTransition>
  );
};

export default Transfer;
