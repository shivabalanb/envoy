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
import { Address } from "viem";

interface CreateOrgModal {
  onSubmit: (orgName: string, ownerWalletAddress: Address) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateOrgModal({
  isOpen,
  onOpenChange,
  onSubmit,
}: CreateOrgModal) {
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const orgName = (formData.get("org_name") as string) ?? "";
    const ownerWalletAddress =
      (formData.get("owner_wallet_address") as Address) ?? "";

    try {
      await onSubmit(orgName, ownerWalletAddress);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create org:", error);
    }
  }
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {() => (
          <>
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                Create Org
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Input
                    isRequired
                    errorMessage="Please enter a valid org name"
                    label="Org Name"
                    labelPlacement="outside"
                    name="org_name"
                    placeholder="Enter Org Name"
                    type="string"
                  />
                 
                  <p className="text-sm text-gray-500">
                    A smart account will be automatically created for this
                    organization.
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" type="submit">
                  Create Org
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
