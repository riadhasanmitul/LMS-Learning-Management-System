"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getToken, logout } from "@/lib/auth";
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
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-36 rounded-3xl bg-slate-200" />

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div className="h-40 rounded-2xl bg-slate-200" />
              <div className="h-40 rounded-2xl bg-slate-200" />
              <div className="h-40 rounded-2xl bg-slate-200" />
              <div className="h-40 rounded-2xl bg-slate-200" />
              <div className="h-40 rounded-2xl bg-slate-200" />
              <div className="h-40 rounded-2xl bg-slate-200" />
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

          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              ← Dashboard
            </Link>

            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
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
            System Statistics
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
            Overview of activity and content across the CPS LMS
            platform.
          </p>
        </section>

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

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Platform Summary
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Current totals retrieved from the LMS backend.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryRow
              label="Users"
              value={stats.users}
            />

            <SummaryRow
              label="Courses"
              value={stats.courses}
            />

            <SummaryRow
              label="Lessons"
              value={stats.lessons}
            />

            <SummaryRow
              label="Enrollments"
              value={stats.enrollments}
            />

            <SummaryRow
              label="Quizzes"
              value={stats.quizzes}
            />

            <SummaryRow
              label="Quiz Attempts"
              value={stats.quizAttempts}
            />
          </div>
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="text-2xl">{icon}</div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-4xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-4">
      <span className="text-sm font-medium text-slate-600">
        {label}
      </span>

      <span className="text-lg font-bold text-slate-900">
        {value}
      </span>
    </div>
  );
}
