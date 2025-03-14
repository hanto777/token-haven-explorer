import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider, createConfig, http, createStorage } from "wagmi";
import { mainnet, polygon, sepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { WalletProvider } from "@/hooks/useWallet";
import { TokenProvider } from "@/providers/TokenProvider";
import { AnimatePresence } from "framer-motion";
import { NetworkProvider } from "@/hooks/useNetwork";
import { useEffect, useState } from "react";
import { init } from "@/lib/fhevm/fhevmjs";

import Header from "./components/layout/Header";
import Dashboard from "./pages/Dashboard";
import Transfer from "./pages/Transfer";
import Fhevm from "./pages/Fhevm";
import Swap from "./pages/Swap";
import NotFound from "./pages/NotFound";

// Set up wagmi config
export const config = createConfig({
  chains: [mainnet, sepolia, polygon],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
  },
  connectors: [
    injected(),
    walletConnect({
      projectId: import.meta.env.VITE_WALLET_CONNECT_ID, // Get from environment variables
    }),
  ],
  storage: createStorage({ storage: window.localStorage }),
});

const queryClient = new QueryClient();

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    init()
      .then(() => {
        setIsInitialized(true);
      })
      .catch(() => setIsInitialized(false));
  }, []);

  if (!isInitialized) return null;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <NetworkProvider>
            <WalletProvider>
              <TokenProvider>
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
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AnimatePresence>
                </BrowserRouter>
              </TokenProvider>
            </WalletProvider>
          </NetworkProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
