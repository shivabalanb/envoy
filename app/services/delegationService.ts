"use client";

/**
 * IMPORTANT: This service ONLY uses MetaMask Smart Accounts Kit methods.
 * - requestExecutionPermissions (from erc7715ProviderActions)
 * - sendTransactionWithDelegation (from erc7710WalletActions)
 *
 * We do NOT use viem/experimental methods (sendCalls, grantPermissions, etc.)
 * as they are not fully supported by MetaMask Flask.
 *
 * For smart account deployment, we use a bundler (Pimlico) to send ERC-4337 user operations.
 */

import {
  Address,
  WalletClient,
  parseAbi,
  parseEther,
  createPublicClient,
  http,
  encodeFunctionData,
  PublicClient,
  Transport,
  Chain,
  Account,
  SignableMessage,
  TypedDataDefinition,
  keccak256,
  stringToBytes,
  numberToBytes,
} from "viem";
import { sepolia } from "viem/chains";
import { createSmartAccountClient } from "permissionless";
import {
  erc7715ProviderActions,
  erc7710WalletActions,
} from "@metamask/smart-accounts-kit/actions";
import {
  createDelegation,
  createExecution,
  ExecutionMode,
  getSmartAccountsEnvironment,
  Implementation,
  SmartAccountsEnvironment,
  toMetaMaskSmartAccount,
  ToMetaMaskSmartAccountReturnType,
} from "@metamask/smart-accounts-kit";
import { DelegationManager } from "@metamask/smart-accounts-kit/contracts";
import { supabase } from "../lib/supabase/client";

export async function issueCard(
  limitETH: string,
  delegateeAddress: Address,
  delegatorAccount: ToMetaMaskSmartAccountReturnType<Implementation.Hybrid>,
  environment: SmartAccountsEnvironment,
  options?: {
    periodDuration?: number; // in seconds, defaults to 86400 (1 day)
    startDate?: number; // unix timestamp, defaults to now
  }
) {
  const startDate = options?.startDate || Math.floor(Date.now() / 1000);
  const periodDuration = options?.periodDuration || 86400; // Default to 1 day

  const delegation = createDelegation({
    to: delegateeAddress,
    from: delegatorAccount.address,
    environment: environment,
    scope: {
      type: "nativeTokenPeriodTransfer",
      periodAmount: parseEther(limitETH),
      periodDuration,
      startDate,
    },
  });

  const signature = await delegatorAccount.signDelegation({ delegation });
  console.log("Delegation created:", delegation, signature);

  // Store delegation in database
  const delegationData = JSON.stringify({
    delegation,
    signature,
    delegateeAddress,
    delegatorAddress: delegatorAccount.address,
    limitETH,
    createdAt: new Date().toISOString(),
  });

  // Store in cards table
  const { data, error } = await supabase
    .from("cards")
    .insert({
      delegation_blob: delegationData,
      issued_to: delegateeAddress,
    })
    .select()
    .single();

  if (error) {
    console.error("Error storing delegation:", error);
    throw new Error(`Failed to store delegation: ${error.message}`);
  } else {
    console.log("Delegation stored in DB with card ID:", data.id);
  }

  return { delegation, signature, cardId: data.id };
}

export async function getDelegationFromDB(cardId: string) {
  const { data, error } = await supabase
    .from("cards")
    .select("delegation_blob")
    .eq("id", cardId)
    .single();

  if (error || !data?.delegation_blob) {
    throw new Error("Delegation not found in database");
  }

  const parsed = JSON.parse(data.delegation_blob);
  return parsed;
}

export async function payWithCard(
  cardId: string,
  recipientAddress: Address,
  amountETH: string,
  walletClient: WalletClient
): Promise<`0x${string}`> {
  console.log("Preparing to spend...");

  // 1. Retrieve delegation from DB
  const cardFromDB = await getDelegationFromDB(cardId);

  // Reconstruct the signed delegation object
  const signedDelegation = {
    ...cardFromDB.delegation,
    signature: cardFromDB.signature,
  };

  // 2. Get environment and delegation manager address
  const environment = getSmartAccountsEnvironment(sepolia.id);
  const delegationManagerAddress = environment.DelegationManager;

  // 3. Create execution for ETH transfer
  const execution = createExecution({
    target: recipientAddress,
    value: parseEther(amountETH),
    callData: "0x", // No special data for simple ETH transfer
  });

  // 4. Encode the redemption call data
  const redeemDelegationCalldata = DelegationManager.encode.redeemDelegations({
    delegations: [[signedDelegation]], // Array of delegation arrays (batch support)
    modes: [ExecutionMode.SingleDefault],
    executions: [[execution]], // Array of execution arrays (batch support)
  });

  // 5. Send the transaction
  const [account] = await walletClient.getAddresses();
  if (!account) {
    throw new Error("No wallet connected");
  }

  const txHash = await walletClient.sendTransaction({
    to: delegationManagerAddress,
    data: redeemDelegationCalldata,
    account: account,
    chain: sepolia,
  });

  console.log("Payment Successful! Hash:", txHash);
  return txHash;
}
