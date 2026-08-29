"use client";

import axios from "axios";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getToken, logout } from "@/lib/auth";
import { createContentManagerQuestion } from "@/services/content-manager";

export default function CreateContentManagerQuestionPage() {
  const router = useRouter();
  const params = useParams();

  const courseDocumentId = String(params.courseDocumentId);
  const quizDocumentId = String(params.quizDocumentId);

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([
    "",
    "",
    "",
    "",
  ]);
  const [correctAnswer, setCorrectAnswer] = useState("A");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

    try {
      await createContentManagerQuestion(
        token,
        quizDocumentId,
        question.trim(),
        options.map((option) => option.trim()),
        correctAnswer,
      );

      router.push(
        `/content-manager/courses/${courseDocumentId}/quizzes/${quizDocumentId}/questions`,
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
        error.response?.status === 403
      ) {
        setError(
          "You do not have permission to create questions.",
        );
        return;
      }

      if (
        axios.isAxiosError(error) &&
        error.response?.data?.error?.message
      ) {
        setError(error.response.data.error.message);
      } else {
        setError("Unable to create the question.");
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
            href="/content-manager"
            className="font-bold text-slate-900"
          >
            LMS
          </Link>

          <Link
            href={`/content-manager/courses/${courseDocumentId}/quizzes/${quizDocumentId}/questions`}
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to Questions
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <section className="rounded-3xl bg-slate-950 p-8 md:p-10">
          <p className="text-sm font-medium text-blue-400">
            Content Management
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white">
            Add Question
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Add a multiple-choice question.
          </p>
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
            placeholder="Enter your question..."
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
                      placeholder={`Option ${letter}`}
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

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href={`/content-manager/courses/${courseDocumentId}/quizzes/${quizDocumentId}/questions`}
              className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create Question"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
