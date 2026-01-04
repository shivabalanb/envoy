"use client";
import { Input, Button } from "@heroui/react";
import { FormEvent, useState } from "react";

export default function OnboardForm({
  onSubmit,
}: {
  onSubmit: (name: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const name = (new FormData(e.currentTarget)).get("name") as string;
    try {
      await onSubmit(name);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
        <Input
          isRequired
          errorMessage="Please enter a valid name"
          label="Your Name"
          labelPlacement="outside"
          name="name"
          placeholder="Enter your name"
          description="This is how you'll appear in the app"
          isDisabled={isLoading}
          autoFocus
        />
        <Button 
          type="submit" 
          color="warning"
          isLoading={isLoading}
          isDisabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Creating account..." : "Continue"}
        </Button>
      </form>
  );
}
