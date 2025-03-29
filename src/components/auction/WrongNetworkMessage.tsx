
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sepolia } from "wagmi/chains";

interface WrongNetworkMessageProps {
  onSwitchNetwork: () => Promise<boolean>;
}

const WrongNetworkMessage: React.FC<WrongNetworkMessageProps> = ({ onSwitchNetwork }) => {
  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-8 w-8 text-yellow-500" />
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-medium mb-1">Wrong Network</h3>
          <p className="text-muted-foreground mb-4">
            Please connect to the {sepolia.name} network to use this application.
          </p>
          <Button onClick={onSwitchNetwork} variant="outline" className="bg-white">
            Switch to {sepolia.name}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WrongNetworkMessage;
