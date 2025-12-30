import { Address } from "viem";
import { Organization } from "../lib/supabase/types";
import { supabase } from "../lib/supabase/client";
import { createSmartAccountAddress } from "./smartAccountService";

export async function checkOrgExistsById(
  _org_id: string
): Promise<Organization | null> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", _org_id)
    .maybeSingle();

  if (error) {
    console.error("Error checking org by id:", error);
    return null;
  }

  return data as Organization | null;
}

export async function checkOrgExistsByName(
  _org_name: string
): Promise<Organization | null> {
  const { data, error } = await supabase
    .from("organizations")
    .select("id")
    .eq("name", _org_name.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error("Error checking org by name:", error);
    return null;
  }

  return data as Organization | null;
}

export async function createOrg(
  _org_name: string,
  _owner_wallet_address: Address
) {
  const alreadyExists = await checkOrgExistsByName(_org_name);
  if (alreadyExists) {
    throw new Error("Org already exists");
  }

  // Auto-create smart account address
  const smart_account_address = await createSmartAccountAddress(
    _owner_wallet_address
  );

  const { data, error } = await supabase
    .from("organizations")
    .insert({
      name: _org_name.toLowerCase(),
      smart_wallet_address: smart_account_address.toLowerCase(),
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

/**
 * Gets the smart wallet address for an organization
 * This is used by the frontend to send funds to the org's smart account
 */
export async function getOrgSmartWalletAddress(
  orgId: string
): Promise<Address | null> {
  const org = await checkOrgExistsById(orgId);
  return (org?.smart_wallet_address as Address) || null;
}
