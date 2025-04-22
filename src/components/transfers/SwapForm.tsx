
import { useState, useEffect } from "react";
import { useTokens } from "@/hooks/token/useTokens";
import { useTokenBalance } from "@/hooks/token/useTokenBalance";
import { useWallet } from "@/hooks/useWallet";
import { useWrapSwap } from "@/hooks/token/useWrapSwap";
import { sepolia } from "wagmi/chains";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import SwapSuccessMessage from "./SwapSuccessMessage";
import { toast } from "sonner";
import { parseEther } from "viem";

const SwapForm = () => {
  const { tokens } = useTokens();
  const { address } = useWallet();
  const [amount, setAmount] = useState<string>("");

  const {
    wrap,
    isPending: isPendingTransfer,
    isConfirming,
    isSuccess,
    wrapHash,
    wrapError,
  } = useWrapSwap({
    userAddress: address as `0x${string}`,
    chain: sepolia,
  });

  // Fetch real-time balance for ETH
  const tokenBalance = useTokenBalance({
    address: address,
    tokenAddress: "native",
    enabled: !!address,
  });

  const handleWrap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    try {
      const amountInWei = parseEther(amount);
      await wrap(amountInWei.toString());
    } catch (error) {
      console.error("Wrap error:", error);
      toast.error("Failed to wrap tokens", {
        description: "Please try again",
      });
    }
  };

  const handleReset = () => setAmount("");

  if (isSuccess) {
    return (
      <SwapSuccessMessage
        amount={amount}
        sourceSymbol="ETH"
        targetSymbol="WETHc"
        hash={wrapHash}
        onReset={handleReset}
      />
    );
  }

  return (
    <form onSubmit={handleWrap} className="space-y-6">
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <div className="space-y-4">
          <div>
            <Label>Amount</Label>
            <div className="mt-2 relative">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="text-4xl h-auto py-3 px-4"
                step="any"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-base font-medium gap-2"
                >
                  <img
                    src="/lovable-uploads/a0f28912-1505-48a9-bd29-29e5f0ee58d7.png"
                    alt="ETH"
                    className="w-5 h-5"
                  />
                  ETH
                </Button>
              </div>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              ${Number(amount) * 1600} USD
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center -my-3 relative z-10">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full bg-background h-12 w-12"
        >
          <ArrowUpDown className="h-6 w-6" />
        </Button>
      </div>

      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border">
        <div className="space-y-4">
          <div>
            <Label>Amount</Label>
            <div className="mt-2 relative">
              <Input
                type="number"
                value={amount}
                readOnly
                placeholder="0.0"
                className="text-4xl h-auto py-3 px-4"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-base font-medium gap-2"
                >
                  <img
                    src="/lovable-uploads/a0f28912-1505-48a9-bd29-29e5f0ee58d7.png"
                    alt="WETHc"
                    className="w-5 h-5"
                  />
                  WETHc
                  <div className="w-4 h-4 bg-primary/10 rounded-full flex items-center justify-center">
                    🔒
                  </div>
                </Button>
              </div>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              ${Number(amount) * 1600} USD
            </div>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!amount || isPendingTransfer}
        className="w-full text-lg h-12"
        variant="default"
      >
        {isPendingTransfer
          ? isConfirming
            ? "Encrypting transaction..."
            : "Preparing transaction..."
          : "Wrap confidential"}
      </Button>
    </form>
  );
};

export default SwapForm;
