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
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-40 rounded-3xl bg-slate-200 dark:bg-slate-800" />

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              <div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Access Denied
          </h1>

          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
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
    <main className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/admin"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              C
            </div>

            <div>
              <div className="font-bold text-slate-900 dark:text-white">
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
            Full platform control — monitor stats, manage users & roles, and oversee all courses, lessons, and blog posts.
          </p>
        </section>

        {/* Platform Stat Cards */}
        <section className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <StatCard
            label="Total Users"
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

        {/* Breakdown of Users per Role */}
        {stats.usersByRole && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              👥 Users Breakdown by Role
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <RoleStatBadge
                role="Students"
                count={stats.usersByRole.Student || 0}
                color="blue"
              />
              <RoleStatBadge
                role="Instructors"
                count={stats.usersByRole.Instructor || 0}
                color="purple"
              />
              <RoleStatBadge
                role="Content Managers"
                count={stats.usersByRole["Content Manager"] || 0}
                color="emerald"
              />
              <RoleStatBadge
                role="Admins"
                count={stats.usersByRole.Admin || 0}
                color="amber"
              />
            </div>
          </section>
        )}

        {/* Management Section Links */}
        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/users"
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900"
          >
            <div className="text-2xl">👥</div>

            <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              User & Role Management
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              View users, promote/assign roles, and manage access.
            </p>

            <span className="mt-4 block text-sm font-semibold text-blue-600 group-hover:text-blue-700 dark:text-blue-400">
              Manage Users →
            </span>
          </Link>

          <Link
            href="/content-manager"
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900"
          >
            <div className="text-2xl">📚</div>

            <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              Courses & Lessons
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Manage all courses, lessons, and quizzes across the LMS.
            </p>

            <span className="mt-4 block text-sm font-semibold text-blue-600 group-hover:text-blue-700 dark:text-blue-400">
              Manage Courses →
            </span>
          </Link>

          <Link
            href="/admin/blog"
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900"
          >
            <div className="text-2xl">📝</div>

            <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              Blog Management
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Create, edit, publish, and delete blog posts.
            </p>

            <span className="mt-4 block text-sm font-semibold text-blue-600 group-hover:text-blue-700 dark:text-blue-400">
              Manage Blog →
            </span>
          </Link>

          <Link
            href="/admin/analytics"
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900"
          >
            <div className="text-2xl">📊</div>

            <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              Platform Analytics
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Detailed system statistics, users per role, and activity.
            </p>

            <span className="mt-4 block text-sm font-semibold text-blue-600 group-hover:text-blue-700 dark:text-blue-400">
              View Analytics →
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>

      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function RoleStatBadge({
  role,
  count,
  color,
}: {
  role: string;
  count: number;
  color: "blue" | "purple" | "emerald" | "amber";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40",
    purple: "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/40",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40",
    amber: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40",
  };

  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <span className="text-xs font-medium uppercase tracking-wider">{role}</span>
      <p className="mt-1 text-2xl font-extrabold">{count}</p>
    </div>
  );
}