"use client";
import { useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { redirect } from "next/navigation";
import OnboardForm from "./components/OnboardForm";
import { createUser } from "./services/userService";
import { Address } from "viem";

export default function Home() {
  const { isWalletConnected, isNewUser, isLoading, address, refetch } =
    useAuth();
  useEffect(() => {
    if (!isLoading && isWalletConnected && !isNewUser) {
      console.log("redirecting existing user...");
      redirect("/dashboard");
    }
  }, [isLoading, isWalletConnected, isNewUser]);

  async function handleOnboardSubmit( _name: string,_address?: Address) {
    const walletAddress = _address ?? address!;
    try {
      await createUser(_name,walletAddress);
      await refetch();
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-16 px-16 ">
        Loading...
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-16 px-16 ">
      {!isWalletConnected && <h1>Connect your wallet</h1>}
      {isWalletConnected && isNewUser && (
        <div className=" p-4 w-sm">
          <h1>Let&apos;s get you onboarded!</h1>
          <OnboardForm onSubmit={handleOnboardSubmit} />
        </div>
      )}
    </main>
  );
}
