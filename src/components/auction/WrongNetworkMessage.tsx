
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WrongNetworkMessage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-2xl space-y-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Wrong Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p>This application only works on Sepolia testnet.</p>
              <p>Please switch your network to Sepolia to continue.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WrongNetworkMessage;
