"use client";
import { useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { redirect } from "next/navigation";
import OnboardForm from "./components/OnboardForm";
import { createUser } from "./services/userService";
import { Address } from "viem";
import { Spinner } from "@heroui/react";

export default function Home() {
  const { isWalletConnected, isNewUser, isLoading, address, refetch } =
    useAuth();

  useEffect(() => {
    if (!isLoading && isWalletConnected && !isNewUser) {
      redirect("/dashboard");
    }
  }, [isLoading, isWalletConnected, isNewUser]);

  async function handleOnboardSubmit(name: string, walletAddress?: Address) {
    const addressToUse = walletAddress ?? address!;
    try {
      await createUser(name, addressToUse);
      await refetch();
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center">
        <Spinner color="warning" size="lg" />
        <p className="mt-4 text-muted">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center px-6">
      {!isWalletConnected && (
        <div className="text-center max-w-2xl opacity-0 animate-fade-in relative">
          {/* Decorative stars around the hero content */}
          <div className="absolute -top-8 left-1/4 w-2 h-2 bg-amber-400/60 rounded-full blur-[0.5px] animate-pulse" style={{ animationDelay: '0s' }} />
          <div className="absolute -top-4 right-1/4 w-1.5 h-1.5 bg-white/50 rounded-full blur-[0.5px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 -right-8 w-2 h-2 bg-amber-300/70 rounded-full blur-[0.5px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 -left-6 w-1.5 h-1.5 bg-white/40 rounded-full blur-[0.5px] animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/4 -left-8 w-2.5 h-2.5 bg-amber-400/50 rounded-full blur-[1px] animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-16 -right-4 w-1.5 h-1.5 bg-white/45 rounded-full blur-[0.5px] animate-pulse" style={{ animationDelay: '2.5s' }} />
          <div className="absolute bottom-8 left-[-12px] w-1 h-1 bg-amber-300/60 rounded-full blur-[0.5px] animate-pulse" style={{ animationDelay: '3s' }} />
          <div className="absolute bottom-16 right-[-8px] w-1.5 h-1.5 bg-white/35 rounded-full blur-[0.5px] animate-pulse" style={{ animationDelay: '1.2s' }} />
          <div className="absolute top-1/4 left-[-16px] w-2 h-2 bg-amber-400/45 rounded-full blur-[0.5px] animate-pulse" style={{ animationDelay: '0.8s' }} />
          <div className="absolute bottom-1/3 right-[-12px] w-1 h-1 bg-white/50 rounded-full blur-[0.5px] animate-pulse" style={{ animationDelay: '2.2s' }} />
          
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Decentralized</span>
              <br />
              Corporate Spending
            </h1>
            <p className="text-xl text-muted mb-10 max-w-lg mx-auto">
              Issue spending cards to your team with daily limits. 
              Powered by smart accounts and delegation.
            </p>
            <div className="envoy-card p-8 inline-block relative z-10">
              <p className="text-muted mb-4">Connect your wallet to get started</p>
              <div className="flex justify-center">
                {/* The ConnectButton in navbar handles this */}
                <p className="text-sm text-muted">
                  Click the <span className="text-amber-500">Connect Wallet</span> button above
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isWalletConnected && isNewUser && (
        <div className="w-full max-w-md opacity-0 animate-fade-in relative">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to Envoy</h1>
            <p className="text-muted">Let&apos;s set up your account</p>
          </div>
          {/* Decorative stars around the form card */}
          <div className="absolute -top-2 -left-2 w-2 h-2 bg-amber-400/60 rounded-full blur-[0.5px] animate-pulse" style={{ animationDelay: '0s' }} />
          <div className="absolute -top-3 right-12 w-1.5 h-1.5 bg-white/50 rounded-full blur-[0.5px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 -right-3 w-2 h-2 bg-amber-300/70 rounded-full blur-[0.5px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-2 left-16 w-1.5 h-1.5 bg-white/40 rounded-full blur-[0.5px] animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/4 -left-4 w-2.5 h-2.5 bg-amber-400/50 rounded-full blur-[1px] animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-12 -right-2 w-1.5 h-1.5 bg-white/45 rounded-full blur-[0.5px] animate-pulse" style={{ animationDelay: '2.5s' }} />
          <div className="absolute top-20 left-[-12px] w-1 h-1 bg-amber-300/60 rounded-full blur-[0.5px] animate-pulse" style={{ animationDelay: '3s' }} />
          <div className="absolute bottom-12 right-[-8px] w-1.5 h-1.5 bg-white/35 rounded-full blur-[0.5px] animate-pulse" style={{ animationDelay: '1.2s' }} />
          
          <div className="envoy-card p-8 relative z-10">
            <OnboardForm onSubmit={handleOnboardSubmit} />
          </div>
        </div>
      )}
    </main>
  );
}
