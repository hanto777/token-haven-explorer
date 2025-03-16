// Update this page (the content is just a fallback if you fail to update the page)
import { useAccount } from "wagmi";
import { DevnetWagmi } from "@/components/confidential/DevnetWagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFhevm } from "@/contexts/FhevmContext";

const Fhevm = () => {
  const { address } = useAccount();
  const { loading, isSepoliaChain } = useFhevm();

  // If not on Sepolia, show switch chain message
  if (!isSepoliaChain) {
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
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <p>Loading FHEVM...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-2xl space-y-4 p-4">
        {address && <DevnetWagmi />}
      </div>
    </div>
  );
};

export default Fhevm;
