import { Address } from "viem";
import { User } from "../lib/supabase/types";
import { supabase } from "../lib/supabase/client";

export async function checkUserExists(
  _walletAddress: Address
): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", _walletAddress.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error("Error checking user:", error);
    return null;
  }

  return data as User | null;
}

export async function createUser(_name: string,_wallet_address: Address) {
  const alreadyExists = await checkUserExists(_wallet_address)
  if(alreadyExists){
    throw new Error("User already exists");
  }
  const { data, error } = await supabase
    .from("users")
    .insert({
      name: _name.toLowerCase(),
      wallet_address: _wallet_address.toLowerCase(),
      org_id: null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating user:", error);
    throw error;
  }

  return data;
}
