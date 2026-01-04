"use client";

import { Account, Address, Chain, keccak256, parseEther, SignableMessage, stringToBytes, Transport, TypedDataDefinition, WalletClient } from "viem";
import { createPublicClient, http, type PublicClient } from "viem";
import { sepolia } from "viem/chains";
import {
  Implementation,
  toMetaMaskSmartAccount,
  ToMetaMaskSmartAccountReturnType,
} from "@metamask/smart-accounts-kit";

const ALCHEMY_RPC =
  "https://eth-sepolia.g.alchemy.com/v2/euJp53PODQmQLSIuUpjlcMeQNtUBEtvT";

function getPublicClient(): PublicClient {
  return createPublicClient({
    chain: sepolia,
    transport: http(ALCHEMY_RPC),
  });
}
export async function createSmartAccount(
  publicClient: PublicClient,
  walletClient: WalletClient,
  owner: Address,
  orgName: string
) {
  if (walletClient.account) {
    const account = walletClient.account as any;

    // Add signMessage if missing
    if (!account.signMessage) {
      account.signMessage = ({ message }: { message: SignableMessage }) => {
        return walletClient.signMessage({
          account: owner,
          message,
        });
      };
    }

    // Add signTypedData if missing
    if (!account.signTypedData) {
      account.signTypedData = (args: TypedDataDefinition) => {
        return walletClient.signTypedData({
          account: owner,
          ...args,
        });
      };
    }
  }

  const salt = keccak256(stringToBytes(orgName));

  const smartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [owner, [], [], []],
    deploySalt: salt,
    signer: walletClient as WalletClient<Transport, Chain, Account>,
  });

  console.log(smartAccount.address);

  return smartAccount;
}

export async function deploySmartAccount(
  smartAccount: ToMetaMaskSmartAccountReturnType<Implementation.Hybrid>,
  walletClient: WalletClient,
  publicClient: PublicClient
) {
  const { factory, factoryData } = await smartAccount.getFactoryArgs();

  console.log("Deployment Args Debug:", factory, factoryData);

  const deployHash = await walletClient.sendTransaction({
    to: factory,
    data: factoryData,
    account: walletClient.account!,
    chain: sepolia,
  });

  console.log("Deployment Tx Hash:", deployHash);

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: deployHash,
  });

  console.log("done!");

  return receipt;
}