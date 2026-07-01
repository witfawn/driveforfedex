"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock, ArrowRight, FileText, FlaskConical, User, LogOut, Home, Menu, X } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const PIPELINE_STAGES = [
  { key: "new", label: "Account Created" },
  { key: "profile_complete", label: "Profile Complete" },
  { key: "bg_invite_sent", label: "BG Invite Sent" },
  { key: "bg_app_started", label: "BG App Started" },
  { key: "bg_app_complete", label: "BG App Complete" },
  { key: "bg_submitted", label: "BG Submitted" },
  { key: "drug_test_invite_sent", label: "Drug Test Invite Sent" },
  { key: "drug_test_collected", label: "Drug Test Collected" },
];

function getStageIndex(status: string): number {
  return PIPELINE_STAGES.findIndex((s) => s.key === status);
}

function resultBadge(result: string | null | undefined, label: string) {
  if (!result) return <Badge variant="outline">{label}: Not Started</Badge>;
  if (result === "pending") return <Badge variant="warning">{label}: Pending</Badge>;
  if (result === "pass") return <Badge variant="success">{label}: Passed</Badge>;
  if (result === "fail") return <Badge variant="destructive">{label}: Failed</Badge>;
  return <Badge variant="outline">{label}: {result}</Badge>;
}

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      return res.json();
    },
    enabled: !!session?.user,
  });

  if (authStatus === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    redirect("/login");
  }

  const candidate = data?.candidate;
  const profile = data?.profile;
  const stage = data?.stage;

  // +1 because Account Created (index 0) is always done once the user has logged in
  const currentStageIdx = stage ? getStageIndex(stage.status) + 1 : 1;
  const displayName = candidate?.firstName || "";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-lg">DriveForFedex</h1>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg z-50 py-1">
                  <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors" onClick={() => setMenuOpen(false)}>
                    <Home className="w-4 h-4 text-slate-500" />
                    Home
                  </Link>
                  <Link href="/dashboard/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors" onClick={() => setMenuOpen(false)}>
                    <User className="w-4 h-4 text-slate-500" />
                    Profile
                  </Link>
                  <div className="border-t my-1" />
                  <button className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors w-full text-left text-red-600" onClick={() => signOut({ callbackUrl: "/" })}>
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold">Welcome{displayName ? `, ${displayName}` : ""}</h2>
          <p className="text-slate-500 text-sm mt-1">
            Here's where you are in the qualification process.
          </p>
        </div>

        {/* Profile completion alert */}
        {candidate && !candidate.profileComplete && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="font-medium">Complete your profile to start the background check</p>
                <p className="text-sm text-slate-500">We need at least your first name, last name, and email.</p>
              </div>
              <Link href="/dashboard/profile">
                <Button size="sm">Complete Profile</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Qualification Status</CardTitle>
            <CardDescription>Track your progress through the pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-6">
              {resultBadge(stage?.bgResult, "Background")}
              {resultBadge(stage?.drugResult, "Drug Test")}
            </div>
            
            {/* Pipeline Progress */}
            <div className="space-y-2">
              {PIPELINE_STAGES.map((s, idx) => {
                const isDone = idx < currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : isCurrent ? (
                      <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${isDone ? "text-slate-500 line-through" : isCurrent ? "font-medium text-slate-900" : "text-slate-400"}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* FirstAdvantage Instructions */}
        {stage && currentStageIdx >= getStageIndex("bg_invite_sent") && stage.bgResult !== "pass" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Background Check — FirstAdvantage
              </CardTitle>
              <CardDescription>Step-by-step guide to completing your background check</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium mb-1">1. Check your email</p>
                  <p className="text-slate-600">You should have received an email invitation from FirstAdvantage. Click the link in that email to start your application.</p>
                </div>
                <div>
                  <p className="font-medium mb-1">2. Complete all sections</p>
                  <p className="text-slate-600">Fill out every section of the FirstAdvantage application. This includes personal information, address history, employment history, and references. Incomplete applications will delay your background check.</p>
                </div>
                <div>
                  <p className="font-medium mb-1">3. Double-check before submitting</p>
                  <p className="text-slate-600">Make sure all information is accurate. Errors will slow down the process. Common issues: missing middle name, incomplete address history (need 7 years), missing employer phone numbers.</p>
                </div>
                <div>
                  <p className="font-medium mb-1">4. Submit and wait</p>
                  <p className="text-slate-600">Once you submit, the background check typically takes 2-4 business days. You can check your status here anytime.</p>
                </div>
              </div>
              <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
                <p className="text-sm text-amber-800">
                  <strong>Didn&rsquo;t receive the email?</strong> Check your spam folder. If you still can&rsquo;t find it, contact the contractor who referred you.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Drug Test Instructions */}
        {stage && stage.bgResult === "pass" && stage.drugResult !== "pass" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-primary" />
                Drug Test
              </CardTitle>
              <CardDescription>Your background check passed — next step: drug screening</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium mb-1">1. Check your email for drug test instructions</p>
                  <p className="text-slate-600">After your background check clears, you&rsquo;ll receive an email with the location and instructions for your drug test.</p>
                </div>
                <div>
                  <p className="font-medium mb-1">2. Go to the testing facility</p>
                  <p className="text-slate-600">Bring a valid photo ID. The test is a standard urine screen. No appointment needed in most cases — just go during business hours.</p>
                </div>
                <div>
                  <p className="font-medium mb-1">3. Results in 1-3 days</p>
                  <p className="text-slate-600">Results typically come back within 1-3 business days. You&rsquo;ll see the status update here.</p>
                </div>
              </div>
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800">
                  <strong>Important:</strong> The drug screen includes marijuana/THC. Make sure you can pass before completing the test.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Qualified */}
        {stage && stage.bgResult === "pass" && stage.drugResult === "pass" && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-green-900 mb-2">You&rsquo;re Qualified!</h3>
              <p className="text-sm text-green-700 mb-4">
                You&rsquo;ve passed your background check and drug test. You can now tell any FedEx contractor:
                &ldquo;I&rsquo;m pre-qualified and ready for a road test.&rdquo;
              </p>
              {stage.firstAdvantageId && (
                <div className="rounded-md bg-white border border-green-200 p-3 inline-block">
                  <p className="text-sm text-slate-600">Your FedEx ID:</p>
                  <p className="font-mono font-bold text-lg text-slate-900">{stage.firstAdvantageId}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}