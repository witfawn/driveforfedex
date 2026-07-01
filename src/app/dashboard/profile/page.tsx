"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TERMINALS, DAYS_OF_WEEK } from "@/lib/config";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const STEPS = [
  "Name",
  "Phone",
  "Experience",
  "Availability",
  "Terminals",
  "Review",
];

type FormData = {
  firstName: string;
  lastName: string;
  phone: string;
  workExperience: string;
  availableDays: string[];
  preferredTerminals: string[];
  hasCDL: boolean;
  hasVehicle: boolean;
  additionalNotes: string;
};

const defaultFormData: FormData = {
  firstName: "",
  lastName: "",
  phone: "",
  workExperience: "",
  availableDays: [],
  preferredTerminals: [],
  hasCDL: false,
  hasVehicle: false,
  additionalNotes: "",
};

export default function ProfilePage() {
  const { data: session, status: authStatus } = useSession();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [loading, setLoading] = useState(true);

  // Load existing profile data on mount
  useEffect(() => {
    if (session?.user) {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((data) => {
          if (data.candidate) {
            setFormData((prev) => ({
              ...prev,
              firstName: data.candidate.firstName || "",
              lastName: data.candidate.lastName || "",
              phone: data.candidate.phone || "",
            }));
          }
          if (data.profile) {
            setFormData((prev) => ({
              ...prev,
              workExperience: data.profile.workExperience || "",
              availableDays: data.profile.availableDays
                ? JSON.parse(data.profile.availableDays)
                : [],
              preferredTerminals: data.profile.preferredTerminals
                ? JSON.parse(data.profile.preferredTerminals)
                : [],
              hasCDL: data.profile.hasCDL || false,
              hasVehicle: data.profile.hasVehicle || false,
              additionalNotes: data.profile.additionalNotes || "",
            }));
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  // Submit profile via PUT /api/profile
  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Profile saved!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      window.location.href = "/dashboard";
    },
    onError: () => {
      toast.error("Failed to save profile");
    },
  });

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session?.user) redirect("/login");

  const canProceed = () => {
    if (step === 0) return formData.firstName.trim() && formData.lastName.trim();
    if (step === 1) return formData.phone.trim().length > 0;
    return true;
  };

  const toggleArray = (key: "availableDays" | "preferredTerminals", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const progressPercent = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold text-slate-900">Complete Your Profile</h1>
            <span className="text-sm text-slate-500">
              Step {step + 1} of {STEPS.length}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            {STEPS.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={`text-[10px] sm:text-xs font-medium transition-colors ${
                  i === step
                    ? "text-primary"
                    : i < step
                      ? "text-green-600 cursor-pointer hover:text-green-700"
                      : "text-slate-400"
                }`}
              >
                {i < step ? "✓" : i + 1}
                <span className="hidden sm:inline">&nbsp;{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step content */}
        <Card>
          <CardHeader>
            <CardTitle>{getStepTitle(step)}</CardTitle>
            <CardDescription>{getStepDescription(step)}</CardDescription>
          </CardHeader>
          <CardContent>
            {step === 0 && renderNameStep(formData, setFormData)}
            {step === 1 && renderPhoneStep(formData, setFormData)}
            {step === 2 && renderExperienceStep(formData, setFormData)}
            {step === 3 && renderAvailabilityStep(formData, toggleArray)}
            {step === 4 && renderTerminalsStep(formData, toggleArray)}
            {step === 5 && renderReviewStep(formData, mutation)}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        {step < 5 && (
          <div className="flex items-center justify-between mt-4">
            {step > 0 ? (
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            ) : (
              <div />
            )}
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          By completing your profile, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-slate-600">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-slate-600">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );

  function handleNext() {
    if (!canProceed()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
}

// ── Step titles and descriptions ─────────────────────────────────

function getStepTitle(step: number): string {
  switch (step) {
    case 0:
      return "What's your name?";
    case 1:
      return "Phone Number";
    case 2:
      return "Work Experience";
    case 3:
      return "Available Days";
    case 4:
      return "Available Terminals";
    case 5:
      return "Review & Submit";
    default:
      return "";
  }
}

function getStepDescription(step: number): string {
  switch (step) {
    case 0:
      return "Let us know who you are.";
    case 1:
      return "We\'ll use this to reach you about opportunities.";
    case 2:
      return "Tell us about your previous driving or relevant work experience. This will be visible to FedEx contractors reviewing candidates.";
    case 3:
      return "Which days of the week are you available to work?";
    case 4:
      return "Select all the terminals you are willing to work at.";
    case 5:
      return "Please review your information before submitting.";
    default:
      return "";
  }
}

// ── Step 0: Name ─────────────────────────────────────────────────

function renderNameStep(
  formData: FormData,
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">
          First Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="firstName"
          placeholder="John"
          value={formData.firstName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, firstName: e.target.value }))
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">
          Last Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="lastName"
          placeholder="Doe"
          value={formData.lastName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, lastName: e.target.value }))
          }
          required
        />
      </div>
    </div>
  );
}

// ── Step 1: Phone ────────────────────────────────────────────────

function renderPhoneStep(
  formData: FormData,
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
) {
  return (
    <div className="space-y-2">
      <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
      <Input
        id="phone"
        type="tel"
        placeholder="(503) 555-1234"
        value={formData.phone}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, phone: e.target.value }))
        }
      />
      <p className="text-xs text-slate-400">
        Used for SMS updates about your application.
      </p>
    </div>
  );
}

// ── Step 2: Work Experience ─────────────────────────────────────

function renderExperienceStep(
  formData: FormData,
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
) {
  return (
    <div className="space-y-2">
      <Label htmlFor="workExperience">Work Experience</Label>
      <Textarea
        id="workExperience"
        placeholder="Describe your driving experience, previous employers, and relevant skills..."
        rows={5}
        value={formData.workExperience}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            workExperience: e.target.value,
          }))
        }
      />
      <p className="text-xs text-slate-400">
        Optional. Include any commercial driving, delivery, or logistics roles.
      </p>
    </div>
  );
}

// ── Step 3: Availability ─────────────────────────────────────────

function renderAvailabilityStep(
  formData: FormData,
  toggleArray: (key: "availableDays" | "preferredTerminals", value: string) => void,
) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">Select all days you are available:</p>
      <div className="flex flex-wrap gap-2">
        {DAYS_OF_WEEK.map((day) => {
          const active = formData.availableDays.includes(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggleArray("availableDays", day)}
              className={`flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {active && <Check className="w-3.5 h-3.5" />}
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 4: Terminals ────────────────────────────────────────────

function renderTerminalsStep(
  formData: FormData,
  toggleArray: (key: "availableDays" | "preferredTerminals", value: string) => void,
) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">Select all terminals you are willing to work at:</p>
      <div className="flex flex-col gap-3">
        {TERMINALS.map((terminal) => {
          const active = formData.preferredTerminals.includes(terminal.code);
          return (
            <button
              key={terminal.code}
              type="button"
              onClick={() => toggleArray("preferredTerminals", terminal.code)}
              className={`flex flex-col items-start gap-0.5 rounded-lg border p-4 text-left transition-all ${
                active
                  ? "bg-primary/5 border-primary ring-1 ring-primary"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                {active && <Check className="w-4 h-4 text-primary shrink-0" />}
                <span className={active ? "text-primary" : "text-slate-900"}>
                  {terminal.name}
                </span>
              </span>
              <span
                className={`text-xs ml-6 ${
                  active ? "text-primary/70" : "text-slate-400"
                }`}
              >
                {terminal.address}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 5: Review & Submit ──────────────────────────────────────

function renderReviewStep(
  formData: FormData,
  mutation: { mutate: (data: FormData) => void; isPending: boolean },
) {
  const terminalNames = formData.preferredTerminals
    .map((code) => {
      const t = TERMINALS.find((t) => t.code === code);
      return t ? t.name : code;
    })
    .join(", ");

  return (
    <div className="space-y-5">
      {/* Personal Info */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Personal Info</h3>
        <div className="rounded-lg border bg-slate-50 divide-y divide-slate-100">
          <div className="flex justify-between px-4 py-2.5 text-sm">
            <span className="text-slate-500">Name</span>
            <span className="font-medium text-slate-900">
              {formData.firstName} {formData.lastName}
            </span>
          </div>
          <div className="flex justify-between px-4 py-2.5 text-sm">
            <span className="text-slate-500">Phone</span>
            <span className="font-medium text-slate-900">
              {formData.phone || <span className="text-slate-400 italic">Not provided</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Experience */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Work Experience</h3>
        <div className="rounded-lg border bg-slate-50 px-4 py-2.5">
          {formData.workExperience ? (
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{formData.workExperience}</p>
          ) : (
            <p className="text-sm text-slate-400 italic">Not provided</p>
          )}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Availability</h3>
        <div className="rounded-lg border bg-slate-50 px-4 py-2.5">
          {formData.availableDays.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {formData.availableDays.map((day) => (
                <Badge key={day} variant="secondary">
                  {day}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">None selected</p>
          )}
        </div>
      </div>

      {/* Terminals */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Available Terminals</h3>
        <div className="rounded-lg border bg-slate-50 px-4 py-2.5">
          {formData.preferredTerminals.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {formData.preferredTerminals.map((code) => {
                const t = TERMINALS.find((t) => t.code === code);
                return (
                  <Badge key={code} variant="secondary">
                    {t ? t.name : code}
                  </Badge>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">None selected</p>
          )}
        </div>
      </div>

      {/* Submit button */}
      <Button
        className="w-full"
        size="lg"
        onClick={() => mutation.mutate(formData)}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2" />
            Saving...
          </>
        ) : (
          <>
            <Check className="w-4 h-4 mr-2" />
            Submit Profile
          </>
        )}
      </Button>
    </div>
  );
}
