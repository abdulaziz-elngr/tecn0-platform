"use client";

import { useState } from "react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { TecnoTeamProfileInput } from "@/lib/validations/tecno-team";
import { updateTecnoTeamProfile } from "./actions";

export function TecnoTeamProfileForm({ initial }: { initial: TecnoTeamProfileInput }) {
  const [values, setValues] = useState(initial);
  const [pending, setPending] = useState(false);

  function update<K extends keyof TecnoTeamProfileInput>(key: K, value: TecnoTeamProfileInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSave() {
    setPending(true);
    const res = await updateTecnoTeamProfile(values);
    setPending(false);
    if (res.success) {
      toast.success("Tecno Team profile saved.");
    } else {
      toast.error(res.error ?? "Could not save.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Textarea
        id="team-description"
        label="Team description"
        value={values.description ?? ""}
        onChange={(e) => update("description", e.target.value)}
        className="min-h-28"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Textarea
          id="team-mission"
          label="Mission"
          value={values.mission ?? ""}
          onChange={(e) => update("mission", e.target.value)}
        />
        <Textarea
          id="team-vision"
          label="Vision"
          value={values.vision ?? ""}
          onChange={(e) => update("vision", e.target.value)}
        />
      </div>
      <Input
        id="team-contact-email"
        label="Team contact email"
        value={values.contactEmail ?? ""}
        onChange={(e) => update("contactEmail", e.target.value)}
      />
      <Button type="button" onClick={handleSave} loading={pending} className="self-start">
        Save Tecno Team profile
      </Button>
    </div>
  );
}
