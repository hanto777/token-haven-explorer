
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { 
  WagmiProvider, 
  createConfig, 
  http,
  createStorage
} from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';
import { WalletProvider } from "@/hooks/useWallet";
import { TokenProvider } from "@/hooks/useTokens";
import { AnimatePresence } from "framer-motion";

import Header from "./components/layout/Header";
import Dashboard from "./pages/Dashboard";
import Transfer from "./pages/Transfer";
import NotFound from "./pages/NotFound";

// Set up wagmi config
const config = createConfig({
  chains: [mainnet, polygon, optimism, arbitrum],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
  },
  connectors: [
    injected(),
    walletConnect({
      projectId: 'YOUR_PROJECT_ID', // For demo purposes
    }),
  ],
  storage: createStorage({ storage: window.localStorage }),
});

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
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
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </BrowserRouter>
          </TokenProvider>
        </WalletProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
