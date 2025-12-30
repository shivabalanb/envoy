import { Address } from "viem";
import { Card } from "../lib/supabase/types";
import { supabase } from "../lib/supabase/client";

export async function checkCardExists(_card_id: string): Promise<Card | null> {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("id", _card_id)
    .maybeSingle();

  if (error) {
    console.error("Error checking card:", error);
    return null;
  }

  return data as Card | null;
}

export async function createCard(
  _user_id: string,
  _whitelist: Address[],
  _org_id?: string | null
) {
  const { data, error } = await supabase
    .from("cards")
    .insert({
      user_id: _user_id,
      org_id: _org_id || null,
      whitelist: _whitelist.map((addr) => addr.toLowerCase()),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating card:", error);
    throw error;
  }

  return data;
}
