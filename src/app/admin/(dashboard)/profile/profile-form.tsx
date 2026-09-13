"use client";

import { useState } from "react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/admin/image-upload";
import { CvUpload } from "@/components/admin/cv-upload";
import { toast } from "@/components/ui/toast";
import type { ProfileInput } from "@/lib/validations/profile";
import { updateProfile } from "./actions";

export function ProfileForm({ initial }: { initial: ProfileInput }) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  function update<K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    const res = await updateProfile(values);
    setPending(false);

    if (res.success) {
      toast.success("Profile updated successfully.");
    } else if (res.fieldErrors) {
      setErrors(res.fieldErrors);
      toast.error("Please fix the highlighted fields.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <ImageUpload
        label="Profile image"
        value={values.profileImage}
        onChange={(url, publicId) => {
          update("profileImage", url);
          update("profileImagePublicId", publicId ?? (url ? values.profileImagePublicId : ""));
        }}
        folder="profile"
      />
      <CvUpload
        value={values.cvUrl}
        onChange={(url, publicId) => {
          update("cvUrl", url);
          update("cvPublicId", publicId ?? (url ? values.cvPublicId : ""));
        }}
        folder="profile"
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="fullName"
          label="Full name"
          value={values.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          error={errors.fullName}
        />
        <Input
          id="professionalTitle"
          label="Professional title"
          value={values.professionalTitle}
          onChange={(e) => update("professionalTitle", e.target.value)}
          error={errors.professionalTitle}
        />
      </div>
      <Textarea
        id="heroHeadline"
        label="Hero headline"
        value={values.heroHeadline}
        onChange={(e) => update("heroHeadline", e.target.value)}
        error={errors.heroHeadline}
      />
      <Textarea
        id="heroDescription"
        label="Hero description"
        value={values.heroDescription ?? ""}
        onChange={(e) => update("heroDescription", e.target.value)}
      />
      <Textarea
        id="aboutText"
        label="About text"
        className="min-h-32"
        value={values.aboutText ?? ""}
        onChange={(e) => update("aboutText", e.target.value)}
      />
      <Textarea
        id="shortIntro"
        label="Short introduction"
        value={values.shortIntro ?? ""}
        onChange={(e) => update("shortIntro", e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="email"
          label="Email"
          type="email"
          value={values.email ?? ""}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
        />
        <Input
          id="phone"
          label="Phone"
          value={values.phone ?? ""}
          onChange={(e) => update("phone", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="location"
          label="Location"
          value={values.location ?? ""}
          onChange={(e) => update("location", e.target.value)}
        />
        <Input
          id="availability"
          label="Availability"
          value={values.availability ?? ""}
          onChange={(e) => update("availability", e.target.value)}
        />
      </div>

      <Textarea
        id="currentFocus"
        label="Current focus"
        value={values.currentFocus ?? ""}
        onChange={(e) => update("currentFocus", e.target.value)}
      />
      <Textarea
        id="futureGoals"
        label="Future goals"
        value={values.futureGoals ?? ""}
        onChange={(e) => update("futureGoals", e.target.value)}
      />

      <Button type="submit" loading={pending} className="self-start">
        Save profile
      </Button>
    </form>
  );
}
