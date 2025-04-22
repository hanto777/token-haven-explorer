import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, LogOut, ChevronDown, UsersRound } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useAppKitAccount } from "@reown/appkit/react";

const ConnectWallet = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { openConnectModal, disconnect } = useWallet();
  const { address, isConnected } = useAppKitAccount();

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      openConnectModal();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.div
            key="connect"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={handleConnect}
              disabled={isLoading}
              className="relative overflow-hidden group"
            >
              <span className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </span>
              {isLoading && (
                <span className="absolute inset-0 flex items-center justify-center bg-primary">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                </span>
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="connected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="outline"
              className="flex cursor-pointer items-center gap-2"
              onClick={() => openConnectModal()}
            >
              <span className="w-2 h-2 bg-green-500"></span>
              {address && formatAddress(address)}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConnectWallet;
