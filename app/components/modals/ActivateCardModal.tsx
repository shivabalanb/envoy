"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { Card } from "../../lib/supabase/types";

interface ActivateCardModal {
  card: Card;
  onActivate: () => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivateCardModal({
  card,
  onActivate,
  isOpen,
  onOpenChange,
}: ActivateCardModal) {
  async function handleActivate() {
    try {
      await onActivate();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to activate card:", error);
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Activate Your Card
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-sm font-semibold">Daily Limit:</p>
                  <p className="text-lg">{card.daily_limit} ETH</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Organization:</p>
                  <p className="text-sm">{card.org_id}</p>
                </div>
                <p className="text-sm text-gray-500">
                  Click "Activate" to claim this card. This will create your session key
                  and enable spending from the organization account.
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={handleActivate}>
                Activate Card
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

