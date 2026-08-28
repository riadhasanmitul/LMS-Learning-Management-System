"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getToken, logout } from "@/lib/auth";
import {
  deleteContentManagerQuiz,
  getContentManagerQuizzes,
  publishContentManagerQuiz,
  unpublishContentManagerQuiz,
  type ContentManagerQuiz,
} from "@/services/content-manager";

export default function ContentManagerQuizzesPage() {
  const router = useRouter();
  const params = useParams();

  const courseDocumentId = String(params.courseDocumentId);

  const [quizzes, setQuizzes] = useState<ContentManagerQuiz[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    async function loadQuizzes() {
      try {
        const result = await getContentManagerQuizzes(
          token,
          courseDocumentId,
        );

        setQuizzes(result);
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

        setError("Unable to load quizzes.");
      } finally {
        setLoading(false);
      }
    }

    void loadQuizzes();
  }, [courseDocumentId, router]);

  async function handleDelete(quizDocumentId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quiz?",
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
      await deleteContentManagerQuiz(
        token,
        quizDocumentId,
      );

      setQuizzes((current) =>
        current.filter(
          (quiz) => quiz.documentId !== quizDocumentId,
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

      setError("Unable to delete the quiz.");
    }
  }

  async function handleTogglePublish(quiz: ContentManagerQuiz) {
    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    try {
      if (quiz.publishedAt) {
        await unpublishContentManagerQuiz(storedToken, quiz.documentId);
      } else {
        await publishContentManagerQuiz(storedToken, quiz.documentId);
      }

      setQuizzes((current) =>
        current.map((item) =>
          item.documentId === quiz.documentId
            ? {
                ...item,
                publishedAt: item.publishedAt
                  ? null
                  : new Date().toISOString(),
              }
            : item,
        ),
      );
    } catch (err: unknown) {
      console.error(err);
      setError("Unable to change quiz publish status.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-32 rounded-3xl bg-slate-200" />
            <div className="h-24 rounded-2xl bg-slate-200" />
            <div className="h-24 rounded-2xl bg-slate-200" />
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
            CPS LMS
          </Link>

          <Link
            href={`/content-manager/courses/${courseDocumentId}`}
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to Course
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
              Quizzes
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Manage quizzes for this course.
            </p>
          </div>

          <Link
            href={`/content-manager/courses/${courseDocumentId}/quizzes/new`}
            className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Create Quiz
          </Link>
        </section>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="mt-6 pb-10">
          {quizzes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="text-3xl">✓</div>

              <h2 className="mt-4 font-semibold text-slate-900">
                No quizzes yet
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Create an assessment for this course.
              </p>

              <Link
                href={`/content-manager/courses/${courseDocumentId}/quizzes/new`}
                className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Create Quiz
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {quizzes.map((quiz, index) => (
                <article
                  key={quiz.documentId}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-sm font-bold text-violet-600">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-slate-900">
                          {quiz.title}
                        </h2>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            quiz.publishedAt
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {quiz.publishedAt ? "Published" : "Draft"}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        Course assessment
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => void handleTogglePublish(quiz)}
                        className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                          quiz.publishedAt
                            ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {quiz.publishedAt ? "Unpublish" : "Publish"}
                      </button>

                      <Link
                        href={`/content-manager/courses/${courseDocumentId}/quizzes/${quiz.documentId}`}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Edit
                      </Link>

                      <Link
                        href={`/content-manager/courses/${courseDocumentId}/quizzes/${quiz.documentId}/questions`}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Questions
                      </Link>

                      <button
                        onClick={() =>
                          void handleDelete(
                            quiz.documentId,
                          )
                        }
                        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
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
