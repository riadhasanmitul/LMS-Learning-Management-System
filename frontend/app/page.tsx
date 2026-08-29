import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {/* Nav */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              C
            </div>
            <span className="font-bold text-slate-900 dark:text-white">LMS</span>
          </div>

          <nav className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/blog"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Blog
            </Link>

            <Link
              href="/login"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Learning Management System
        </p>

        <h1 className="mt-5 text-5xl font-bold leading-tight text-slate-900 md:text-6xl">
          Learn at Your <br />
          <span className="text-blue-600">Own Pace</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-500">
          Enroll in courses, track your progress, take quizzes, and grow your
          skills — all in one place.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/student/courses"
            className="rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Browse Courses
          </Link>

          <Link
            href="/blog"
            className="rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Read the Blog
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Everything you need to learn and teach
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: "📚",
                title: "Rich Course Library",
                desc: "Browse published courses with lessons, videos, and assessments.",
              },
              {
                icon: "📊",
                title: "Progress Tracking",
                desc: "Mark lessons complete and see your percentage progress per course.",
              },
              {
                icon: "✅",
                title: "Auto-Graded Quizzes",
                desc: "Take MCQ quizzes and get your score instantly on submit.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-7"
              >
                <div className="text-3xl">{f.icon}</div>
                <h3 className="mt-4 font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <span className="text-sm text-slate-400">
            © 2026 LMS. All rights reserved.
          </span>

          <div className="flex gap-5">
            <Link
              href="/blog"
              className="text-sm text-slate-400 hover:text-slate-700"
            >
              Blog
            </Link>

            <Link
              href="/login"
              className="text-sm text-slate-400 hover:text-slate-700"
            >
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
