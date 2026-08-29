"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getToken } from "@/lib/auth";
import {
  getMyCourses,
  type Course,
} from "@/services/student";

export default function MyCoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
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
        const result = await getMyCourses(token);
        setCourses(result);
      } catch (err) {
        console.error(err);
        setError("Unable to load your courses.");
      } finally {
        setLoading(false);
      }
    }

    void loadCourses();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-52 rounded bg-slate-200" />

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div className="h-80 rounded-2xl bg-slate-200" />
              <div className="h-80 rounded-2xl bg-slate-200" />
              <div className="h-80 rounded-2xl bg-slate-200" />
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
            Unable to load courses
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <Link
            href="/student"
            className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/student"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              C
            </div>

            <div>
              <div className="text-base font-bold text-slate-900">
                LMS
              </div>

              <div className="text-[11px] text-slate-400">
                Learning Management System
              </div>
            </div>
          </Link>

          <Link
            href="/student"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Hero */}
        <section className="rounded-3xl bg-slate-950 p-8 md:p-10">
          <p className="text-sm font-medium text-blue-400">
            My Learning
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            My Courses
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
            Continue the courses you are enrolled in and keep
            progressing toward your learning goals.
          </p>
        </section>

        {/* Course count */}
        <div className="mt-6">
          <p className="text-sm text-slate-500">
            {courses.length}{" "}
            {courses.length === 1 ? "course" : "courses"} enrolled
          </p>
        </div>

        {/* Courses */}
        <section className="mt-5 pb-10">
          {courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                📚
              </div>

              <h2 className="mt-4 font-semibold text-slate-900">
                No courses yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                You are not enrolled in any courses yet. Browse the
                course catalog and start learning.
              </p>

              <Link
                href="/student/courses"
                className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Explore courses
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Link
                  key={course.documentId}
                  href={`/student/courses/${course.documentId}`}
                  className="group flex flex-col h-full overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  {/* Course visual */}
                  <div className="relative flex h-44 shrink-0 items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <span className="text-2xl">
                        📚
                      </span>
                    </div>

                    <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-emerald-600 shadow-sm">
                      Enrolled
                    </span>
                  </div>

                  {/* Course info */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <h2 className="line-clamp-2 text-lg font-semibold text-slate-900 transition group-hover:text-blue-600">
                        {course.title}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {course.description || "No description provided."}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-400">
                        LMS
                      </span>

                      <span className="text-sm font-semibold text-blue-600">
                        Continue →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}