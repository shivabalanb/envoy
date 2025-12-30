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

interface CreateUserModal {
  onSubmit: (name: string, address?: Address) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserModal({
  isOpen,
  onOpenChange,
  onSubmit,
}: CreateUserModal) {
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string) ?? "";
    const walletAddress = (formData.get("wallet_address") as Address) ?? "";

    try {
      await onSubmit(name, walletAddress);
      onOpenChange(false);
    } catch (error) {}
  }
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {() => (
          <>
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                Create User
              </ModalHeader>
              <ModalBody>
                <div>
                  <Input
                    isRequired
                    errorMessage="Please enter a valid wallet address"
                    label="Wallet Address"
                    labelPlacement="outside"
                    name="wallet_address"
                    placeholder="Enter your Wallet Address"
                    defaultValue="0x8A39c0e68E2055B0f0b4e137d8c940b9b3442390"
                    type="string"
                  />
                  <Input
                    isRequired
                    errorMessage="Please enter a valid name"
                    label="Name"
                    labelPlacement="outside"
                    name="name"
                    placeholder="Enter your Name"
                    type="string"
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" type="submit">
                  Create User
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
