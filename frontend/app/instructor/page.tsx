"use client";
import axios from "axios";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getToken, logout } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  getInstructorCourses,
  type InstructorCourse,
} from "@/services/instructor";

export default function InstructorDashboard() {
  const router = useRouter();

  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    async function loadCourses() {
      try {
        const result = await getInstructorCourses(token);
        setCourses(result);
      } catch (error: unknown) {
        console.error(error);

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          logout();
          router.push("/login");
          return;
        }

        setError("Unable to load your courses.");
      } finally {
        setLoading(false);
      }
    }

    void loadCourses();
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
            <div className="h-10 w-64 rounded bg-slate-200" />
            <div className="h-32 rounded-3xl bg-slate-200" />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div className="h-72 rounded-2xl bg-slate-200" />
              <div className="h-72 rounded-2xl bg-slate-200" />
              <div className="h-72 rounded-2xl bg-slate-200" />
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
            Instructor Dashboard
          </h1>

          <p className="mt-2 text-sm text-red-600">{error}</p>

          <button
            onClick={() => router.refresh()}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/instructor" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              C
            </div>

            <div>
              <div className="font-bold text-slate-900">LMS</div>

              <div className="text-[11px] text-slate-400">
                Instructor Portal
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/blog"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Blog
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="rounded-3xl bg-slate-950 p-8 md:p-10">
          <p className="text-sm font-medium text-blue-400">Instructor Portal</p>

          <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">
            Manage your courses
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
            Create courses, manage lessons, and build quizzes for your students.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/instructor/courses/new"
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Create Course
            </Link>

            <Link
              href="/blog"
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5"
            >
              Blog
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard label="My Courses" value={courses.length} />

          <StatCard
            label="Published"
            value={courses.filter((course) => course.publishedAt).length}
          />

          <StatCard
            label="Drafts"
            value={courses.filter((course) => !course.publishedAt).length}
          />
        </section>

        <section className="mt-10 pb-10">
          <div className="mb-5">
            <p className="text-sm font-medium text-blue-600">Your content</p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              My Courses
            </h2>
          </div>

          {courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="text-3xl">📚</div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No courses yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create your first course to get started.
              </p>

              <Link
                href="/instructor/courses/new"
                className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Create Course
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div
                  key={course.documentId}
                  className="flex flex-col h-full overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex h-40 shrink-0 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <span className="text-2xl">📚</span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
                          {course.title}
                        </h3>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            course.publishedAt
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {course.publishedAt ? "Published" : "Draft"}
                        </span>
                      </div>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {course.description || "No description provided."}
                      </p>
                    </div>

                    <div className="mt-5 pt-2">
                      <Link
                        href={`/instructor/courses/${course.documentId}`}
                        className="block w-full rounded-xl bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Manage Course
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
