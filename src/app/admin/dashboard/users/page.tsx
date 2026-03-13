"use client";

import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor";
  twoFactorEnabled: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/users");
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
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                        user.role === "admin"
                          ? "border-emerald-400/35 bg-emerald-500/16 text-emerald-200"
                          : "border-semantic-border bg-semantic-background-secondary text-semantic-text-muted"
                      }`}
                    >
                      {user.role}
                    </span>
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
                      {user.role === "editor" ? (
                        <button
                          onClick={() => updateRole(user.id, "admin")}
                          disabled={updating === user.id}
                          className="text-xs font-medium text-emerald-300 hover:text-emerald-200 disabled:opacity-40"
                        >
                          Make Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => updateRole(user.id, "editor")}
                          disabled={updating === user.id}
                          className="text-xs font-medium text-semantic-text-muted hover:text-semantic-text-primary disabled:opacity-40"
                        >
                          Make Editor
                        </button>
                      )}
                      <button
                        onClick={() => deleteUser(user.id, user.name)}
                        disabled={updating === user.id}
                        className="text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-40"
                      >
                        Delete
                      </button>
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
