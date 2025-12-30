"use client";

import { Address } from "viem";
import { createPublicClient, http, type PublicClient } from "viem";
import { sepolia } from "viem/chains";
import {
  Implementation,
  toMetaMaskSmartAccount,
} from "@metamask/smart-accounts-kit";
import { privateKeyToAccount } from "viem/accounts";

// Create public client for smart account operations
function getPublicClient(): PublicClient {
  return createPublicClient({
    chain: sepolia,
    transport: http(),
  });
}

/**
 * Creates a MetaMask smart account address for an organization
 * The account is counterfactual (address exists but not deployed until first use)
 *
 * The address is deterministic based on the owner address and deploy params.
 * We use a dummy account just to satisfy the function signature - the actual
 * account's private key doesn't affect the computed address.
 *
 * @param ownerAddress - The EOA address that will own the smart account
 * @returns The smart account address
 */
export async function createSmartAccountAddress(
  ownerAddress: Address
): Promise<Address> {
  const publicClient = getPublicClient();

  // Create a dummy account just for address computation
  // The address is deterministic and doesn't depend on this account's private key
  const dummyAccount = privateKeyToAccount(
    "0x0000000000000000000000000000000000000000000000000000000000000001"
  );

  // Create a counterfactual smart account (address only, not deployed)
  // Using Hybrid implementation which supports EOA owners
  const smartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [
      ownerAddress, // EOA owner address
      [], // Passkey signers (empty for now)
      [], // Additional params
      [], // Additional params
    ],
    deploySalt: "0x", // Use default salt
    signer: { account: dummyAccount },
  });

  return smartAccount.address as Address;
}
