import {
  fallback,
  unstable_connector,
  Config,
  Transport,
  createConfig,
  http,
  createStorage,
} from "wagmi";
import { mainnet, polygon, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const chains: Config["chains"] = [mainnet, sepolia, polygon];
const transports: Record<Config["chains"][number]["id"], Transport> = {
  [mainnet.id]: http(),
  [sepolia.id]: fallback([
    unstable_connector(injected), // TODO: test this extensively
    http(import.meta.env.VITE_SEPOLIA_RPC_URL),
  ]),
  [polygon.id]: http(),
};

// Set up wagmi config
export const wagmiConfig = createConfig({
  chains,
  transports,
  connectors: [injected()],
  storage: createStorage({ storage: window.localStorage }),
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
