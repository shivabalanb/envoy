import { Address } from "viem";

export type User = {
  id: string;
  created_at: string;
  org_id: string | null;
  wallet_address: Address;
  name: string;
};

export type Organization = {
  id: string;
  name: string;
  smart_wallet_address: Address;
  owner_wallet_address: Address;
};

export type Card = {
  id: string;
  created_at: string;
  org_id: string | null;
  user_id: string;
  whitelist: string[];
};
