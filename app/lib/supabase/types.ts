import { Address } from "viem";

export type Organization = {
  id: string;
  created_at: string;
  name: string;
  smart_account_address: Address;
  owner_wallet_address: Address;
};

export type User = {
  id: string;
  created_at: string;
  org_id: string;
  wallet_address: Address;
  name: string;
  role: "ADMIN" | "MEMBER";
};
