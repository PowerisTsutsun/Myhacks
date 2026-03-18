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

const STATUS_BADGE: Record<Team["status"], "default" | "green"> = {
  forming: "default",
  complete: "green",
  locked: "green",
};

const EXPERIENCE_BADGE: Record<string, "default" | "green"> = {
  beginner: "green",
  intermediate: "default",
  advanced: "green",
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
          <p className="text-sm mt-1 text-semantic-text-muted">
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
        <div className="mb-4 rounded-xl border px-3 py-3 text-sm text-red-100" style={{ background: "rgba(251,113,133,0.14)", borderColor: "rgba(251,113,133,0.35)" }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b" style={{ borderColor: "rgba(52,211,153,0.16)" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-emerald-400 text-emerald-200"
                : "border-transparent text-semantic-text-muted hover:text-semantic-text-primary"
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-200">
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
                <div className="mb-4 rounded-xl border px-3 py-3 text-sm text-emerald-100" style={{ background: "rgba(52,211,153,0.16)", borderColor: "rgba(52,211,153,0.3)" }}>
                  <strong>{initialPending.length}</strong> pending teammate entr{initialPending.length !== 1 ? "ies" : "y"} waiting for
                  referenced participants to register.
                </div>
              )}
              <div className="grid gap-2">
                {initialUnmatched.map((p) => (
                  <div
                    key={p.id}
                    className="admin-surface flex items-center gap-3 rounded-xl border px-4 py-3"
                    style={{ borderColor: "rgba(52,211,153,0.16)" }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{p.fullName}</p>
                      <p className="text-semantic-text-secondary text-xs truncate">{p.email}</p>
                      {p.major && <p className="text-semantic-text-muted text-xs">{p.major}</p>}
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
    <div
      className={cn(
        "overflow-hidden rounded-2xl border admin-surface",
        isLocked ? "border-emerald-400/30" : ""
      )}
      style={{ borderColor: "rgba(52,211,153,0.18)" }}
    >
      {/* Team header */}
      <div className="flex items-center justify-between border-b px-4 py-3" style={{ background: "rgba(11,29,47,0.85)", borderColor: "rgba(52,211,153,0.12)" }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-white text-sm">
            {team.name ?? `Team #${team.id}`}
          </span>
          <Badge variant={STATUS_BADGE[team.status]} className="text-xs capitalize">
            {team.status}
          </Badge>
          <span className="text-xs text-semantic-text-muted">{FORMATION_LABEL[team.formationType]}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-semantic-text-muted">{team.members.length}/{team.maxSize}</span>
          <button
            onClick={onToggleLock}
            disabled={isPending}
            className="text-xs px-2.5 py-1 rounded-md border border-emerald-400/20 text-semantic-text-secondary hover:bg-emerald-500/10 hover:text-white transition-colors disabled:opacity-50"
          >
            {isLocked ? "Unlock" : "Lock / Finalize"}
          </button>
          {!isLocked && (
            <button
              onClick={onDelete}
              disabled={isPending}
              className="text-xs px-2.5 py-1 rounded-md border border-red-400/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Members */}
      {team.members.length === 0 ? (
        <p className="px-4 py-3 text-xs italic text-semantic-text-muted">No members yet.</p>
      ) : (
        <ul className="divide-y" style={{ borderColor: "rgba(52,211,153,0.08)" }}>
          {team.members.map((m) => (
            <li key={m.memberId} className="flex items-center gap-3 px-4 py-2.5">
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm text-white">{m.fullName}</span>
                {m.role === "lead" && (
                  <span className="ml-1.5 text-xs text-emerald-300 font-medium">Lead</span>
                )}
                <p className="text-xs text-semantic-text-muted truncate">{m.email}</p>
              </div>
              <Badge variant={EXPERIENCE_BADGE[m.experienceLevel] ?? "default"} className="text-xs capitalize">
                {m.experienceLevel}
              </Badge>
              {!isLocked && (
                <button
                  onClick={() => onRemoveMember(m.registrationId)}
                  disabled={isPending}
                  className="ml-1 text-xs text-semantic-text-muted transition-colors hover:text-red-400 disabled:opacity-50"
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
        <p className="border-t px-4 py-2 text-xs text-semantic-text-muted" style={{ background: "rgba(11,29,47,0.6)", borderColor: "rgba(52,211,153,0.1)" }}>
          {team.notes}
        </p>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="admin-surface rounded-2xl border p-10 text-center" style={{ borderColor: "rgba(52,211,153,0.18)" }}>
      <p className="text-sm text-semantic-text-muted">{message}</p>
    </div>
  );
}
