"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getToken } from "@/lib/auth";
import {
  getMyQuizAttempts,
  type QuizAttempt,
} from "@/services/student";

export default function QuizResultsPage() {
  const router = useRouter();

  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    async function loadAttempts() {
      try {
        const result = await getMyQuizAttempts(token);
        setAttempts(result);
      } catch (err) {
        console.error(err);
        setError("Unable to load your quiz results.");
      } finally {
        setLoading(false);
      }
    }

    void loadAttempts();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-52 rounded bg-slate-200" />
            <div className="h-28 rounded-2xl bg-slate-200" />
            <div className="h-28 rounded-2xl bg-slate-200" />
            <div className="h-28 rounded-2xl bg-slate-200" />
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
            Unable to load results
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
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link
            href="/student"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              C
            </div>

            <span className="font-bold text-slate-900">
              LMS
            </span>
          </Link>

          <Link
            href="/student"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <section className="rounded-3xl bg-slate-950 p-8 md:p-10">
          <p className="text-sm font-medium text-blue-400">
            Assessment History
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">
            Quiz Results
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
            Review your previous quiz attempts and track your
            performance.
          </p>
        </section>

        <section className="mt-6">
          {attempts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                ✓
              </div>

              <h2 className="mt-4 font-semibold text-slate-900">
                No quiz attempts yet
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Complete a quiz and your result will appear here.
              </p>

              <Link
                href="/student"
                className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Go to dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-4 pb-10">
              {attempts.map((attempt) => {
                const percentage =
                  attempt.totalQuestions === 0
                    ? 0
                    : Math.round(
                        (attempt.score /
                          attempt.totalQuestions) *
                          100,
                      );

                const passed = percentage >= 50;

                return (
                  <article
                    key={attempt.documentId}
                    className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-slate-900">
                          {attempt.quiz?.title ||
                            "Quiz"}
                        </h2>

                        {attempt.quiz?.course && (
                          <p className="mt-1 text-sm text-slate-500">
                            {attempt.quiz.course.title}
                          </p>
                        )}

                        <p className="mt-2 text-xs text-slate-400">
                          {formatDate(attempt.submittedAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-slate-400">
                            Score
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {attempt.score}/
                            {attempt.totalQuestions}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-400">
                            Percentage
                          </p>

                          <p className="mt-1 text-xl font-bold text-slate-900">
                            {percentage}%
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            passed
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {passed
                            ? "Passed"
                            : "Needs Practice"}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString();
}