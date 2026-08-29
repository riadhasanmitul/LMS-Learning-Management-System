"use client";

import axios from "axios";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getToken, logout } from "@/lib/auth";
import {
  updateQuiz,
  type InstructorQuiz,
} from "@/services/instructor";
import { api } from "@/lib/api";

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();

  const courseDocumentId = String(params.courseDocumentId);
  const quizDocumentId = String(params.quizDocumentId);

  const [quiz, setQuiz] = useState<InstructorQuiz | null>(
    null,
  );

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    async function loadQuiz() {
      try {
        const response = await api.get<{
          data: InstructorQuiz;
        }>(`/api/quizzes/${quizDocumentId}?status=draft`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = response.data.data;

        setQuiz(result);
        setTitle(result.title);
      } catch (error: unknown) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 404
        ) {
          setError("This quiz is no longer available.");
          return;
        }

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
          setError(
            "You do not have permission to edit this quiz.",
          );
          return;
        }

        setError("Unable to load the quiz.");
      } finally {
        setLoading(false);
      }
    }

    void loadQuiz();
  }, [quizDocumentId, router]);

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
    setSuccess("");

    try {
      await updateQuiz(
        token,
        quizDocumentId,
        title.trim(),
      );

      setQuiz((current) =>
        current
          ? {
              ...current,
              title: title.trim(),
            }
          : current,
      );

      setSuccess("Quiz updated successfully.");
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
        setError("Unable to update the quiz.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="animate-pulse space-y-5">
            <div className="h-32 rounded-3xl bg-slate-200" />
            <div className="h-48 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (!quiz) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Quiz unavailable
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error || "Quiz not found."}
          </p>

          <Link
            href={`/instructor/courses/${courseDocumentId}/quizzes`}
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Quizzes
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link
            href="/instructor"
            className="font-bold text-slate-900"
          >
            LMS
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
        <section className="rounded-3xl bg-slate-950 p-8">
          <p className="text-sm font-medium text-blue-400">
            Quiz Management
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white">
            Edit Quiz
          </h1>
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
            disabled={saving}
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          {success && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Link
              href={`/instructor/courses/${courseDocumentId}/quizzes/${quizDocumentId}/questions`}
              className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Manage Questions
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
