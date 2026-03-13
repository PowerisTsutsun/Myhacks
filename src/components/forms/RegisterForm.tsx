"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationSchema, type RegistrationFormData } from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

interface RegisterFormProps {
  eventName?: string;
}

export function RegisterForm({ eventName = "LaserHacks" }: RegisterFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { teammates: [] },
  });

  // Pre-fill name and email from the logged-in user's session
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          reset((prev) => ({
            ...prev,
            fullName: data.user.name ?? "",
            email: data.user.email ?? "",
          }));
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { fields: teammateFields, append, remove } = useFieldArray({
    control,
    name: "teammates",
  });

  const teamStatus = watch("teamStatus");
  const showTeammateSection = teamStatus === "has_partial_team" || teamStatus === "has_full_team";

  async function onSubmit(data: RegistrationFormData) {
    setServerError(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setServerError("Network error. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="text-6xl mb-5" role="img" aria-label="Success">🎉</div>
        <h2 className="text-2xl font-bold text-white mb-3">You&apos;re registered!</h2>
        <p className="text-white/55 max-w-sm mx-auto">
          Thanks for signing up for {eventName}! We&apos;ll send you updates as the event gets
          closer. See you there!
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">Registration Form</h2>
      <p className="text-white/40 text-sm mb-8">All fields marked * are required.</p>

      {serverError && (
        <div
          className="mb-6 p-3 rounded-lg text-sm text-red-300 border border-red-500/30"
          style={{ background: "rgba(239,68,68,0.1)" }}
          role="alert"
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Honeypot */}
        <input type="text" className="hidden" tabIndex={-1} autoComplete="off" {...register("website")} />

        <Input dark label="Full Name" required autoComplete="name"
          error={errors.fullName?.message} {...register("fullName")} />

        <Input dark label="Email" type="email" required autoComplete="email"
          hint="Use a personal email (Gmail, etc.) — @ivc.edu may delay confirmations."
          error={errors.email?.message} {...register("email")} />

        <Input dark label="Major" required placeholder="e.g. Computer Science, Business, Art"
          error={errors.major?.message} {...register("major")} />

        <Input dark label="Student ID (Optional)" placeholder="e.g. 12345678"
          error={errors.studentId?.message} {...register("studentId")} />

        <Select dark label="Experience Level" required placeholder="Select your level"
          options={[
            { value: "beginner", label: "Beginner — little to no coding experience" },
            { value: "intermediate", label: "Intermediate — some projects under my belt" },
            { value: "advanced", label: "Advanced — experienced developer" },
          ]}
          error={errors.experienceLevel?.message} {...register("experienceLevel")} />

        <Select dark label="Team Status" required placeholder="Select your team status"
          options={[
            { value: "needs_team", label: "I need a team — match me with others" },
            { value: "has_partial_team", label: "I have some teammates, looking for more" },
            { value: "has_full_team", label: "I have a full team (up to 4 people)" },
            { value: "solo", label: "Participating solo (no team)" },
          ]}
          error={errors.teamStatus?.message} {...register("teamStatus")} />

        {/* Teammate entries */}
        {showTeammateSection && (
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{ background: "rgba(56,189,248,0.04)", border: "1px solid rgba(56,189,248,0.15)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white text-sm">Teammates</p>
                <p className="text-xs text-white/40 mt-0.5">
                  Add teammates by name and email so we can link your registrations.
                </p>
              </div>
              {teammateFields.length < 3 && (
                <button type="button"
                  onClick={() => append({ firstName: "", lastName: "", email: "" })}
                  className="text-xs text-laser-400 hover:text-laser-300 font-medium transition-colors">
                  + Add teammate
                </button>
              )}
            </div>

            {teammateFields.length === 0 && (
              <button type="button"
                onClick={() => append({ firstName: "", lastName: "", email: "" })}
                className="w-full py-3 rounded-xl text-sm text-white/30 hover:text-laser-400 transition-colors"
                style={{ border: "2px dashed rgba(56,189,248,0.2)" }}>
                + Add a teammate
              </button>
            )}

            {teammateFields.map((field, index) => (
              <div key={field.id} className="rounded-xl p-4 space-y-3"
                style={{ background: "rgba(13,27,42,0.6)", border: "1px solid rgba(56,189,248,0.1)" }}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-xs font-semibold text-laser-400/70 uppercase tracking-wide">
                      Teammate {index + 1}
                    </span>
                    <p className="text-xs text-white/30 mt-0.5">Fill in any combination — name, email, or student ID</p>
                  </div>
                  <button type="button" onClick={() => remove(index)}
                    className="text-xs text-white/30 hover:text-red-400 transition-colors"
                    aria-label={`Remove teammate ${index + 1}`}>
                    Remove
                  </button>
                </div>
                {/* Root-level refine error */}
                {errors.teammates?.[index]?.root?.message && (
                  <p className="text-xs text-red-400">{errors.teammates[index].root.message}</p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Input dark label="First Name"
                    error={errors.teammates?.[index]?.firstName?.message}
                    {...register(`teammates.${index}.firstName`)} />
                  <Input dark label="Last Name"
                    error={errors.teammates?.[index]?.lastName?.message}
                    {...register(`teammates.${index}.lastName`)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input dark label="Email" type="email"
                    hint="Any email"
                    error={errors.teammates?.[index]?.email?.message}
                    {...register(`teammates.${index}.email`)} />
                  <Input dark label="Student ID"
                    placeholder="e.g. 12345678"
                    error={errors.teammates?.[index]?.studentId?.message}
                    {...register(`teammates.${index}.studentId`)} />
                </div>
              </div>
            ))}
          </div>
        )}

        <Textarea dark label="Dietary Restrictions / Allergies (Optional)"
          placeholder="Let us know if you have any dietary restrictions"
          error={errors.dietaryRestrictions?.message} {...register("dietaryRestrictions")} />

        <Textarea dark label="Anything else you'd like us to know? (Optional)"
          placeholder="Questions, accommodations, etc."
          error={errors.notes?.message} {...register("notes")} />

        {/* Consent */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-navy-800 text-laser-400 focus:ring-laser-400"
              {...register("consent")} />
            <span className="text-sm text-white/60">
              I agree to participate in {eventName} and understand that photos/videos may be taken
              during the event for promotional purposes. *
            </span>
          </label>
          {errors.consent && (
            <p className="mt-1.5 text-xs text-red-400 ml-7" role="alert">{errors.consent.message}</p>
          )}
        </div>

        {/* Privacy notice */}
        <p className="text-xs text-white/25 leading-relaxed">
          Your information is collected solely to organize {eventName} and will not be sold or
          shared with third parties. Contact{" "}
          <a href="mailto:info@laserhack.org" className="underline hover:text-white/50 transition-colors">
            info@laserhack.org
          </a>{" "}
          to request removal of your data after the event.
        </p>

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full justify-center">
          Register for {eventName}
        </Button>
      </form>
    </div>
  );
}
