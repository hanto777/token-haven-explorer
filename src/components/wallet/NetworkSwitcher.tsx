
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNetwork } from "@/hooks/useNetwork";
import { toast } from "sonner";

const NetworkSwitcher = () => {
  const { currentChain, switchNetwork, supportedNetworks } = useNetwork();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (value: string) => {
    const chainId = parseInt(value);
    
    if (switchNetwork) {
      switchNetwork(chainId);
    } else {
      toast.error("Network switching not available");
    }
  };

  return (
    <Select 
      value={currentChain?.id?.toString()} 
      onValueChange={handleChange}
      disabled={!mounted}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Network" />
      </SelectTrigger>
      <SelectContent>
        {supportedNetworks.map((chain) => (
          <SelectItem key={chain.id} value={chain.id.toString()}>
            {chain.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default NetworkSwitcher;
