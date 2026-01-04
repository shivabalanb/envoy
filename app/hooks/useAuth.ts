"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { User } from "../lib/supabase/types";
import { checkUserExists } from "../services/userService";

export function useAuth() {
  const { address, isConnected, isConnecting } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkUser = useCallback(async () => {
    if (isConnecting) return;

    if (!isConnected || !address) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const dbUser = await checkUserExists(address);
      setUser(dbUser);
    } catch (error) {
      console.error(error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [isConnecting, address, isConnected]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  return {
    user,
    isLoading: isLoading || isConnecting,
    isNewUser: !isLoading && isConnected && !user,
    isWalletConnected: isConnected,
    address,
    refetch: checkUser,
  };
}
