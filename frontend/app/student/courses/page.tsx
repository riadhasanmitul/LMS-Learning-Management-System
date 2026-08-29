"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getToken } from "@/lib/auth";
import {
  getCourses,
  getMyCourses,
  type Course,
} from "@/services/student";

export default function CoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourseIds, setMyCourseIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

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
        const [allCourses, enrolledCourses] = await Promise.all([
          getCourses(token),
          getMyCourses(token),
        ]);

        setCourses(allCourses);

        setMyCourseIds(
          enrolledCourses.map((course) => course.documentId),
        );
      } catch (err) {
        console.error(err);
        setError("Unable to load courses.");
      } finally {
        setLoading(false);
      }
    }

    void loadCourses();
  }, [router]);

  const filteredCourses = courses.filter((course) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-56 rounded bg-slate-200" />
            <div className="h-12 w-full max-w-xl rounded-xl bg-slate-200" />

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

          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try again
          </button>
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
            Course Catalog
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Explore Courses
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
            Discover courses, build new skills, and continue your
            learning journey with LMS.
          </p>
        </section>

        {/* Search */}
        <section className="mt-6">
          <div className="relative max-w-2xl">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search courses..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="mt-3 text-sm text-slate-500">
            {filteredCourses.length}{" "}
            {filteredCourses.length === 1 ? "course" : "courses"} found
          </div>
        </section>

        {/* Courses */}
        <section className="mt-6 pb-10">
          {filteredCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                🔍
              </div>

              <h2 className="mt-4 font-semibold text-slate-900">
                No courses found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Try a different search term.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => {
                const enrolled = myCourseIds.includes(
                  course.documentId,
                );

                return (
                  <Link
                    key={course.documentId}
                    href={`/student/courses/${course.documentId}`}
                    className="group flex flex-col h-full overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                  >
                    {/* Course visual */}
                    <div className="relative flex h-44 shrink-0 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                        <span className="text-2xl">
                          📚
                        </span>
                      </div>

                      {enrolled && (
                        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-emerald-600 shadow-sm">
                          Enrolled
                        </span>
                      )}
                    </div>

                    {/* Course information */}
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
                          {enrolled
                            ? "Continue →"
                            : "View course →"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}