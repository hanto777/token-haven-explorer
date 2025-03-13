
import { Button } from "@/components/ui/button";
import { useNetwork } from "@/hooks/useNetwork";
import { useWallet } from "@/hooks/useWallet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Chain } from "wagmi";

const NetworkSwitcher = () => {
  const { isConnected } = useWallet();
  const { currentChain, switchNetwork, isSwitchingNetwork, supportedNetworks } = useNetwork();
  
  // Get network icon based on chain ID
  const getNetworkIcon = (chain: Chain) => {
    const icons: Record<number, string> = {
      1: "🌐", // Ethereum Mainnet
      11155111: "🧪", // Sepolia
      137: "🟣", // Polygon
    };
    
    return icons[chain.id] || "🔗";
  };
  
  if (!isConnected) {
    return null;
  }
  
  return (
    <div className="relative flex items-center">
      <Select
        disabled={isSwitchingNetwork}
        value={currentChain?.id.toString()}
        onValueChange={(value) => switchNetwork(parseInt(value))}
      >
        <SelectTrigger className="w-[140px] h-9 gap-1">
          {isSwitchingNetwork ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            currentChain && (
              <span className="mr-1">{getNetworkIcon(currentChain)}</span>
            )
          )}
          <SelectValue placeholder="Select Network">
            {currentChain?.name || "Unknown Network"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="end">
          {supportedNetworks.map((network) => (
            <SelectItem key={network.id} value={network.id.toString()}>
              <div className="flex items-center gap-2">
                <span>{getNetworkIcon(network)}</span>
                {network.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default NetworkSwitcher;
