"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { FormEvent, useState } from "react";
import { Address } from "viem";
import { useWalletClient } from "wagmi";

interface PayWithDelegationModal {
  onSubmit: (
    cardId: string,
    recipientAddress: Address,
    amountETH: string
  ) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayWithDelegationModal({
  isOpen,
  onOpenChange,
  onSubmit,
}: PayWithDelegationModal) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const cardId = ((formData.get("card_id") as string) ?? "").trim();
    const recipientAddress = (
      (formData.get("recipient_address") as string) ?? ""
    ).trim() as Address;
    const amountETH = ((formData.get("amount") as string) ?? "").trim();

    if (!cardId || !recipientAddress || !amountETH || parseFloat(amountETH) <= 0) {
      setError("Please fill in all fields with valid values");
      setIsLoading(false);
      return;
    }

    try {
      await onSubmit(cardId, recipientAddress, amountETH);
      setSuccess("Payment successful! Check console for transaction hash.");
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error("Failed to make payment:", err);
      setError(err.message || "Failed to make payment");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {() => (
          <>
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                Pay with Delegation
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Input
                    isRequired
                    errorMessage="Please enter a valid card ID"
                    label="Card ID"
                    labelPlacement="outside"
                    name="card_id"
                    placeholder="Enter Card ID from issue card"
                    type="string"
                    description="The card ID returned when you created the delegation"
                    isDisabled={isLoading}
                  />
                  <Input
                    isRequired
                    errorMessage="Please enter recipient address"
                    label="Recipient Address"
                    labelPlacement="outside"
                    name="recipient_address"
                    placeholder="0x..."
                    type="string"
                    description="The address that will receive the payment"
                    defaultValue="0xD5BeD83a3d8f87B51ef6c92291556B634D5AE2F7"
                    isDisabled={isLoading}
                  />
                  <Input
                    isRequired
                    errorMessage="Please enter a valid amount"
                    label="Amount (ETH)"
                    labelPlacement="outside"
                    name="amount"
                    placeholder="0.05"
                    type="number"
                    step="0.001"
                    min="0"
                    defaultValue="0.001"
                    isDisabled={isLoading}
                  />
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  {success && (
                    <p className="text-sm text-green-500">{success}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    This will redeem the delegation and send the payment from the
                    delegator's smart account.
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={isLoading}
                  isDisabled={isLoading || !!success}
                >
                  {isLoading ? "Processing..." : "Make Payment"}
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

