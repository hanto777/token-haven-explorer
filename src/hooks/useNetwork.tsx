
import React, { createContext, useContext, useState, useEffect } from "react";
import { sepolia } from "wagmi/chains";
import { useNetwork as useWagmiNetwork } from "wagmi";

interface NetworkContextType {
  chain: {
    id: number;
    name: string;
  } | null;
  isSepoliaChain: boolean;
  switchToSepolia: () => void;
}

const NetworkContext = createContext<NetworkContextType>({
  chain: null,
  isSepoliaChain: false,
  switchToSepolia: () => {},
});

export const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const { chain, switchChain } = useWagmiNetwork();
  const [isSepoliaChain, setIsSepoliaChain] = useState(false);

  useEffect(() => {
    setIsSepoliaChain(chain?.id === sepolia.id);
  }, [chain]);

  const switchToSepolia = async () => {
    try {
      if (switchChain && chain?.id !== sepolia.id) {
        await switchChain({ chainId: sepolia.id });
      }
    } catch (error) {
      console.error("Failed to switch to Sepolia:", error);
    }
  };

  return (
    <NetworkContext.Provider value={{ chain, isSepoliaChain, switchToSepolia }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
