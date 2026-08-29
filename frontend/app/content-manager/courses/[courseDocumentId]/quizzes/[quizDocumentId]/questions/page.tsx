"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getToken, logout } from "@/lib/auth";
import {
  deleteContentManagerQuestion,
  getContentManagerQuestions,
  type ContentManagerQuestion,
} from "@/services/content-manager";

export default function ContentManagerQuestionsPage() {
  const router = useRouter();
  const params = useParams();

  const courseDocumentId = String(params.courseDocumentId);
  const quizDocumentId = String(params.quizDocumentId);

  const [questions, setQuestions] = useState<
    ContentManagerQuestion[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    async function loadQuestions() {
      try {
        const result = await getContentManagerQuestions(
          token,
          quizDocumentId,
        );

        setQuestions(result);
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
          setError("Content Manager access required.");
          return;
        }

        setError("Unable to load questions.");
      } finally {
        setLoading(false);
      }
    }

    void loadQuestions();
  }, [quizDocumentId, router]);

  async function handleDelete(
    questionDocumentId: string,
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?",
    );

    if (!confirmed) {
      return;
    }

    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    try {
      await deleteContentManagerQuestion(
        token,
        questionDocumentId,
      );

      setQuestions((current) =>
        current.filter(
          (question) =>
            question.documentId !== questionDocumentId,
        ),
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

      setError("Unable to delete the question.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-32 rounded-3xl bg-slate-200" />
            <div className="h-32 rounded-2xl bg-slate-200" />
            <div className="h-32 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/content-manager"
            className="font-bold text-slate-900"
          >
            LMS
          </Link>

          <Link
            href={`/content-manager/courses/${courseDocumentId}/quizzes`}
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to Quizzes
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <section className="flex flex-col gap-5 rounded-3xl bg-slate-950 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-400">
              Content Management
            </p>

            <h1 className="mt-2 text-3xl font-bold text-white">
              Questions
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Manage questions for this quiz.
            </p>
          </div>

          <Link
            href={`/content-manager/courses/${courseDocumentId}/quizzes/${quizDocumentId}/questions/new`}
            className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Add Question
          </Link>
        </section>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="mt-6 pb-10">
          {questions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="text-3xl">?</div>

              <h2 className="mt-4 font-semibold text-slate-900">
                No questions yet
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Add the first question to this quiz.
              </p>

              <Link
                href={`/content-manager/courses/${courseDocumentId}/quizzes/${quizDocumentId}/questions/new`}
                className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Add Question
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((item, index) => (
                <article
                  key={item.documentId}
                  className="rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-sm font-bold text-violet-600">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold leading-7 text-slate-900">
                        {item.question}
                      </h2>

                      <div className="mt-4 grid gap-2 md:grid-cols-2">
                        {item.options.map(
                          (option, optionIndex) => {
                            const letter =
                              String.fromCharCode(
                                65 + optionIndex,
                              );

                            const isCorrect =
                              item.correctAnswer ===
                              letter;

                            return (
                              <div
                                key={`${item.documentId}-${letter}`}
                                className={`rounded-xl border px-4 py-3 text-sm ${
                                  isCorrect
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                    : "border-slate-200 text-slate-600"
                                }`}
                              >
                                <span className="mr-2 font-semibold">
                                  {letter}.
                                </span>

                                {option}

                                {isCorrect && (
                                  <span className="ml-2 text-xs font-semibold">
                                    Correct
                                  </span>
                                )}
                              </div>
                            );
                          },
                        )}
                      </div>

                      <div className="mt-5 flex justify-end gap-2">
                        <Link
                          href={`/content-manager/courses/${courseDocumentId}/quizzes/${quizDocumentId}/questions/${item.documentId}`}
                          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() =>
                            void handleDelete(
                              item.documentId,
                            )
                          }
                          className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
