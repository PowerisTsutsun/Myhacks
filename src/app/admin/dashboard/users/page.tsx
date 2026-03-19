"use client";

import { useEffect, useState } from "react";
import { SYSTEM_ADMIN_EMAIL } from "@/lib/auth/constants";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor";
  twoFactorEnabled: boolean;
  createdAt: string;
}

function getRoleLabel(role: "admin" | "editor") {
  return role === "editor" ? "user" : "admin";
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      setUsers(await res.json());
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateRole(id: number, role: "admin" | "editor") {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error);
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: json.role } : u)));
    } finally {
      setUpdating(null);
    }
  }

  async function toggle2FA(id: number, current: boolean) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twoFactorEnabled: !current }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error);
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, twoFactorEnabled: json.twoFactorEnabled } : u)));
    } finally {
      setUpdating(null);
    }
  }

  async function deleteUser(id: number, name: string) {
    if (!confirm(`Delete account for "${name}"? This cannot be undone.`)) return;
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error);
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Users</h1>
        <p className="mt-1 text-sm text-semantic-text-muted">
          Manage accounts, roles, and two-factor authentication.
        </p>
      </div>

      {loading && <p className="text-sm text-semantic-text-muted">Loading...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="admin-surface overflow-hidden rounded-2xl border" style={{ borderColor: "rgba(52,211,153,0.18)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b text-xs uppercase tracking-wider text-semantic-text-muted"
                style={{ background: "rgba(11,29,47,0.98)", borderColor: "rgba(52,211,153,0.16)" }}
              >
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">2FA</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "rgba(52,211,153,0.08)" }}>
              {users.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-emerald-500/[0.05]">
                  <td className="px-4 py-3 font-medium text-white">{user.name}</td>
                  <td className="px-4 py-3 text-semantic-text-secondary">{user.email}</td>
                  <td className="px-4 py-3">
                    {(() => {
                      const isSystemAdmin = user.email.toLowerCase() === SYSTEM_ADMIN_EMAIL;

                      return (
                        <div
                          className="inline-flex items-center rounded-full border p-1"
                          style={{
                            background: "rgba(5,18,34,0.92)",
                            borderColor: user.role === "admin" ? "rgba(52,211,153,0.26)" : "rgba(255,255,255,0.1)",
                          }}
                          title={isSystemAdmin ? "System admin role is protected." : "Change user role"}
                        >
                          {(["editor", "admin"] as const).map((roleOption) => {
                            const active = user.role === roleOption;
                            return (
                              <button
                                key={roleOption}
                                type="button"
                                onClick={() => updateRole(user.id, roleOption)}
                                disabled={updating === user.id || isSystemAdmin || active}
                                aria-pressed={active}
                                className="rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                                style={
                                  active
                                    ? {
                                        background: roleOption === "admin" ? "rgba(16,185,129,0.18)" : "rgba(96,165,250,0.16)",
                                        color: roleOption === "admin" ? "#bbf7d0" : "#c4dafe",
                                      }
                                    : {
                                        background: "transparent",
                                        color: "rgba(255,255,255,0.58)",
                                      }
                                }
                              >
                                {getRoleLabel(roleOption)}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle2FA(user.id, user.twoFactorEnabled)}
                      disabled={updating === user.id}
                      title={user.twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-40 ${
                        user.twoFactorEnabled ? "bg-emerald-500" : "bg-semantic-border"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          user.twoFactorEnabled ? "translate-x-4.5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-semantic-text-muted">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(() => {
                        const isSystemAdmin = user.email.toLowerCase() === SYSTEM_ADMIN_EMAIL;

                        return (
                          <>
                      <button
                        onClick={() => deleteUser(user.id, user.name)}
                        disabled={updating === user.id || isSystemAdmin}
                        title={isSystemAdmin ? "System admin cannot be deleted." : "Delete user"}
                        className="text-xs font-medium text-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isSystemAdmin ? "Protected" : "Delete"}
                      </button>
                          </>
                        );
                      })()}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-semantic-text-muted">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
