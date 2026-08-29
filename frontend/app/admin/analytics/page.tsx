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

export default function AdminAnalyticsPage() {
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

        setError("Unable to load statistics.");
      } finally {
        setLoading(false);
      }
    }

    void loadStats();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-36 rounded-3xl bg-slate-200 dark:bg-slate-800" />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800" />
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

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/admin"
              className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              ← Dashboard
            </Link>

            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
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
            System Statistics & Analytics
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
            Detailed breakdown of users, roles, courses, lessons, and quiz attempts across the platform.
          </p>
        </section>

        {/* Users by Role Analytics */}
        {stats.usersByRole && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Users Breakdown by Role
            </h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <RoleCard
                role="Students"
                count={stats.usersByRole.Student || 0}
                icon="🎓"
                color="blue"
              />
              <RoleCard
                role="Instructors"
                count={stats.usersByRole.Instructor || 0}
                icon="👨‍🏫"
                color="purple"
              />
              <RoleCard
                role="Content Managers"
                count={stats.usersByRole["Content Manager"] || 0}
                icon="📚"
                color="emerald"
              />
              <RoleCard
                role="Admins"
                count={stats.usersByRole.Admin || 0}
                icon="🛡️"
                color="amber"
              />
            </div>
          </section>
        )}

        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnalyticsCard
            icon="👥"
            label="Total Users"
            value={stats.users}
            description="Registered users on the platform"
          />

          <AnalyticsCard
            icon="📚"
            label="Total Courses"
            value={stats.courses}
            description="Courses currently stored in the LMS"
          />

          <AnalyticsCard
            icon="📖"
            label="Total Lessons"
            value={stats.lessons}
            description="Lessons available across all courses"
          />

          <AnalyticsCard
            icon="🎓"
            label="Total Enrollments"
            value={stats.enrollments}
            description="Student course enrollments"
          />

          <AnalyticsCard
            icon="✓"
            label="Total Quizzes"
            value={stats.quizzes}
            description="Assessments created in the LMS"
          />

          <AnalyticsCard
            icon="📝"
            label="Quiz Attempts"
            value={stats.quizAttempts}
            description="Recorded student quiz attempts"
          />
        </section>
      </div>
    </main>
  );
}

function AnalyticsCard({
  icon,
  label,
  value,
  description,
}: {
  icon: string;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-2xl">{icon}</div>

      <p className="mt-5 text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>

      <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function RoleCard({
  role,
  count,
  icon,
  color,
}: {
  role: string;
  count: number;
  icon: string;
  color: "blue" | "purple" | "emerald" | "amber";
}) {
  const colorMap = {
    blue: "bg-blue-50/80 border-blue-100 text-blue-900 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-200",
    purple: "bg-purple-50/80 border-purple-100 text-purple-900 dark:bg-purple-950/30 dark:border-purple-900/40 dark:text-purple-200",
    emerald: "bg-emerald-50/80 border-emerald-100 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-200",
    amber: "bg-amber-50/80 border-amber-100 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-200",
  };

  return (
    <div className={`rounded-2xl border p-6 ${colorMap[color]}`}>
      <div className="text-3xl">{icon}</div>
      <p className="mt-4 text-sm font-semibold uppercase tracking-wider">{role}</p>
      <p className="mt-1 text-3xl font-extrabold">{count}</p>
    </div>
  );
}
