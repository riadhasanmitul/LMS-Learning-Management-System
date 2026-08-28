"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getToken, logout } from "@/lib/auth";
import {
  assignUserRole,
  blockUser,
  getAdminUsers,
  unblockUser,
  type AdminUser,
} from "@/services/admin";

const roles = [
  "Student",
  "Instructor",
  "Content Manager",
  "Admin",
];

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyUser, setBusyUser] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    async function loadUsers() {
      try {
        const result = await getAdminUsers(token);
        setUsers(result);
      } catch (error: unknown) {
        console.error(error);

        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {
          logout();
          router.push("/login");
          return;
        }

        if (
          axios.isAxiosError(error) &&
          error.response?.status === 403
        ) {
          setError("Admin access required.");
          return;
        }

        setError("Unable to load users.");
      } finally {
        setLoading(false);
      }
    }

    void loadUsers();
  }, [router]);

  async function handleRoleChange(
    user: AdminUser,
    role: string,
  ) {
    if (!role || role === user.role?.name) {
      return;
    }

    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    setBusyUser(user.documentId);
    setError("");

    try {
      const response = await assignUserRole(
        token,
        user.documentId,
        role,
      );

      const updatedRole = response?.data?.role;

      setUsers((current) =>
        current.map((item) =>
          item.documentId === user.documentId
            ? {
                ...item,
                role: updatedRole
                  ? {
                      id: updatedRole.id,
                      name: updatedRole.name,
                      type: updatedRole.type,
                    }
                  : item.role,
              }
            : item,
        ),
      );
    } catch (error: unknown) {
      console.error(error);

      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        logout();
        router.push("/login");
        return;
      }

      if (
        axios.isAxiosError(error) &&
        error.response?.data?.error?.message
      ) {
        setError(error.response.data.error.message);
      } else {
        setError("Unable to change user role.");
      }
    } finally {
      setBusyUser(null);
    }
  }

  async function handleBlockToggle(user: AdminUser) {
    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    setBusyUser(user.documentId);
    setError("");

    try {
      if (user.blocked) {
        await unblockUser(token, user.documentId);
      } else {
        await blockUser(token, user.documentId);
      }

      setUsers((current) =>
        current.map((item) =>
          item.documentId === user.documentId
            ? {
                ...item,
                blocked: !item.blocked,
              }
            : item,
        ),
      );
    } catch (error: unknown) {
      console.error(error);

      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        logout();
        router.push("/login");
        return;
      }

      if (
        axios.isAxiosError(error) &&
        error.response?.data?.error?.message
      ) {
        setError(error.response.data.error.message);
      } else {
        setError(
          user.blocked
            ? "Unable to unblock user."
            : "Unable to block user.",
        );
      }
    } finally {
      setBusyUser(null);
    }
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-32 rounded-3xl bg-slate-200" />
            <div className="h-20 rounded-2xl bg-slate-200" />
            <div className="h-20 rounded-2xl bg-slate-200" />
            <div className="h-20 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (error && users.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Access Denied
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <Link
            href="/login"
            className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/admin"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              C
            </div>

            <div>
              <div className="font-bold text-slate-900">
                CPS LMS
              </div>

              <div className="text-[11px] text-slate-400">
                Admin Portal
              </div>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <section className="flex flex-col gap-5 rounded-3xl bg-slate-950 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-400">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold text-white">
              User Management
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Manage accounts, roles, and access.
            </p>
          </div>

          <Link
            href="/admin"
            className="text-sm font-medium text-slate-300 hover:text-white"
          >
            ← Dashboard
          </Link>
        </section>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="font-bold text-slate-900">
              Users
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {users.length} user{users.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {users.map((user) => {
              const isBusy = busyUser === user.documentId;

              return (
                <div
                  key={user.documentId}
                  className="p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {user.username}
                        </h3>

                        {user.blocked && (
                          <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                            Blocked
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {user.email}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {user.confirmed
                          ? "Confirmed"
                          : "Not confirmed"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <select
                        value={user.role?.name ?? ""}
                        onChange={(event) =>
                          void handleRoleChange(
                            user,
                            event.target.value,
                          )
                        }
                        disabled={isBusy}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      >
                        <option value="" disabled>
                          No role
                        </option>

                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() =>
                          void handleBlockToggle(user)
                        }
                        disabled={isBusy}
                        className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                          user.blocked
                            ? "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            : "border border-red-200 text-red-600 hover:bg-red-50"
                        }`}
                      >
                        {user.blocked
                          ? "Unblock"
                          : "Block"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
