"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from "@heroui/react";
import { FormEvent } from "react";
import { Address } from "viem";

interface CreateCardModal {
  onSubmit: (
    user_id: string,
    whitelist: Address[],
    org_id?: string | null
  ) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCardModal({
  isOpen,
  onOpenChange,
  onSubmit,
}: CreateCardModal) {
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const user_id = (formData.get("user_id") as string) ?? "";
    const org_id = (formData.get("org_id") as string) || null;
    const whitelistInput = (formData.get("whitelist") as string) ?? "";

    // Parse whitelist addresses - split by comma or newline, trim, and filter empty
    const whitelist: Address[] = whitelistInput
      .split(/[,\n]/)
      .map((addr) => addr.trim())
      .filter((addr) => addr.length > 0) as Address[];

    if (whitelist.length === 0) {
      // Could add error handling here
      return;
    }

    try {
      await onSubmit(user_id, whitelist, org_id);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create card:", error);
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {() => (
          <>
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                Create Card
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Input
                    isRequired
                    errorMessage="Please enter a valid user ID"
                    label="User ID"
                    labelPlacement="outside"
                    name="user_id"
                    placeholder="Enter User ID"
                    type="string"
                  />
                  <Textarea
                    isRequired
                    errorMessage="Please enter at least one wallet address"
                    label="Whitelist Addresses"
                    labelPlacement="outside"
                    name="whitelist"
                    placeholder="Enter wallet addresses (comma or newline separated)&#10;0x8A39c0e68E2055B0f0b4e137d8c940b9b3442390&#10;0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                    minRows={3}
                  />
                  <Input
                    errorMessage="Please enter a valid org ID"
                    label="Organization ID (Optional)"
                    labelPlacement="outside"
                    name="org_id"
                    placeholder="Enter Organization ID"
                    type="string"
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" type="submit">
                  Create Card
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
