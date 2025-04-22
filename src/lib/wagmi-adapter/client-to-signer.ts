
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { type WalletClient } from "wagmi";

export async function getEthersSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = await provider.getSigner(account.address);
  return signer;
}

export type GetEthersSigner = typeof getEthersSigner;
