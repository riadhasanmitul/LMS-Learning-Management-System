"use client";

import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getToken } from "@/lib/auth";
import {
  getQuiz,
  submitQuiz,
  type Quiz,
} from "@/services/student";

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();

  const quizDocumentId = String(params.quizDocumentId);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    async function loadQuiz() {
      try {
        const result = await getQuiz(
          token,
          quizDocumentId,
        );

        setQuiz(result);
      } catch (err) {
        if (
          axios.isAxiosError(err) &&
          err.response?.status === 404
        ) {
          setError("This quiz is no longer available.");
          return;
        }

        console.error(err);
        setError("Unable to load this quiz.");
      } finally {
        setLoading(false);
      }
    }

    void loadQuiz();
  }, [quizDocumentId, router]);

  function selectAnswer(
    questionDocumentId: string,
    answer: string,
  ) {
    setAnswers((current) => ({
      ...current,
      [questionDocumentId]: answer,
    }));
  }

  async function handleSubmit() {
    if (!quiz) {
      return;
    }

    const unanswered = quiz.questions.filter(
      (question) =>
        answers[question.documentId] === undefined,
    );

    if (unanswered.length > 0) {
      setError(
        `Please answer all questions. ${unanswered.length} question${
          unanswered.length === 1 ? "" : "s"
        } remaining.`,
      );

      return;
    }

    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    setSubmitting(true);
    setError("");

    try {
      const result = await submitQuiz(
        token,
        quizDocumentId,
        answers,
      );

      sessionStorage.setItem(
        "quizResult",
        JSON.stringify(result),
      );

      router.push(
        `/student/quizzes/${quizDocumentId}/result`,
      );
    } catch (err) {
      console.error(err);
      setError("Unable to submit the quiz.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 rounded bg-slate-200" />
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="h-64 rounded-2xl bg-slate-200" />
            <div className="h-64 rounded-2xl bg-slate-200" />
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

          <p className="mt-2 text-sm text-slate-500">
            {error || "This quiz could not be loaded."}
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

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link
            href="/student"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              C
            </div>

            <span className="text-base font-bold text-slate-900">
              CPS LMS
            </span>
          </Link>

          {quiz.course && (
            <Link
              href={`/student/courses/${quiz.course.documentId}`}
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              ← Back to Course
            </Link>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Quiz heading */}
        <section className="rounded-3xl bg-slate-950 p-8 md:p-10">
          {quiz.course && (
            <p className="text-sm font-medium text-blue-400">
              {quiz.course.title}
            </p>
          )}

          <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">
            {quiz.title}
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            {quiz.questions.length}{" "}
            {quiz.questions.length === 1
              ? "question"
              : "questions"}
          </p>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Questions */}
        <section className="mt-6 space-y-5">
          {quiz.questions.map((question, index) => {
            const selectedAnswer =
              answers[question.documentId];

            return (
              <article
                key={question.documentId}
                className="rounded-2xl border border-slate-200 bg-white p-6 md:p-7"
              >
                <div className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg font-semibold leading-7 text-slate-900">
                      {question.question}
                    </h2>

                    <div className="mt-5 space-y-3">
                      {question.options.map((option, optionIndex) => {
                        const letter = String.fromCharCode(
                          65 + optionIndex,
                        );

                        const selected =
                          selectedAnswer === letter;

                        return (
                          <button
                            key={`${question.documentId}-${letter}`}
                            type="button"
                            onClick={() =>
                              selectAnswer(
                                question.documentId,
                                letter,
                              )
                            }
                            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                              selected
                                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10"
                                : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                            }`}
                          >
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                                selected
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {letter}
                            </span>

                            <span
                              className={`text-sm ${
                                selected
                                  ? "font-semibold text-blue-900"
                                  : "text-slate-700"
                              }`}
                            >
                              {option}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* Submit */}
        <section className="mt-6 pb-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-slate-900">
                  Ready to submit?
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Make sure you&apos;ve answered every question.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Quiz"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}