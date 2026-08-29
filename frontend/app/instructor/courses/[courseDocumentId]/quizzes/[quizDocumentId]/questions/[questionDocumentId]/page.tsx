"use client";

import axios from "axios";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getToken, logout } from "@/lib/auth";
import {
  updateQuestion,
  type InstructorQuestion,
} from "@/services/instructor";
import { api } from "@/lib/api";

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();

  const courseDocumentId = String(params.courseDocumentId);
  const quizDocumentId = String(params.quizDocumentId);
  const questionDocumentId = String(
    params.questionDocumentId,
  );

  const [item, setItem] =
    useState<InstructorQuestion | null>(null);

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([
    "",
    "",
    "",
    "",
  ]);
  const [correctAnswer, setCorrectAnswer] =
    useState("A");

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

    async function loadQuestion() {
      try {
        const response = await api.get<{
          data: InstructorQuestion;
        }>(`/api/questions/${questionDocumentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = response.data.data;

        setItem(result);
        setQuestion(result.question);
        setOptions([
          result.options[0] ?? "",
          result.options[1] ?? "",
          result.options[2] ?? "",
          result.options[3] ?? "",
        ]);
        setCorrectAnswer(result.correctAnswer);
      } catch (error: unknown) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 404
        ) {
          setError("This question is no longer available.");
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
            "You do not have permission to edit this question.",
          );
          return;
        }

        setError("Unable to load the question.");
      } finally {
        setLoading(false);
      }
    }

    void loadQuestion();
  }, [questionDocumentId, router]);

  function updateOption(
    index: number,
    value: string,
  ) {
    setOptions((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    if (!question.trim()) {
      setError("Question is required.");
      return;
    }

    if (options.some((option) => !option.trim())) {
      setError("All four options are required.");
      return;
    }

    const token: string = storedToken;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateQuestion(
        token,
        questionDocumentId,
        question.trim(),
        options.map((option) => option.trim()),
        correctAnswer,
      );

      setItem((current) =>
        current
          ? {
              ...current,
              question: question.trim(),
              options: options.map((option) =>
                option.trim(),
              ),
              correctAnswer,
            }
          : current,
      );

      setSuccess("Question updated successfully.");
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
        setError("Unable to update the question.");
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
            <div className="h-64 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Question unavailable
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error || "Question not found."}
          </p>

          <Link
            href={`/instructor/courses/${courseDocumentId}/quizzes/${quizDocumentId}/questions`}
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Questions
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
            href={`/instructor/courses/${courseDocumentId}/quizzes/${quizDocumentId}/questions`}
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to Questions
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <section className="rounded-3xl bg-slate-950 p-8">
          <p className="text-sm font-medium text-blue-400">
            Quiz Management
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white">
            Edit Question
          </h1>
        </section>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 md:p-8"
        >
          <label
            htmlFor="question"
            className="block text-sm font-semibold text-slate-900"
          >
            Question
          </label>

          <textarea
            id="question"
            rows={4}
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            disabled={saving}
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-900">
              Options
            </p>

            <div className="mt-3 space-y-3">
              {options.map((option, index) => {
                const letter = String.fromCharCode(
                  65 + index,
                );

                return (
                  <div
                    key={letter}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-500">
                      {letter}
                    </span>

                    <input
                      value={option}
                      onChange={(event) =>
                        updateOption(
                          index,
                          event.target.value,
                        )
                      }
                      disabled={saving}
                      className="h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="correctAnswer"
              className="block text-sm font-semibold text-slate-900"
            >
              Correct Answer
            </label>

            <select
              id="correctAnswer"
              value={correctAnswer}
              onChange={(event) =>
                setCorrectAnswer(event.target.value)
              }
              disabled={saving}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

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

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href={`/instructor/courses/${courseDocumentId}/quizzes/${quizDocumentId}/questions`}
              className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
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
