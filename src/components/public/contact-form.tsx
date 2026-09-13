"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitContactForm, type ContactState } from "@/app/(marketing)/contact/actions";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const initialState: ContactState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--success)]/30 bg-[var(--success)]/5 px-6 py-12 text-center">
        <CheckCircle2 className="h-8 w-8 text-[var(--success)]" />
        <p className="font-display text-base font-semibold">Message sent.</p>
        <p className="max-w-sm text-sm text-[var(--slate)]">
          Thanks for reaching out — I&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      {/* Honeypot — hidden from sighted users, catches naive bots */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px]"
        aria-hidden="true"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input id="name" name="name" label="Name" required error={state.fieldErrors?.name} />
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          required
          error={state.fieldErrors?.email}
        />
      </div>
      <Input id="subject" name="subject" label="Subject" required error={state.fieldErrors?.subject} />
      <Textarea
        id="message"
        name="message"
        label="Message"
        required
        className="min-h-32"
        error={state.fieldErrors?.message}
      />
      {state.error && <p className="text-sm text-[var(--danger)]">{state.error}</p>}
      <Button type="submit" size="lg" loading={pending} className="self-start">
        Send message
      </Button>
    </form>
  );
}
