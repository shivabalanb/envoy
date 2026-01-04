"use client";

import { Button, useDisclosure, Chip, Spinner } from "@heroui/react";
import { useAuth } from "../hooks/useAuth";
import { withProtectedRoute } from "../components/ProtectedRoute";
import { Address, formatEther } from "viem";
import { CreateOrgModal } from "../components/modals/CreateOrgModal";
import { IssueCardModal } from "../components/modals/IssueCardModal";
import { PayWithCardModal } from "../components/modals/PayWithCardModal";
import { JoinOrgModal } from "../components/modals/JoinOrgModal";
import { useWalletClient, useAccount, useBalance } from "wagmi";
import {
  createOrg,
  getPublicClient,
  getSmartAccountBalance,
  joinOrg,
} from "../services/orgService";
import { issueCard } from "../services/delegationService";
import { getSmartAccountsEnvironment } from "@metamask/smart-accounts-kit";
import { sepolia } from "viem/chains";
import { createSmartAccount } from "../services/smartAccountService";
import { supabase } from "../lib/supabase/client";
import { useCallback, useEffect, useState } from "react";
import { Organization, Card } from "../lib/supabase/types";

function Dashboard() {
  const createOrgM = useDisclosure();
  const issueCardM = useDisclosure();
  const payWithCardM = useDisclosure();
  const joinOrgM = useDisclosure();
  const { user, refetch } = useAuth();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const { data: walletBalance } = useBalance({ address });

  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [orgBalances, setOrgBalances] = useState<Record<string, string>>({});
  const [copiedOrgId, setCopiedOrgId] = useState<string | null>(null);

  async function copyToClipboard(text: string, orgId: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedOrgId(orgId);
      setTimeout(() => setCopiedOrgId(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }

  // Fetch organizations owned by this user AND organizations user has joined
  const loadOrganizations = useCallback(async () => {
    if (!address || !user) return;
    setIsLoadingOrgs(true);
    try {
      // Fetch orgs where user is owner
      const { data: ownedOrgs, error: ownedError } = await supabase
        .from("organizations")
        .select("*")
        .eq("owner_wallet_address", address.toLowerCase());

      if (ownedError) throw ownedError;

      // Fetch orgs where user has joined (via org_id)
      let joinedOrgs: Organization[] = [];
      if (user.org_id) {
        const { data: joinedData, error: joinedError } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", user.org_id);

        if (joinedError) {
          console.error("Failed to load joined org:", joinedError);
        } else {
          joinedOrgs = joinedData || [];
        }
      }

      // Combine and deduplicate (in case user owns and is also a member)
      const allOrgs = [...(ownedOrgs || []), ...joinedOrgs];
      const uniqueOrgs = allOrgs.filter(
        (org, index, self) => index === self.findIndex((o) => o.id === org.id)
      );

      setOrgs(uniqueOrgs);

      // Fetch balances for each org
      const balances: Record<string, string> = {};
      for (const org of uniqueOrgs) {
        try {
          const balance = await getSmartAccountBalance(
            org.smart_wallet_address
          );
          balances[org.id] = balance;
        } catch {
          balances[org.id] = "0";
        }
      }
      setOrgBalances(balances);
    } catch (error) {
      console.error("Failed to load organizations:", error);
    } finally {
      setIsLoadingOrgs(false);
    }
  }, [address, user]);

  // Fetch cards issued to this user
  const loadCards = useCallback(async () => {
    if (!address) return;
    setIsLoadingCards(true);
    try {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("issued_to", address.toLowerCase());

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error("Failed to load cards:", error);
    } finally {
      setIsLoadingCards(false);
    }
  }, [address]);

  useEffect(() => {
    loadOrganizations();
    loadCards();
  }, [loadOrganizations, loadCards]);

  async function handleOrgSubmit(orgName: string, ownerAddress: Address) {
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }
    try {
      await createOrg(orgName, ownerAddress, walletClient);
      await refetch();
      await loadOrganizations();
    } catch (error) {
      console.error("Failed to create org:", error);
      throw error;
    }
  }

  async function handleJoinOrg(orgId: string) {
    if (!address) {
      throw new Error("Wallet not connected");
    }
    try {
      await joinOrg(orgId, address);
      await refetch(); // Refresh user data to get updated org_id
      await loadOrganizations(); // Reload organizations list
    } catch (error) {
      console.error("Failed to join org:", error);
      throw error;
    }
  }

  async function handleIssueCard(
    delegateeAddress: Address,
    periodLimit: string,
    orgName: string,
    periodDuration: number,
    startDate?: number
  ) {
    if (!walletClient || !address) {
      throw new Error("Wallet not connected");
    }

    try {
      const publicClient = getPublicClient();
      const delegatorAccount = await createSmartAccount(
        publicClient,
        walletClient,
        address,
        orgName
      );

      const environment = getSmartAccountsEnvironment(sepolia.id);

      const result = await issueCard(
        periodLimit,
        delegateeAddress,
        delegatorAccount,
        environment,
        {
          periodDuration,
          startDate,
        }
      );

      console.log("Delegation created:", result);
      return result;
    } catch (error: any) {
      console.error("Failed to issue card:", error);
      throw error;
    }
  }

  // Parse card delegation to get limit
  function getCardLimit(card: Card): string {
    try {
      if (!card.delegation_blob) return "N/A";
      const parsed = JSON.parse(card.delegation_blob);
      return parsed.limitETH || "N/A";
    } catch {
      return "N/A";
    }
  }

  const isAdmin = orgs.length > 0;

  return (
    <div className="w-full min-h-screen pt-20 pb-12 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 opacity-0 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back,{" "}
            <span className="gradient-text">{user?.name || "User"}</span>
          </h1>
          <p className="text-muted text-lg">
            Manage your organizations and spending cards
          </p>
        </div>

        {/* Wallet Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 opacity-0 animate-fade-in animate-delay-1">
          <div className="stat-card">
            <p className="text-muted text-sm mb-1">Connected Wallet</p>
            <p className="font-mono text-sm truncate">
              {address || "Not connected"}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-muted text-sm mb-1">Wallet Balance</p>
            <p className="text-xl font-semibold">
              {walletBalance
                ? `${parseFloat(formatEther(walletBalance.value)).toFixed(4)} ETH`
                : "—"}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-muted text-sm mb-1">Network</p>
            <p className="text-xl font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Sepolia Testnet
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10 opacity-0 animate-fade-in animate-delay-2">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button className="action-btn" onClick={createOrgM.onOpen}>
              + Create Organization
            </button>
            <button className="secondary-btn" onClick={joinOrgM.onOpen}>
              Join Organization
            </button>
            {isAdmin && (
              <button className="secondary-btn" onClick={issueCardM.onOpen}>
                Issue Card
              </button>
            )}
            {cards.length > 0 && (
              <button className="secondary-btn" onClick={payWithCardM.onOpen}>
                Pay with Card
              </button>
            )}
          </div>
        </div>

        {/* Organizations Section */}
        <div className="mb-10 opacity-0 animate-fade-in animate-delay-3">
          <h2 className="text-xl font-semibold mb-4">Your Organizations</h2>
          {isLoadingOrgs ? (
            <div className="flex justify-center py-8">
              <Spinner color="warning" />
            </div>
          ) : orgs.length === 0 ? (
            <div className="envoy-card p-8 text-center">
              <p className="text-muted mb-4">
                You haven&apos;t created any organizations yet
              </p>
              <button className="action-btn" onClick={createOrgM.onOpen}>
                Create Your First Org
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orgs.map((org) => {
                const isOwner =
                  org.owner_wallet_address.toLowerCase() ===
                  address?.toLowerCase();
                return (
                  <div key={org.id} className="envoy-card p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold capitalize">
                          {org.name}
                        </h3>
                        <Chip
                          size="sm"
                          color={isOwner ? "success" : "default"}
                          variant="flat"
                          className="mt-1"
                        >
                          {isOwner ? "Admin" : "Member"}
                        </Chip>
                      </div>
                      <div className="text-right">
                        <p className="text-muted text-sm">Treasury Balance</p>
                        <p className="text-xl font-semibold gradient-text">
                          {orgBalances[org.id]
                            ? `${parseFloat(orgBalances[org.id]).toFixed(4)} ETH`
                            : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-card-border space-y-3">
                      <div>
                        <p className="text-muted text-xs mb-1">
                          Organization ID
                        </p>
                        <button
                          onClick={() => copyToClipboard(org.id, org.id)}
                          className="font-mono text-xs truncate w-full text-left hover:text-amber-400 transition-colors cursor-pointer group flex items-center gap-2"
                          title="Click to copy"
                        >
                          <span className="truncate">{org.id}</span>
                          {copiedOrgId === org.id ? (
                            <span className="text-green-400 text-xs shrink-0">
                              ✓ Copied
                            </span>
                          ) : (
                            <span className="text-muted text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              Copy
                            </span>
                          )}
                        </button>
                      </div>
                      <div>
                        <p className="text-muted text-xs mb-1">Smart Account</p>
                        <p className="font-mono text-xs truncate">
                          {org.smart_wallet_address}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {isOwner && (
                        <Button
                          size="sm"
                          color="warning"
                          variant="flat"
                          onPress={issueCardM.onOpen}
                        >
                          Issue Card
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cards Section */}
        <div className="opacity-0 animate-fade-in animate-delay-3">
          <h2 className="text-xl font-semibold mb-4">Your Cards</h2>
          {isLoadingCards ? (
            <div className="flex justify-center py-8">
              <Spinner color="warning" />
            </div>
          ) : cards.length === 0 ? (
            <div className="envoy-card p-8 text-center">
              <p className="text-muted">No cards have been issued to you yet</p>
              <p className="text-sm text-muted mt-2">
                Ask an organization admin to issue you a spending card
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="envoy-card p-6 relative overflow-hidden"
                >
                  {/* Card design accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-amber-500/20 to-transparent rounded-bl-full" />

                  <div className="relative">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-muted text-xs uppercase tracking-wider">
                          Spending Card
                        </p>
                        <p className="font-mono text-xs mt-1 text-muted">
                          {card.id.slice(0, 8)}...
                        </p>
                      </div>
                      <Chip size="sm" color="success" variant="flat">
                        Active
                      </Chip>
                    </div>

                    <div className="mb-4">
                      <p className="text-muted text-xs mb-1">Daily Limit</p>
                      <p className="text-2xl font-bold gradient-text">
                        {getCardLimit(card)} ETH
                      </p>
                    </div>

                    <Button
                      size="sm"
                      color="warning"
                      className="w-full"
                      onPress={payWithCardM.onOpen}
                    >
                      Use Card
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateOrgModal
        onSubmit={handleOrgSubmit}
        isOpen={createOrgM.isOpen}
        onOpenChange={createOrgM.onOpenChange}
      />

      <IssueCardModal
        onSubmit={handleIssueCard}
        isOpen={issueCardM.isOpen}
        onOpenChange={issueCardM.onOpenChange}
        adminAddress={address}
        organizations={orgs}
      />

      <PayWithCardModal
        isOpen={payWithCardM.isOpen}
        onOpenChange={payWithCardM.onOpenChange}
        cards={cards}
      />

      <JoinOrgModal
        onSubmit={handleJoinOrg}
        isOpen={joinOrgM.isOpen}
        onOpenChange={joinOrgM.onOpenChange}
      />
    </div>
  );
}

export default withProtectedRoute(Dashboard);
