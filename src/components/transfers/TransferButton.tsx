import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Token } from "@/types/tokenTypes";

interface TransferButtonProps {
  isEncrypting: boolean;
  isPending: boolean;
  selectedToken: Token | null;
}

const TransferButton = ({
  isEncrypting,
  isPending,
  selectedToken,
}: TransferButtonProps) => {
  return (
    <Button
      type="submit"
      disabled={isPending || !selectedToken}
      className="w-full group"
    >
      {isEncrypting ? (
        <>
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
          Encrypting Transaction...
        </>
      ) : isPending ? (
        <>
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
          Confirming Transaction...
        </>
      ) : (
        <>
          Send {selectedToken?.symbol}
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </>
      )}
    </Button>
  );
};

export default TransferButton;
