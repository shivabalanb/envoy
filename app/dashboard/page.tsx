"use client";

import { Button, useDisclosure } from "@heroui/react";
import { CreateUserModal } from "../components/modals/CreateUserModal";
import { useAuth } from "../hooks/useAuth";
import { createUser } from "../services/userService";
import { withProtectedRoute } from "../components/ProtectedRoute";
import { Address } from "viem";
import { createOrg } from "../services/orgService";
import { CreateOrgModal } from "../components/modals/CreateOrgModal";
import { CreateCardModal } from "../components/modals/CreateCardModal";
import { createCard } from "../services/cardService";
import { FundOrgModal } from "../components/modals/FundOrgModal";

function Dashboard() {
  const createUserM = useDisclosure();
  const createOrgM = useDisclosure();
  const createCardM = useDisclosure();
  const fundOrgM = useDisclosure();
  const { refetch } = useAuth();

  async function handleUserSubmit(_name: string, _address?: Address) {
    const walletAddress = _address!;

    try {
      await createUser(_name, walletAddress);
      await refetch();
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  }

  async function handleOrgSubmit(
    _org_name: string,
    owner_account_address: Address
  ) {
    try {
      await createOrg(_org_name, owner_account_address);
      await refetch();
    } catch (error) {
      console.error("Failed to create org:", error);
    }
  }

  async function handleCardSubmit(
    user_id: string,
    whitelist: Address[],
    org_id?: string | null
  ) {
    try {
      await createCard(user_id, whitelist, org_id);
      await refetch();
    } catch (error) {
      console.error("Failed to create card:", error);
    }
  }

  function handleFundOrgClick() {
    fundOrgM.onOpen();
  }

  return (
    <div className=" w-full min-h-screen flex flex-col ">
      <div className=" my-20 flex justify-center gap-4">
        <Button onPress={createUserM.onOpen}>Create User</Button>
        <Button onPress={createOrgM.onOpen}>Create Org</Button>
        <Button onPress={createCardM.onOpen}>Create Card</Button>
        <Button onPress={handleFundOrgClick} >
          Fund Org
        </Button>
      </div>
      <CreateUserModal
        onSubmit={handleUserSubmit}
        isOpen={createUserM.isOpen}
        onOpenChange={createUserM.onOpenChange}
      />
      <CreateOrgModal
        onSubmit={handleOrgSubmit}
        isOpen={createOrgM.isOpen}
        onOpenChange={createOrgM.onOpenChange}
      />
      <CreateCardModal
        onSubmit={handleCardSubmit}
        isOpen={createCardM.isOpen}
        onOpenChange={createCardM.onOpenChange}
      />
      <FundOrgModal
        isOpen={fundOrgM.isOpen}
        onOpenChange={fundOrgM.onOpenChange}
      />
    </div>
  );
}

export default withProtectedRoute(Dashboard);
