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
import { useWalletClient } from "wagmi";
import { payWithCard } from "../../services/delegationService";
import { Card } from "../../lib/supabase/types";

interface PayWithCardModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cards?: Card[];
}

export function PayWithCardModal({
  isOpen,
  onOpenChange,
  cards = [],
}: PayWithCardModalProps) {
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!walletClient) {
      setError("Wallet not connected");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const cardId = ((formData.get("card_id") as string) ?? "").trim();
    const recipientAddress = ((formData.get("recipient_address") as string) ?? "").trim() as Address;
    const amount = ((formData.get("amount") as string) ?? "").trim();

    if (!cardId) {
      setError("Please select a card");
      return;
    }

    if (!recipientAddress || !recipientAddress.startsWith("0x")) {
      setError("Please enter a valid recipient address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);

    try {
      const txHash = await payWithCard(cardId, recipientAddress, amount, walletClient);
      setSuccess(txHash);
    } catch (err: any) {
      console.error("Failed to make payment:", err);
      setError(err.message || "Failed to make payment");
    } finally {
      setIsLoading(false);
    }
  }

  function handleClose() {
    setError(null);
    setSuccess(null);
    onOpenChange(false);
  }

  // Get card limit from delegation blob
  function getCardLimit(card: Card): string {
    try {
      if (!card.delegation_blob) return "N/A";
      const parsed = JSON.parse(card.delegation_blob);
      return parsed.limitETH || "N/A";
    } catch {
      return "N/A";
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={handleClose} size="lg">
      <ModalContent>
        {() => (
          <>
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                <span className="text-xl">Pay with Card</span>
                <span className="text-sm font-normal text-gray-500">
                  Send a payment using your spending card
                </span>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-5">
                  {cards.length > 0 ? (
                    <Select
                      isRequired
                      label="Select Card"
                      labelPlacement="outside"
                      name="card_id"
                      placeholder="Choose a card to use"
                      description="Select one of your spending cards"
                      isDisabled={isLoading || !!success}
                    >
                      {cards.map((card) => (
                        <SelectItem key={card.id} textValue={`Card ${card.id.slice(0, 8)}...`}>
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-sm">
                              {card.id.slice(0, 8)}...{card.id.slice(-4)}
                            </span>
                            <span className="text-xs text-gray-500">
                              Limit: {getCardLimit(card)} ETH/day
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      isRequired
                      label="Card ID"
                      labelPlacement="outside"
                      name="card_id"
                      placeholder="Enter card ID"
                      description="The ID of the card you want to use"
                      isDisabled={isLoading || !!success}
                    />
                  )}

                  <Input
                    isRequired
                    label="Recipient Address"
                    labelPlacement="outside"
                    name="recipient_address"
                    placeholder="0x..."
                    description="The wallet address that will receive the payment"
                    isDisabled={isLoading || !!success}
                  />

                  <Input
                    isRequired
                    label="Amount (ETH)"
                    labelPlacement="outside"
                    name="amount"
                    placeholder="0.01"
                    type="number"
                    step="0.001"
                    min="0.001"
                    defaultValue="0.001"
                    description="Amount to send (must be within daily limit)"
                    isDisabled={isLoading || !!success}
                  />

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <p className="text-sm text-green-400 font-medium mb-2">
                        ✓ Payment successful!
                      </p>
                      <p className="text-xs text-gray-400 mb-1">Transaction Hash:</p>
                      <p className="text-sm font-mono break-all text-gray-300">
                        {success}
                      </p>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${success}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-sm text-amber-500 hover:text-amber-400 underline"
                      >
                        View on Etherscan →
                      </a>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={handleClose}
                  isDisabled={isLoading}
                >
                  {success ? "Done" : "Cancel"}
                </Button>
                {!success && (
                  <Button
                    color="warning"
                    type="submit"
                    isLoading={isLoading}
                    isDisabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Send Payment"}
                  </Button>
                )}
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
