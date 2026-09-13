"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { changePassword } from "./actions";

export function ChangePasswordForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const res = await changePassword(formData);
    setPending(false);

    if (res.success) {
      toast.success("Password changed successfully.");
      (document.getElementById("change-password-form") as HTMLFormElement)?.reset();
    } else {
      setError(res.error ?? "Could not change password.");
    }
  }

  return (
    <form id="change-password-form" action={handleSubmit} className="flex flex-col gap-4">
      <Input id="currentPassword" name="currentPassword" type="password" label="Current password" required />
      <Input id="newPassword" name="newPassword" type="password" label="New password" required minLength={8} />
      <Input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label="Confirm new password"
        required
        minLength={8}
      />
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      <Button type="submit" loading={pending} className="self-start">
        Update password
      </Button>
    </form>
  );
}
