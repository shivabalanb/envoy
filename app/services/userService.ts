import { Address } from "viem";
import { User } from "../lib/supabase/types";
import { supabase } from "../lib/supabase/client";

export async function checkUserExists(
  walletAddress: Address
): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error("Error checking user:", error);
    return null;
  }

  return data as User | null;
}
