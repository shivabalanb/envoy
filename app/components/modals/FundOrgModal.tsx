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
import { FormEvent } from "react";
import { Address, parseEther } from "viem";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";

interface FundOrgModal {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FundOrgModal({ isOpen, onOpenChange }: FundOrgModal) {
  const {
    data: hash,
    sendTransaction,
    isPending,
    error: sendError,
  } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = (formData.get("amount") as string) ?? "";
    const smartWalletAddress =
      (formData.get("smart_wallet_address") as Address) ?? "";

    if (!amount || parseFloat(amount) <= 0 || !smartWalletAddress) {
      return;
    }

    try {
      sendTransaction({
        to: smartWalletAddress,
        value: parseEther(amount),
      });
    } catch (error) {
      console.error("Failed to send transaction:", error);
    }
  }

  if (isSuccess) {
    setTimeout(() => onOpenChange(false), 2000);
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {() => (
          <>
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                Fund Organization Wallet
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Input
                    isRequired
                    errorMessage="Please enter smart wallet address"
                    label="Smart Wallet Address"
                    labelPlacement="outside"
                    name="smart_wallet_address"
                    placeholder="0x..."
                    type="string"
                  />
                  <Input
                    isRequired
                    errorMessage="Please enter a valid amount"
                    label="Amount (ETH)"
                    labelPlacement="outside"
                    name="amount"
                    placeholder="0.1"
                    type="number"
                    step="0.001"
                    min="0"
                    isDisabled={isPending || isConfirming || isSuccess}
                  />
                  {sendError && (
                    <p className="text-sm text-red-500">{sendError.message}</p>
                  )}
                  {isSuccess && hash && (
                    <p className="text-sm text-green-500">
                      Success!{" "}
                      <a
                        href={`https://sepolia.etherscan.io/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        View on Etherscan
                      </a>
                    </p>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={isPending || isConfirming}
                  isDisabled={isPending || isConfirming || isSuccess}
                >
                  {isPending || isConfirming ? "Processing..." : "Fund Wallet"}
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
