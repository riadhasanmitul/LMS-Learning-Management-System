"use client";

import axios from "axios";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getToken, logout } from "@/lib/auth";
import { createQuiz } from "@/services/instructor";

export default function CreateQuizPage() {
  const router = useRouter();
  const params = useParams();

  const courseDocumentId = String(params.courseDocumentId);

  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    if (!title.trim()) {
      setError("Quiz title is required.");
      return;
    }

    const token: string = storedToken;

    setSaving(true);
    setError("");

    try {
      const response = await createQuiz(
        token,
        courseDocumentId,
        title.trim(),
      );

      const quizDocumentId =
        response?.data?.documentId;

      if (!quizDocumentId) {
        throw new Error(
          "Quiz was created but no document ID was returned.",
        );
      }

      router.push(
        `/instructor/courses/${courseDocumentId}/quizzes/${quizDocumentId}/questions`,
      );
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
        error.response?.data?.error?.message
      ) {
        setError(error.response.data.error.message);
      } else {
        setError("Unable to create the quiz.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link
            href="/instructor"
            className="font-bold text-slate-900"
          >
            CPS LMS
          </Link>

          <Link
            href={`/instructor/courses/${courseDocumentId}/quizzes`}
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to Quizzes
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <section className="rounded-3xl bg-slate-950 p-8 md:p-10">
          <p className="text-sm font-medium text-blue-400">
            Quiz Management
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white">
            Create Quiz
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            Create an assessment for this course.
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 md:p-8"
        >
          <label
            htmlFor="title"
            className="block text-sm font-semibold text-slate-900"
          >
            Quiz Title
          </label>

          <input
            id="title"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="e.g. ASP.NET Core Fundamentals Quiz"
            disabled={saving}
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href={`/instructor/courses/${courseDocumentId}/quizzes`}
              className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create Quiz"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
