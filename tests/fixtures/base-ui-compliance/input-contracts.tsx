import React, { useState } from "react";

import { Button } from "../../../packages/ui/components/shadcn/button";
import { Input } from "../../../packages/ui/components/shadcn/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "../../../packages/ui/components/shadcn/input-otp";
import {
  NumberField,
  NumberFieldInput,
  NumberFieldGroup,
  NumberFieldDecrement,
  NumberFieldIncrement,
} from "../../../packages/ui/components/shadcn/number-field";
import {
  RichTextEditor,
  EditorContent,
} from "../../../packages/ui/components/shadcn/rich-text-editor/rich-text-editor";
import { EditorToolbar } from "../../../packages/ui/components/shadcn/rich-text-editor/toolbar";

export function InputContracts() {
  const [name, setName] = useState("");
  const [nameDisabled, setNameDisabled] = useState(false);
  const [amount, setAmount] = useState<number | null>(1.5);
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [message, setMessage] = useState("Hello world");
  return (
    <section id="input-contracts" className="mt-8 flex max-w-xl flex-col gap-4">
      <h2>Input and editor contracts</h2>
      <form
        aria-label="Profile controls"
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(
            JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
          );
        }}
      >
        <label htmlFor="profile-name">Profile name</label>
        <Input
          id="profile-name"
          name="name"
          value={name}
          disabled={nameDisabled}
          onValueChange={setName}
          className={(state) =>
            state.disabled ? "disabled-name" : "enabled-name"
          }
        />
        <Button onClick={() => setNameDisabled(!nameDisabled)}>
          Toggle profile availability
        </Button>
        <label htmlFor="profile-amount">Profile amount</label>
        <NumberField
          id="profile-amount"
          name="amount"
          value={amount}
          onValueChange={setAmount}
          min={0}
          max={2}
          step={0.5}
        >
          <NumberFieldGroup>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
        <label htmlFor="verification-code">Verification code</label>
        <p id="code-description">Enter four digits.</p>
        <InputOTP
          id="verification-code"
          aria-describedby="code-description"
          name="code"
          value={code}
          onValueChange={setCode}
          length={4}
          className={(state) => (state.complete ? "complete" : "incomplete")}
        >
          <InputOTPGroup>
            <InputOTPSlot />
            <InputOTPSlot aria-label="Character 2 of 4" />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot aria-label="Character 3 of 4" />
            <InputOTPSlot aria-label="Character 4 of 4" />
          </InputOTPGroup>
        </InputOTP>
        <Button type="submit">Save profile controls</Button>
        <output aria-label="Submitted controls">{submitted}</output>
      </form>
      <RichTextEditor value={message} onChange={setMessage}>
        <EditorToolbar tools={["bold", "italic", "link", "undo", "redo"]} />
        <EditorContent aria-label="Message body" />
      </RichTextEditor>
      <output aria-label="Stored message">{message}</output>
    </section>
  );
}
