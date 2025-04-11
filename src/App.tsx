
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { WalletProvider } from "@/hooks/useWallet";
import { TokenProvider } from "@/providers/TokenProvider";
import { TransactionProvider } from "@/providers/TransactionProvider";
import { wagmiConfig } from "@/providers/wagmiConfig";
import { AnimatePresence } from "framer-motion";
import { NetworkProvider } from "@/hooks/useNetwork";
import { FhevmProvider } from "@/contexts/FhevmContext";
import { ThemeProvider } from "@/providers/ThemeProvider";

import Header from "./components/layout/Header";
import Dashboard from "./pages/Dashboard";
import Transfer from "./pages/Transfer";
import Fhevm from "./pages/Fhevm";
import Swap from "./pages/Swap";
import NotFound from "./pages/NotFound";
import Auction from "./pages/Auction";
import AuctionMain from "./pages/AuctionMain";
import DeployAuction from "./pages/DeployAuction";

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <NetworkProvider>
            <WalletProvider>
              <FhevmProvider>
                <TokenProvider>
                  <TransactionProvider>
                    <ThemeProvider>
                      <Toaster />
                      <Sonner />
                      <BrowserRouter>
                        <Header />
                        <AnimatePresence mode="wait">
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/transfer" element={<Transfer />} />
                            <Route path="/swap" element={<Swap />} />
                            <Route path="/fhevm" element={<Fhevm />} />
                            <Route path="/auction" element={<Auction />} />
                            <Route path="/auctions" element={<AuctionMain />} />
                            <Route path="/deploy-auction" element={<DeployAuction />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </AnimatePresence>
                      </BrowserRouter>
                    </ThemeProvider>
                  </TransactionProvider>
                </TokenProvider>
              </FhevmProvider>
            </WalletProvider>
          </NetworkProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
