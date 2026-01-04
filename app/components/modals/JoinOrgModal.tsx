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

interface JoinOrgModalProps {
  onSubmit: (orgId: string) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinOrgModal({
  isOpen,
  onOpenChange,
  onSubmit,
}: JoinOrgModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const orgId = ((formData.get("org_id") as string) ?? "").trim();

    if (!orgId) {
      setError("Please enter an organization ID");
      setIsLoading(false);
      return;
    }

    try {
      await onSubmit(orgId);
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      console.error("Failed to join org:", error);
      setError(error.message || "Failed to join organization");
    } finally {
      setIsLoading(false);
    }
  }

  function handleClose() {
    setError(null);
    setSuccess(false);
    onOpenChange(false);
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={handleClose} size="lg">
      <ModalContent>
        {() => (
          <>
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                <span className="text-xl">Join Organization</span>
                <span className="text-sm font-normal text-gray-500">
                  Enter the organization ID to join
                </span>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-5">
                  <Input
                    isRequired
                    label="Organization ID"
                    labelPlacement="outside"
                    name="org_id"
                    placeholder="Enter organization UUID"
                    description="The unique ID of the organization you want to join"
                    isDisabled={isLoading || success}
                    autoFocus
                  />

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-sm text-amber-500 font-medium mb-2">
                      Instant Approval
                    </p>
                    <p className="text-xs text-gray-400">
                      You&apos;ll be automatically added to the organization. 
                      An admin can issue you a spending card after you join.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <p className="text-sm text-green-400 font-medium">
                        ✓ Successfully joined the organization!
                      </p>
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
                  Cancel
                </Button>
                {!success && (
                  <Button
                    color="warning"
                    type="submit"
                    isLoading={isLoading}
                    isDisabled={isLoading}
                  >
                    {isLoading ? "Joining..." : "Join Organization"}
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

