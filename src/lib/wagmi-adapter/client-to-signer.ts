
import { useChainId, type PublicClient, useConfig } from "wagmi";
import { ethers } from "ethers";

export const clientToSigner = (publicClient: PublicClient) => {
  // Use publicClient.account and chain directly
  const chain = publicClient.chain;
  const account = publicClient.account;

  if (!chain || !account) {
    throw new Error("Chain or account not found");
  }

  // Create mock provider
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: undefined,
  };

  // Create a provider using the network configuration
  const provider = new ethers.JsonRpcProvider(chain.rpcUrls.default.http[0], network);

  // Create and return the signer
  const signer = new ethers.JsonRpcSigner(provider, account.address);

  return signer;
};
