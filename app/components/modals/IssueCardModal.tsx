"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { FormEvent, useState } from "react";
import { Address } from "viem";
import { Organization } from "../../lib/supabase/types";

interface IssueCardModalProps {
  onSubmit: (
    delegateeAddress: Address,
    dailyLimit: string,
    orgName: string,
    periodDuration: number,
    startDate?: number
  ) => Promise<any>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  adminAddress?: Address;
  organizations?: Organization[];
}

export function IssueCardModal({
  isOpen,
  onOpenChange,
  onSubmit,
  adminAddress,
  organizations = [],
}: IssueCardModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ cardId: string } | null>(null);
  const [periodType, setPeriodType] = useState<string>("daily");
  const [customDays, setCustomDays] = useState<string>("1");
  const [startDateInput, setStartDateInput] = useState<string>("");

  // Convert period type to seconds
  function getPeriodDuration(): number {
    switch (periodType) {
      case "daily":
        return 86400; // 1 day
      case "weekly":
        return 604800; // 7 days
      case "monthly":
        return 2592000; // 30 days
      case "custom":
        const days = parseInt(customDays) || 1;
        return days * 86400;
      default:
        return 86400;
    }
  }

  // Convert seconds to human readable
  function formatPeriodDuration(seconds: number): string {
    const days = seconds / 86400;
    if (days === 1) return "Daily";
    if (days === 7) return "Weekly";
    if (days === 30) return "Monthly";
    return `${days} days`;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const delegateeAddress = (
      (formData.get("delegatee_address") as string) ?? ""
    ).trim() as Address;
    const orgName = ((formData.get("org_name") as string) ?? "").trim();
    const periodLimit = (
      (formData.get("period_limit") as string) ?? "0.1"
    ).trim();
    const startDateInput = (formData.get("start_date") as string) ?? "";

    if (!delegateeAddress || !delegateeAddress.startsWith("0x")) {
      setError("Please enter a valid wallet address");
      setIsLoading(false);
      return;
    }

    if (!orgName) {
      setError("Please select an organization");
      setIsLoading(false);
      return;
    }

    if (parseFloat(periodLimit) <= 0) {
      setError("Period limit must be greater than 0");
      setIsLoading(false);
      return;
    }

    if (
      periodType === "custom" &&
      (parseInt(customDays) < 1 || parseInt(customDays) > 365)
    ) {
      setError("Custom period must be between 1 and 365 days");
      setIsLoading(false);
      return;
    }

    // Parse start date if provided
    let startDate: number | undefined;
    if (startDateInput) {
      const date = new Date(startDateInput);
      if (isNaN(date.getTime())) {
        setError("Invalid start date");
        setIsLoading(false);
        return;
      }
      startDate = Math.floor(date.getTime() / 1000);
    }

    try {
      const periodDuration = getPeriodDuration();
      const result = await onSubmit(
        delegateeAddress,
        periodLimit,
        orgName,
        periodDuration,
        startDate
      );
      setSuccess({ cardId: result.cardId });
    } catch (error: any) {
      console.error("Failed to issue card:", error);
      setError(error.message || "Failed to create delegation");
    } finally {
      setIsLoading(false);
    }
  }

  function handleClose() {
    setError(null);
    setSuccess(null);
    setPeriodType("daily");
    setCustomDays("1");
    setStartDateInput("");
    onOpenChange(false);
  }

  // Filter to only show orgs where user is admin
  const adminOrgs = organizations.filter(
    (org) =>
      org.owner_wallet_address.toLowerCase() === adminAddress?.toLowerCase()
  );

  return (
    <Modal isOpen={isOpen} onOpenChange={handleClose} size="3xl">
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex flex-col gap-1">
            <span className="text-xl">Issue Spending Card</span>
            <span className="text-sm font-normal text-gray-500">
              Grant spending permissions to a team member
            </span>
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="flex flex-col gap-5">
                {adminAddress && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-xs text-amber-500 font-medium mb-1">
                      Issuing as Admin
                    </p>
                    <p className="text-sm font-mono break-all text-gray-300">
                      {adminAddress}
                    </p>
                  </div>
                )}

                {adminOrgs.length > 0 ? (
                  <Select
                    isRequired
                    label="Organization"
                    labelPlacement="outside"
                    name="org_name"
                    placeholder="Select organization"
                    description="The org treasury that will fund this card"
                    isDisabled={isLoading || !!success}
                  >
                    {adminOrgs.map((org) => (
                      <SelectItem key={org.name}>{org.name}</SelectItem>
                    ))}
                  </Select>
                ) : (
                  <Input
                    isRequired
                    label="Organization Name"
                    labelPlacement="outside"
                    name="org_name"
                    placeholder="Enter organization name"
                    description="The name of your organization"
                    isDisabled={isLoading || !!success}
                  />
                )}

                <Input
                  isRequired
                  label="Recipient Wallet Address"
                  labelPlacement="outside"
                  name="delegatee_address"
                  placeholder="0x..."
                  description="The wallet address that will receive the spending card"
                  isDisabled={isLoading || !!success}
                />
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-5">
                <div>
                  <Select
                    isRequired
                    label="Spending Period"
                    labelPlacement="outside"
                    selectedKeys={[periodType]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setPeriodType(selected);
                    }}
                    description="How often the limit resets"
                    isDisabled={isLoading || !!success}
                  >
                    <SelectItem key="daily">Daily</SelectItem>
                    <SelectItem key="weekly">Weekly</SelectItem>
                    <SelectItem key="monthly">Monthly</SelectItem>
                    <SelectItem key="custom">Custom</SelectItem>
                  </Select>
                </div>

                {periodType === "custom" && (
                  <Input
                    isRequired
                    label="Custom Period (Days)"
                    labelPlacement="outside"
                    name="custom_days"
                    placeholder="1-365"
                    type="number"
                    min="1"
                    max="365"
                    value={customDays}
                    onValueChange={setCustomDays}
                    description="Number of days in the period"
                    isDisabled={isLoading || !!success}
                  />
                )}

                <Input
                  isRequired
                  label={`Spending Limit per ${periodType === "daily" ? "Day" : periodType === "weekly" ? "Week" : periodType === "monthly" ? "Month" : "Period"} (ETH)`}
                  labelPlacement="outside"
                  name="period_limit"
                  placeholder="0.1"
                  type="number"
                  step="0.001"
                  min="0.001"
                  defaultValue="0.01"
                  description={`Maximum amount this card can spend per ${formatPeriodDuration(getPeriodDuration()).toLowerCase()}`}
                  isDisabled={isLoading || !!success}
                />

                <Input
                  label="Start Date (Optional)"
                  labelPlacement="outside"
                  name="start_date"
                  type="datetime-local"
                  value={startDateInput}
                  onValueChange={setStartDateInput}
                  placeholder=""
                  description="When the card becomes active (defaults to now)"
                  isDisabled={isLoading || !!success}
                />
              </div>
            </div>

            {/* Full Width Summary */}
            <div className="mt-4 p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl">
              <p className="text-xs text-gray-400 font-medium mb-2">
                Card Summary
              </p>
              <div className="space-y-1 text-xs text-gray-500">
                <p>
                  • Period:{" "}
                  <span className="text-gray-300">
                    {formatPeriodDuration(getPeriodDuration())}
                  </span>
                </p>
                <p>
                  • Limit resets every:{" "}
                  <span className="text-gray-300">
                    {formatPeriodDuration(getPeriodDuration()).toLowerCase()}
                  </span>
                </p>
                <p>
                  • Start:{" "}
                  <span className="text-gray-300">
                    {startDateInput || "Immediately"}
                  </span>
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="text-sm text-green-400 font-medium mb-2">
                  ✓ Card issued successfully!
                </p>
                <p className="text-xs text-gray-400 mb-1">Card ID:</p>
                <p className="text-sm font-mono break-all text-gray-300">
                  {success.cardId}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Share this ID with the recipient so they can use it
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={handleClose} isDisabled={isLoading}>
              {success ? "Done" : "Cancel"}
            </Button>
            {!success && (
              <Button
                color="warning"
                type="submit"
                isLoading={isLoading}
                isDisabled={isLoading}
              >
                {isLoading ? "Creating..." : "Issue Card"}
              </Button>
            )}
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
