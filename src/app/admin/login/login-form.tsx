"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAction, type LoginState } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: LoginState = {};

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (!pending && state.success) {
      router.push("/admin");
      router.refresh();
    }
  }, [state, pending, router]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="you@tecnoteam.dev"
        required
        error={state.fieldErrors?.email}
      />
      <Input
        id="password"
        name="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        required
        error={state.fieldErrors?.password}
      />
      {state.error && <p className="text-sm text-[var(--danger)]">{state.error}</p>}
      <Button type="submit" size="lg" loading={pending} className="mt-2">
        Sign in
      </Button>
    </form>
  );
}
