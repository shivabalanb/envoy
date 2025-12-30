"use client";
import { Form, Input, Button } from "@heroui/react";
import { FormEvent } from "react";

export default function OnboardForm({
  onSubmit,
}: {
  onSubmit: (name: string) => void;
}) {

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = (new FormData(e.currentTarget)).get("name") as string;
    await onSubmit(name);
  };

  return (
    <Form className="w-full max-w-md py-4" onSubmit={handleSubmit}>
      <Input
        isRequired
        errorMessage="Please enter a valid name"
        label="Name"
        labelPlacement="outside"
        name="name"
        placeholder="Enter your Name"
        type="string"
      />
      <Button type="submit" variant="bordered">
        Submit
      </Button>
    </Form>
  );
}
