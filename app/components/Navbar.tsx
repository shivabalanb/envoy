"use client";
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Navbar() {
  return (
    <HeroNavbar
      className="absolute top-0 left-0 right-0 z-10"
      maxWidth="xl"
      shouldHideOnScroll={false}
    >
      <NavbarBrand>
        <p className="font-bold text-2xl text-amber-500">Envoy</p>
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem>
          <ConnectButton />
        </NavbarItem>
      </NavbarContent>
    </HeroNavbar>
  );
}
