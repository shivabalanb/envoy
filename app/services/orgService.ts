"use client";

import { Address, WalletClient, formatEther, parseEther } from "viem";
import { createPublicClient, http, type PublicClient } from "viem";
import { sepolia } from "viem/chains";
import { supabase } from "../lib/supabase/client";
import { deploySmartAccount } from "./smartAccountService";
import { Organization } from "../lib/supabase/types";

export function getPublicClient(): PublicClient {
  return createPublicClient({
    chain: sepolia,
    transport: http(
      "https://eth-sepolia.g.alchemy.com/v2/euJp53PODQmQLSIuUpjlcMeQNtUBEtvT"
    ),
  });
}

export async function createOrg(
  _org_name: string,
  _owner_wallet_address: Address,
  _wallet_client: WalletClient
) {
  const alreadyExists = await checkOrgExistsByName(_org_name);
  if (alreadyExists) {
    throw new Error("Org already exists");
  }

  const publicClient = getPublicClient();
  const smartAccount = await createSmartAccount(
    publicClient,
    _wallet_client,
    _owner_wallet_address,
    _org_name
  );

  await deploySmartAccount(smartAccount, _wallet_client, publicClient);

  // Fund the smart account
  const [connectedAddress] = await _wallet_client.getAddresses();
  if (!connectedAddress) {
    throw new Error("No wallet connected");
  }

  console.log(`Funding smart account with 0.01 ETH...`);
  const fundHash = await _wallet_client.sendTransaction({
    account: connectedAddress as `0x${string}`,
    chain: sepolia,
    to: smartAccount.address,
    value: parseEther("0.01"),
  });

  await publicClient.waitForTransactionReceipt({ hash: fundHash });
  console.log("Funding transaction confirmed:", fundHash);

  // Note: Permissions are now created per-card, not per-org
  // So we don't create delegation_data here anymore

  const { data, error } = await supabase
    .from("organizations")
    .insert({
      name: _org_name.toLowerCase(),
      smart_wallet_address: smartAccount.address.toLowerCase(),
      owner_wallet_address: _owner_wallet_address.toLowerCase(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating org:", error);
    throw error;
  }

  return data;
}

export async function getSmartAccountBalance(
  smartAccountAddress: Address
): Promise<string> {
  const publicClient = getPublicClient();
  const balance = await publicClient.getBalance({
    address: smartAccountAddress,
  });
  return formatEther(balance);
}

export async function checkOrgExistsByName(orgName: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("organizations")
    .select("id")
    .eq("name", orgName.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error("Error checking org:", error);
    return false;
  }

  return !!data;
}

export async function getOrgById(orgId: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching org:", error);
    return null;
  }

  return data as Organization | null;
}

export async function joinOrg(
  orgId: string,
  userWalletAddress: Address
): Promise<void> {
  // Check if org exists
  const org = await getOrgById(orgId);
  if (!org) {
    throw new Error("Organization not found");
  }

  // Update user's org_id
  const { error } = await supabase
    .from("users")
    .update({ org_id: orgId })
    .eq("wallet_address", userWalletAddress.toLowerCase());

  if (error) {
    console.error("Error joining org:", error);
    throw new Error(`Failed to join organization: ${error.message}`);
  }
}
