"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ADMIN_EMAILS } from "@/lib/config";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";

const STATUSES = [
  { value: "new", label: "New" },
  { value: "profile_complete", label: "Profile Complete" },
  { value: "bg_invite_sent", label: "BG Invite Sent" },
  { value: "bg_app_started", label: "BG App Started" },
  { value: "bg_app_complete", label: "BG App Complete" },
  { value: "bg_submitted", label: "BG Submitted" },
  { value: "drug_test_invite_sent", label: "Drug Test Invite Sent" },
  { value: "drug_test_collected", label: "Drug Test Collected" },
];

const RESULTS = [
  { value: "", label: "—" },
  { value: "pending", label: "Pending" },
  { value: "pass", label: "Pass" },
  { value: "fail", label: "Fail" },
];

function resultBadge(result: string | null | undefined) {
  if (!result) return <Badge variant="outline">—</Badge>;
  if (result === "pending") return <Badge variant="warning">Pending</Badge>;
  if (result === "pass") return <Badge variant="success">Pass</Badge>;
  if (result === "fail") return <Badge variant="destructive">Fail</Badge>;
  return <Badge variant="outline">{result}</Badge>;
}

export default function CandidateDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status: authStatus } = useSession();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [bgResult, setBgResult] = useState("");
  const [drugResult, setDrugResult] = useState("");
  const [firstAdvantageId, setFirstAdvantageId] = useState("");
  const [notes, setNotes] = useState("");
  let loaded = false;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-candidate", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/candidates/${params.id}`);
      return res.json();
    },
    enabled: !!session?.user,
  });

  // Populate form when data loads
  if (data?.stage && !loaded) {
    loaded = true;
    if (!status) setStatus(data.stage.status);
    if (!bgResult) setBgResult(data.stage.bgResult || "");
    if (!drugResult) setDrugResult(data.stage.drugResult || "");
    if (!firstAdvantageId) setFirstAdvantageId(data.stage.firstAdvantageId || "");
  }

  const mutation = useMutation({
    mutationFn: async (updateData: any) => {
      const res = await fetch(`/api/admin/candidates/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Updated!");
      queryClient.invalidateQueries({ queryKey: ["admin-candidate", params.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-candidates"] });
    },
    onError: () => {
      toast.error("Failed to update");
    },
  });

  if (authStatus === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session?.user) redirect("/login");
  const isAdmin = session.user.email && ADMIN_EMAILS.includes(session.user.email as string);
  if (!isAdmin) redirect("/dashboard");

  const candidate = data?.candidate;
  const profile = data?.profile;
  const stage = data?.stage;
  const activity = data?.activity || [];

  const handleSave = () => {
    const updateData: any = {};
    if (status && status !== stage?.status) updateData.status = status;
    if (bgResult !== (stage?.bgResult || "")) updateData.bgResult = bgResult || null;
    if (drugResult !== (stage?.drugResult || "")) updateData.drugResult = drugResult || null;
    if (firstAdvantageId !== (stage?.firstAdvantageId || "")) updateData.firstAdvantageId = firstAdvantageId;
    if (notes) updateData.notes = notes;
    mutation.mutate(updateData);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="font-bold text-lg">Candidate Detail</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Candidate Info */}
        <Card>
          <CardHeader>
            <CardTitle>
              {candidate?.firstName ? `${candidate.firstName} ${candidate.lastName || ""}`.trim() : "Unnamed Candidate"}
            </CardTitle>
            <CardDescription>{candidate?.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {candidate?.phone && (
              <div><span className="text-slate-500">Phone:</span> {candidate.phone}</div>
            )}
            {profile?.workExperience && (
              <div><span className="text-slate-500">Experience:</span> {profile.workExperience}</div>
            )}
            {profile?.availableDays && (
              <div>
                <span className="text-slate-500">Available:</span>{" "}
                {JSON.parse(profile.availableDays).join(", ")}
              </div>
            )}
            {profile?.preferredTerminals && (
              <div>
                <span className="text-slate-500">Preferred Terminals:</span>{" "}
                {JSON.parse(profile.preferredTerminals).join(", ")}
              </div>
            )}
            {profile?.hasCDL !== null && profile?.hasCDL !== undefined && (
              <div><span className="text-slate-500">CDL:</span> {profile.hasCDL ? "Yes" : "No"}</div>
            )}
            {profile?.hasVehicle !== null && profile?.hasVehicle !== undefined && (
              <div><span className="text-slate-500">Vehicle:</span> {profile.hasVehicle ? "Yes" : "No"}</div>
            )}
            {profile?.additionalNotes && (
              <div><span className="text-slate-500">Notes:</span> {profile.additionalNotes}</div>
            )}
            <div className="text-xs text-slate-400">
              Joined: {candidate?.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : "—"}
            </div>
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{STATUSES.find(s => s.value === stage?.status)?.label || stage?.status}</Badge>
              <span className="text-sm text-slate-500">BG:</span> {resultBadge(stage?.bgResult)}
              <span className="text-sm text-slate-500">Drug:</span> {resultBadge(stage?.drugResult)}
            </div>
            {stage?.firstAdvantageId && (
              <div className="text-sm">
                <span className="text-slate-500">FedEx ID:</span>{" "}
                <span className="font-mono font-bold">{stage.firstAdvantageId}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Management */}
        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
            <CardDescription>Manually advance the candidate through the pipeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pipeline Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Background Result</Label>
                <Select value={bgResult} onValueChange={setBgResult}>
                  <SelectTrigger>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESULTS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Drug Test Result</Label>
                <Select value={drugResult} onValueChange={setDrugResult}>
                  <SelectTrigger>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESULTS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="faId">FirstAdvantage / FedEx ID</Label>
              <Input
                id="faId"
                value={firstAdvantageId}
                onChange={(e) => setFirstAdvantageId(e.target.value)}
                placeholder="FedEx ID number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Activity Note (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note about this update..."
                rows={2}
              />
            </div>

            <Button onClick={handleSave} disabled={mutation.isPending} className="w-full">
              <Save className="w-4 h-4 mr-1" />
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Activity Log */}
        {activity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activity.slice().reverse().map((a: any) => (
                  <div key={a.id} className="flex gap-3 text-sm">
                    <div className="text-slate-400 text-xs whitespace-nowrap pt-0.5">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">{a.action}</span>
                      {a.details && <span className="text-slate-500"> — {a.details}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
