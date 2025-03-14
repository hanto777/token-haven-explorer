// Update this page (the content is just a fallback if you fail to update the page)
import { useAccount, usePublicClient } from "wagmi";

import { useEffect, useState } from "react";
import { createFhevmInstance } from "@/lib/fhevm/fhevmjs";
import { DevnetWagmi } from "@/components/ugly-fhevm/DevnetWagmi";

const Fhevm = () => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeFhevm = async () => {
      if (isConnected) {
        await createFhevmInstance();
        setLoading(false);
      }
    };

    initializeFhevm();
  }, [isConnected]);

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
        {address && <DevnetWagmi account={address} />}
      </div>
    </div>
  );
};

export default Fhevm;
