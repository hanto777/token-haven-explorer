
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Token } from "@/hooks/useTokens";

interface AmountInputFieldProps {
  amount: string;
  setAmount: (value: string) => void;
  selectedToken: Token | null;
  displayBalance: string;
  isPending: boolean;
}

const AmountInputField = ({
  amount,
  setAmount,
  selectedToken,
  displayBalance,
  isPending
}: AmountInputFieldProps) => {
  if (!selectedToken) return null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label htmlFor="amount">Amount</Label>
        <span className="text-xs text-muted-foreground">
          Balance: {displayBalance} {selectedToken.symbol}
        </span>
      </div>
      <div className="relative">
        <Input
          id="amount"
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          disabled={isPending}
          className="pr-16"
          step="any"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span className="text-muted-foreground">
            {selectedToken.symbol}
          </span>
        </div>
      </div>
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-xs h-auto py-1"
        onClick={() => setAmount(displayBalance)}
        disabled={isPending}
      >
        Use Max
      </Button>
    </div>
  );
};

export default AmountInputField;
