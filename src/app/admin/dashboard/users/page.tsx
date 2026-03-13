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

  useEffect(() => { load(); }, []);

  async function updateRole(id: number, role: "admin" | "editor") {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const json = await res.json();
      if (!res.ok) { alert(json.error); return; }
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
      if (!res.ok) { alert(json.error); return; }
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
      if (!res.ok) { alert(json.error); return; }
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Users</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage accounts, roles, and two-factor authentication.
        </p>
      </div>

      {loading && <p className="text-slate-400 text-sm">Loading…</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {!loading && !error && (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">2FA</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 text-slate-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-laser-100 text-laser-700"
                          : "bg-slate-100 text-slate-600"
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
                        user.twoFactorEnabled ? "bg-laser-500" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          user.twoFactorEnabled ? "translate-x-4.5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.role === "editor" ? (
                        <button
                          onClick={() => updateRole(user.id, "admin")}
                          disabled={updating === user.id}
                          className="text-xs text-laser-600 hover:text-laser-700 font-medium disabled:opacity-40"
                        >
                          Make Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => updateRole(user.id, "editor")}
                          disabled={updating === user.id}
                          className="text-xs text-slate-500 hover:text-slate-700 font-medium disabled:opacity-40"
                        >
                          Make Editor
                        </button>
                      )}
                      <button
                        onClick={() => deleteUser(user.id, user.name)}
                        disabled={updating === user.id}
                        className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
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
