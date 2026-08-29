"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { getToken, logout } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getCourses, getMyCourses, type Course } from "@/services/student";

function getUsername(): string {
  if (typeof window === "undefined") {
    return "Student";
  }

  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.username || "Student";
  } catch {
    return "Student";
  }
}

export default function StudentDashboard() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const username = getUsername();

  useEffect(() => {
    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    async function loadDashboard() {
      try {
        const [allCoursesResult, enrolledCoursesResult] =
          await Promise.allSettled([
            getCourses(token),
            getMyCourses(token),
          ]);

        if (
          allCoursesResult.status === "rejected" &&
          axios.isAxiosError(allCoursesResult.reason) &&
          allCoursesResult.reason.response?.status === 401
        ) {
          logout();
          router.push("/login");
          return;
        }

        const allCourses =
          allCoursesResult.status === "fulfilled"
            ? allCoursesResult.value
            : [];
        const enrolledCourses =
          enrolledCoursesResult.status === "fulfilled"
            ? enrolledCoursesResult.value
            : [];

        setCourses(allCourses);
        setMyCourses(enrolledCourses);
      } catch (err: unknown) {
        console.error(err);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          logout();
          router.push("/login");
          return;
        }
        setError("Unable to load your dashboard.");
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
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
            <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-40 rounded-3xl bg-slate-200 dark:bg-slate-800" />
            <div className="grid gap-4 md:grid-cols-3">
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
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/student" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              C
            </div>

            <div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                CPS LMS
              </div>

              <div className="text-[11px] text-slate-400">
                Learning Management System
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/student"
              className="text-sm font-medium text-blue-600 dark:text-blue-400"
            >
              Dashboard
            </Link>

            <Link
              href="/student/courses"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Courses
            </Link>

            <Link
              href="/student/my-courses"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              My Learning
            </Link>

            <Link
              href="/student/quiz-results"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Results
            </Link>

            <Link
              href="/blog"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Blog
            </Link>
          </nav>

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
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 md:p-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative max-w-2xl">
            <p className="text-sm font-medium text-blue-400">
              Student Dashboard
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Welcome back, {username}
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 md:text-base">
              Continue your learning journey, explore new courses, and keep
              improving your skills.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/student/courses"
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Explore courses
              </Link>

              <Link
                href="/student/my-courses"
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                My learning
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard
            label="Available Courses"
            value={courses.length}
            icon="📚"
          />

          <StatCard label="My Courses" value={myCourses.length} icon="🎓" />

          <Link
            href="/student/quiz-results"
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-lg dark:bg-violet-950/40">
                ✓
              </div>

              <span className="text-xs font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100 dark:text-blue-400">
                View →
              </span>
            </div>

            <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
              Quiz Results
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              View your attempts
            </p>
          </Link>
        </section>

        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Keep going
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                Continue Learning
              </h2>
            </div>

            {myCourses.length > 0 && (
              <Link
                href="/student/my-courses"
                className="hidden text-sm font-semibold text-blue-600 sm:block dark:text-blue-400"
              >
                View all →
              </Link>
            )}
          </div>

          {myCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl dark:bg-slate-800">
                📖
              </div>

              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                Start your learning journey
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                You haven&apos;t enrolled in a course yet. Explore available
                courses and choose your next learning path.
              </p>

              <Link
                href="/student/courses"
                className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Browse courses
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {myCourses.map((course) => (
                <CourseCard key={course.documentId} course={course} enrolled />
              ))}
            </div>
          )}
        </section>

        <section className="mt-12 pb-10">
          <div className="mb-5">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Discover
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              Explore Courses
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Find something new to learn.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {courses
              .filter(
                (course) =>
                  !myCourses.some(
                    (item) => item.documentId === course.documentId,
                  ),
              )
              .map((course) => (
                <CourseCard key={course.documentId} course={course} />
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-lg dark:bg-blue-950/40">
        {icon}
      </div>

      <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">{label}</p>

      <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function CourseCard({
  course,
  enrolled = false,
}: {
  course: Course;
  enrolled?: boolean;
}) {
  return (
    <Link
      href={`/student/courses/${course.documentId}`}
      className="group flex flex-col h-full overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900"
    >
      <div className="relative h-40 shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        <div className="flex h-full items-center justify-center">
          <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
            CPS LMS
          </span>
        </div>

        {enrolled && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400">
            Enrolled
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {course.title}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {course.description || "No description provided."}
          </p>
        </div>

        {enrolled ? (
          <div className="mt-5 pt-2">
            <div className="mb-2 flex justify-between text-xs">
              <span className="text-slate-400 dark:text-slate-500">
                Your progress
              </span>

              <span className="font-semibold text-slate-600 dark:text-slate-300">
                Continue →
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full w-1/3 rounded-full bg-blue-600" />
            </div>
          </div>
        ) : (
          <div className="mt-5 pt-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
            View course →
          </div>
        )}
      </div>
    </Link>
  );
}
