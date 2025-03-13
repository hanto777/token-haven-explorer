
import { useEffect, useState } from "react";
import { useConfig, useChainId, useSwitchChain } from "wagmi";
import { mainnet, sepolia, polygon, optimism, arbitrum } from "wagmi/chains";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNetwork } from "@/hooks/useNetwork";
import { toast } from "sonner";

// Import Chain as a type specifically
import type { Chain } from "wagmi/chains";

const SUPPORTED_CHAINS = [
  mainnet,
  sepolia,
  polygon,
  optimism,
  arbitrum,
];

const NetworkSwitcher = () => {
  const { switchNetwork } = useNetwork();
  const config = useConfig();
  const chainId = useChainId();
  const [mounted, setMounted] = useState(false);
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (value: string) => {
    const chainId = parseInt(value);
    
    const chain = SUPPORTED_CHAINS.find((chain) => chain.id === chainId);

    if (chain && switchNetwork) {
      switchNetwork(chain.id);
      toast.success(`Switched to ${chain.name}`);
    } else {
      toast.error("Chain not found");
    }
  };

  return (
    <Select value={chainId?.toString()} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Network" />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_CHAINS.map((chain) => (
          <SelectItem key={chain.id} value={chain.id.toString()}>
            {chain.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default NetworkSwitcher;
