"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

interface QuizResult {
  documentId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
}

function getStoredResult(): QuizResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawResult = sessionStorage.getItem("quizResult");

  if (!rawResult) {
    return null;
  }

  try {
    return JSON.parse(rawResult) as QuizResult;
  } catch {
    sessionStorage.removeItem("quizResult");
    return null;
  }
}

export default function QuizResultPage() {
  const params = useParams();
  const quizDocumentId = String(params.quizDocumentId);

  const [result] = useState<QuizResult | null>(
    getStoredResult,
  );

  if (!result) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Result unavailable
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            No recent quiz result was found.
          </p>

          <Link
            href="/student"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  const passed = result.percentage >= 50;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
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
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-12">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-950 px-8 py-10 text-center">
            <div
              className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold ${
                passed
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-red-500/15 text-red-400"
              }`}
            >
              {result.percentage}%
            </div>

            <h1 className="mt-5 text-3xl font-bold text-white">
              Quiz Complete
            </h1>

            <p className="mt-2 text-slate-400">
              {passed
                ? "Great job! Keep learning."
                : "Keep practicing and try again."}
            </p>
          </div>

          <div className="p-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <ResultCard
                label="Score"
                value={`${result.score}/${result.totalQuestions}`}
              />

              <ResultCard
                label="Percentage"
                value={`${result.percentage}%`}
              />

              <ResultCard
                label="Status"
                value={passed ? "Passed" : "Needs Practice"}
              />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/student/quizzes/${quizDocumentId}`}
                className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
              >
                Try Again
              </Link>

              <Link
                href="/student"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ResultCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5 text-center">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}