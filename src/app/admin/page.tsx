"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ADMIN_EMAILS } from "@/lib/config";
import { Truck, Users } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  profile_complete: "Profile Complete",
  bg_invite_sent: "BG Invite Sent",
  bg_app_started: "BG App Started",
  bg_app_complete: "BG App Complete",
  bg_submitted: "BG Submitted",
  drug_test_invite_sent: "Drug Test Invite Sent",
  drug_test_collected: "Drug Test Collected",
};

function resultBadge(result: string | null | undefined) {
  if (!result) return <Badge variant="outline">—</Badge>;
  if (result === "pending") return <Badge variant="warning">Pending</Badge>;
  if (result === "pass") return <Badge variant="success">Pass</Badge>;
  if (result === "fail") return <Badge variant="destructive">Fail</Badge>;
  return <Badge variant="outline">{result}</Badge>;
}

export default function AdminPage() {
  const { data: session, status: authStatus } = useSession();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-candidates"],
    queryFn: async () => {
      const res = await fetch("/api/admin/candidates");
      return res.json();
    },
    enabled: !!session?.user,
  });

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session?.user) redirect("/login");

  const isAdmin = session.user.email && ADMIN_EMAILS.includes(session.user.email as string);
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="font-medium text-slate-900 mb-2">Access Denied</p>
            <p className="text-sm text-slate-500">You need admin access to view this page.</p>
            <Link href="/dashboard">
              <Button variant="outline" className="mt-4">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const candidates = data?.candidates || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            <h1 className="font-bold text-lg">DriveForFedex Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">Candidate View</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Candidates
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {candidates.length} total candidates in the pipeline
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "New", count: candidates.filter((c: any) => c.stage?.status === "new").length },
            { label: "In Progress", count: candidates.filter((c: any) => ["profile_complete", "bg_invite_sent", "bg_app_started", "bg_app_complete", "bg_submitted"].includes(c.stage?.status)).length },
            { label: "BG Passed", count: candidates.filter((c: any) => c.stage?.bgResult === "pass").length },
            { label: "Fully Qualified", count: candidates.filter((c: any) => c.stage?.bgResult === "pass" && c.stage?.drugResult === "pass").length },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-2xl font-bold text-primary">{stat.count}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Candidate Table */}
        <Card>
          <CardContent className="p-0">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium">Email</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">BG</th>
                    <th className="p-3 font-medium">Drug</th>
                    <th className="p-3 font-medium">Updated</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c: any) => (
                    <tr key={c.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-medium">
                        {c.firstName ? `${c.firstName} ${c.lastName || ""}`.trim() : "—"}
                      </td>
                      <td className="p-3 text-slate-600">{c.email}</td>
                      <td className="p-3">
                        <Badge variant="secondary">{STATUS_LABELS[c.stage?.status] || c.stage?.status}</Badge>
                      </td>
                      <td className="p-3">{resultBadge(c.stage?.bgResult)}</td>
                      <td className="p-3">{resultBadge(c.stage?.drugResult)}</td>
                      <td className="p-3 text-slate-500 text-xs">
                        {c.stage?.updatedAt ? new Date(c.stage.updatedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="p-3 text-right">
                        <Link href={`/admin/candidates/${c.id}`}>
                          <Button variant="ghost" size="sm">Manage</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y">
              {candidates.map((c: any) => (
                <Link key={c.id} href={`/admin/candidates/${c.id}`} className="block p-4 hover:bg-slate-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">
                      {c.firstName ? `${c.firstName} ${c.lastName || ""}`.trim() : c.email}
                    </span>
                    {resultBadge(c.stage?.bgResult === "pass" && c.stage?.drugResult === "pass" ? "pass" : c.stage?.bgResult)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Badge variant="secondary">{STATUS_LABELS[c.stage?.status] || c.stage?.status}</Badge>
                    <span>{c.email}</span>
                  </div>
                </Link>
              ))}
            </div>

            {candidates.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No candidates yet.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
