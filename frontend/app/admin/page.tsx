"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getToken, logout } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  getAdminStats,
  type AdminStats,
} from "@/services/admin";

export default function AdminDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    async function loadStats() {
      try {
        const result = await getAdminStats(token);
        setStats(result);
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

        setError("Unable to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    }

    void loadStats();
  }, [router]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-40 rounded-3xl bg-slate-200" />

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              <div className="h-28 rounded-2xl bg-slate-200" />
              <div className="h-28 rounded-2xl bg-slate-200" />
              <div className="h-28 rounded-2xl bg-slate-200" />
              <div className="h-28 rounded-2xl bg-slate-200" />
              <div className="h-28 rounded-2xl bg-slate-200" />
              <div className="h-28 rounded-2xl bg-slate-200" />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="h-44 rounded-2xl bg-slate-200" />
              <div className="h-44 rounded-2xl bg-slate-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
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
            className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
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

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="rounded-3xl bg-slate-950 p-8 md:p-10">
          <p className="text-sm font-medium text-blue-400">
            Administration
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">
            System Overview
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
            Monitor the LMS and manage users, roles, and platform
            activity.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <StatCard
            label="Users"
            value={stats.users}
          />

          <StatCard
            label="Courses"
            value={stats.courses}
          />

          <StatCard
            label="Lessons"
            value={stats.lessons}
          />

          <StatCard
            label="Enrollments"
            value={stats.enrollments}
          />

          <StatCard
            label="Quizzes"
            value={stats.quizzes}
          />

          <StatCard
            label="Quiz Attempts"
            value={stats.quizAttempts}
          />
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <Link
            href="/admin/analytics"
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:shadow-sm"
          >
            <div className="text-2xl">📊</div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              System Statistics
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              View detailed platform statistics and analytics.
            </p>

            <span className="mt-4 block text-sm font-semibold text-blue-600 group-hover:text-blue-700">
              View Statistics →
            </span>
          </Link>

          <Link
            href="/admin/users"
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:shadow-sm"
          >
            <div className="text-2xl">👥</div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              User Management
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              View users, assign roles, and manage account access.
            </p>

            <span className="mt-4 block text-sm font-semibold text-blue-600 group-hover:text-blue-700">
              Manage Users →
            </span>
          </Link>

          <Link
            href="/admin/blog"
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:shadow-sm"
          >
            <div className="text-2xl">📝</div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Blog Management
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create, edit, publish, and delete blog posts.
            </p>

            <span className="mt-4 block text-sm font-semibold text-blue-600 group-hover:text-blue-700">
              Manage Blog →
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs text-slate-500">{label}</p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}