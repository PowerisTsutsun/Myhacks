"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TeamMember {
  memberId: number;
  teamId: number;
  role: "lead" | "member";
  joinedAt: Date;
  registrationId: number;
  fullName: string;
  email: string;
  experienceLevel: string;
  teamStatus: string;
}

interface Team {
  id: number;
  name: string | null;
  formationType: "premade" | "auto_matched" | "organizer_created";
  status: "forming" | "complete" | "locked";
  maxSize: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  members: TeamMember[];
}

interface UnmatchedParticipant {
  id: number;
  fullName: string;
  email: string;
  experienceLevel: string;
  major: string | null;
  createdAt: Date;
}

interface PendingEntry {
  id: number;
  registrantId: number;
  teammateFirstName: string | null;
  teammateLastName: string | null;
  teammateEmail: string | null;
  createdAt: Date;
}

interface TeamsManagerProps {
  initialTeams: Team[];
  initialUnmatched: UnmatchedParticipant[];
  initialPending: PendingEntry[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FORMATION_LABEL: Record<Team["formationType"], string> = {
  premade: "Premade",
  auto_matched: "Auto-matched",
  organizer_created: "Created by organizer",
};

const STATUS_BADGE: Record<Team["status"], "default" | "green" | "gold"> = {
  forming: "default",
  complete: "green",
  locked: "gold",
};

const EXPERIENCE_BADGE: Record<string, "laser" | "gold" | "green"> = {
  beginner: "green",
  intermediate: "laser",
  advanced: "gold",
};

type Tab = "unmatched" | "premade" | "auto_matched" | "organizer_created" | "locked";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TeamsManager({ initialTeams, initialUnmatched, initialPending }: TeamsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<Tab>("unmatched");
  const [error, setError] = useState<string | null>(null);
  const [autoMatchLoading, setAutoMatchLoading] = useState(false);

  async function refresh() {
    startTransition(() => router.refresh());
  }

  // --- Auto-match ---
  async function handleAutoMatch() {
    setAutoMatchLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/teams/auto-match", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Auto-match failed.");
      } else {
        refresh();
      }
    } catch {
      setError("Network error.");
    } finally {
      setAutoMatchLoading(false);
    }
  }

  // --- Lock / unlock team ---
  async function toggleLock(team: Team) {
    const newStatus = team.status === "locked" ? "forming" : "locked";
    await fetch(`/api/admin/teams/${team.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    refresh();
  }

  // --- Remove member ---
  async function removeMember(teamId: number, registrationId: number) {
    await fetch(`/api/admin/teams/${teamId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", registrationId }),
    });
    refresh();
  }

  // --- Delete team ---
  async function deleteTeam(teamId: number) {
    if (!confirm("Delete this team? Members will be unassigned.")) return;
    await fetch(`/api/admin/teams/${teamId}`, { method: "DELETE" });
    refresh();
  }

  // --- Tab filter ---
  const teamsByTab: Record<Tab, Team[]> = {
    unmatched: [],
    premade: initialTeams.filter((t) => t.formationType === "premade" && t.status !== "locked"),
    auto_matched: initialTeams.filter((t) => t.formationType === "auto_matched" && t.status !== "locked"),
    organizer_created: initialTeams.filter((t) => t.formationType === "organizer_created" && t.status !== "locked"),
    locked: initialTeams.filter((t) => t.status === "locked"),
  };

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: "unmatched", label: "Unmatched", count: initialUnmatched.length },
    { id: "premade", label: "Premade", count: teamsByTab.premade.length },
    { id: "auto_matched", label: "Suggested", count: teamsByTab.auto_matched.length },
    { id: "organizer_created", label: "Organizer-created", count: teamsByTab.organizer_created.length },
    { id: "locked", label: "Finalized", count: teamsByTab.locked.length },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Teams</h1>
          <p className="text-slate-400 text-sm mt-1">
            {initialTeams.length} team{initialTeams.length !== 1 ? "s" : ""} &bull;{" "}
            {initialUnmatched.length} unmatched participant{initialUnmatched.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={handleAutoMatch}
          loading={autoMatchLoading}
          disabled={initialUnmatched.length < 2}
        >
          Auto-match unmatched
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-laser-500 text-laser-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-slate-100 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Unmatched tab */}
      {activeTab === "unmatched" && (
        <div>
          {initialUnmatched.length === 0 ? (
            <EmptyState message="No unmatched participants." />
          ) : (
            <>
              {initialPending.length > 0 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                  <strong>{initialPending.length}</strong> pending teammate entr{initialPending.length !== 1 ? "ies" : "y"} waiting for
                  referenced participants to register.
                </div>
              )}
              <div className="grid gap-2">
                {initialUnmatched.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-navy-900 text-sm truncate">{p.fullName}</p>
                      <p className="text-slate-500 text-xs truncate">{p.email}</p>
                      {p.major && <p className="text-slate-400 text-xs">{p.major}</p>}
                    </div>
                    <Badge variant={EXPERIENCE_BADGE[p.experienceLevel] ?? "default"} className="capitalize text-xs">
                      {p.experienceLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Team list tabs */}
      {activeTab !== "unmatched" && (
        <div>
          {teamsByTab[activeTab].length === 0 ? (
            <EmptyState
              message={
                activeTab === "auto_matched"
                  ? "No suggested teams yet. Use 'Auto-match unmatched' above to generate suggestions."
                  : activeTab === "locked"
                  ? "No finalized teams yet."
                  : "No teams in this category."
              }
            />
          ) : (
            <div className="space-y-4">
              {teamsByTab[activeTab].map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  onToggleLock={() => toggleLock(team)}
                  onRemoveMember={(regId) => removeMember(team.id, regId)}
                  onDelete={() => deleteTeam(team.id)}
                  isPending={isPending}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TeamCard
// ---------------------------------------------------------------------------

function TeamCard({
  team,
  onToggleLock,
  onRemoveMember,
  onDelete,
  isPending,
}: {
  team: Team;
  onToggleLock: () => void;
  onRemoveMember: (regId: number) => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  const isLocked = team.status === "locked";

  return (
    <div className={cn(
      "bg-white border rounded-xl overflow-hidden",
      isLocked ? "border-gold-300 bg-amber-50/30" : "border-slate-200"
    )}>
      {/* Team header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-navy-900 text-sm">
            {team.name ?? `Team #${team.id}`}
          </span>
          <Badge variant={STATUS_BADGE[team.status]} className="text-xs capitalize">
            {team.status}
          </Badge>
          <span className="text-xs text-slate-400">{FORMATION_LABEL[team.formationType]}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-slate-400">{team.members.length}/{team.maxSize}</span>
          <button
            onClick={onToggleLock}
            disabled={isPending}
            className="text-xs px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {isLocked ? "Unlock" : "Lock / Finalize"}
          </button>
          {!isLocked && (
            <button
              onClick={onDelete}
              disabled={isPending}
              className="text-xs px-2.5 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Members */}
      {team.members.length === 0 ? (
        <p className="px-4 py-3 text-xs text-slate-400 italic">No members yet.</p>
      ) : (
        <ul className="divide-y divide-slate-50">
          {team.members.map((m) => (
            <li key={m.memberId} className="flex items-center gap-3 px-4 py-2.5">
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm text-navy-900">{m.fullName}</span>
                {m.role === "lead" && (
                  <span className="ml-1.5 text-xs text-laser-600 font-medium">Lead</span>
                )}
                <p className="text-xs text-slate-500 truncate">{m.email}</p>
              </div>
              <Badge variant={EXPERIENCE_BADGE[m.experienceLevel] ?? "default"} className="text-xs capitalize">
                {m.experienceLevel}
              </Badge>
              {!isLocked && (
                <button
                  onClick={() => onRemoveMember(m.registrationId)}
                  disabled={isPending}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors ml-1 disabled:opacity-50"
                  aria-label={`Remove ${m.fullName}`}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {team.notes && (
        <p className="px-4 py-2 text-xs text-slate-500 border-t border-slate-100 bg-slate-50">
          {team.notes}
        </p>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
}
