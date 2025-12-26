'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';

const client = new QueryClient();

const config = getDefaultConfig({
  appName: 'envoy',
  projectId: '6957192661fdd1b73bc6d29a03ca7712',
  chains: [sepolia,],
});

export function Providers({ children }: { children: React.ReactNode }) {
    return (<WagmiProvider config={config}>
          <QueryClientProvider client={client}>
            <RainbowKitProvider>
            {children}
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
    )
}
