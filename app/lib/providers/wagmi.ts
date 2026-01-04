import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "envoy",
  projectId: "6957192661fdd1b73bc6d29a03ca7712",
  chains: [mainnet,sepolia],
  ssr: false,
});
