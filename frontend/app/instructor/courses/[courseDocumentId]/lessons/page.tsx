"use client";

import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getToken, logout } from "@/lib/auth";
import {
  getInstructorLessons,
  deleteLesson,
  publishLesson,
  unpublishLesson,
  type InstructorLesson,
} from "@/services/instructor";

export default function InstructorLessonsPage() {
  const router = useRouter();
  const params = useParams();

  const courseDocumentId = String(params.courseDocumentId);

  const [lessons, setLessons] = useState<InstructorLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    async function loadLessons() {
      try {
        const result = await getInstructorLessons(
          token,
          courseDocumentId,
        );

        setLessons(result);
      } catch (error: unknown) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 404
        ) {
          setError("Course or lessons not found.");
          return;
        }

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
            "You do not have permission to manage these lessons.",
          );
          return;
        }

        console.error(error);
        setError("Unable to load lessons.");
      } finally {
        setLoading(false);
      }
    }

    void loadLessons();
  }, [courseDocumentId, router]);

  async function handleTogglePublish(lesson: InstructorLesson) {
    const storedToken = getToken();
    if (storedToken === null) {
      router.push("/login");
      return;
    }

    try {
      if (lesson.publishedAt) {
        await unpublishLesson(storedToken, lesson.documentId);
      } else {
        await publishLesson(storedToken, lesson.documentId);
      }

      setLessons((current) =>
        current.map((item) =>
          item.documentId === lesson.documentId
            ? {
                ...item,
                publishedAt: item.publishedAt ? null : new Date().toISOString(),
              }
            : item,
        ),
      );
    } catch (err: unknown) {
      console.error(err);
      setError("Unable to change lesson publish status.");
    }
  }

  async function handleDelete(
    lessonDocumentId: string,
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lesson?",
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
      await deleteLesson(
        token,
        lessonDocumentId,
      );

      setLessons((current) =>
        current.filter(
          (lesson) =>
            lesson.documentId !== lessonDocumentId,
        ),
      );
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 404
      ) {
        // Already deleted or not found
        setLessons((current) =>
          current.filter(
            (lesson) =>
              lesson.documentId !== lessonDocumentId,
          ),
        );
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

      setError("Unable to delete the lesson.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="animate-pulse space-y-5">
            <div className="h-10 w-64 rounded bg-slate-200" />
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
            href="/instructor"
            className="font-bold text-slate-900"
          >
            CPS LMS
          </Link>

          <Link
            href={`/instructor/courses/${courseDocumentId}`}
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
              Course Content
            </p>

            <h1 className="mt-2 text-3xl font-bold text-white">
              Lessons
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Create and manage lessons for this course.
            </p>
          </div>

          <Link
            href={`/instructor/courses/${courseDocumentId}/lessons/new`}
            className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Add Lesson
          </Link>
        </section>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="mt-6">
          {lessons.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="text-3xl">📖</div>

              <h2 className="mt-4 font-semibold text-slate-900">
                No lessons yet
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Add your first lesson to this course.
              </p>

              <Link
                href={`/instructor/courses/${courseDocumentId}/lessons/new`}
                className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Add Lesson
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <article
                  key={lesson.documentId}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-slate-900">
                          {lesson.title}
                        </h2>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            lesson.publishedAt
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {lesson.publishedAt ? "Published" : "Draft"}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        Order: {lesson.order}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => void handleTogglePublish(lesson)}
                        className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                          lesson.publishedAt
                            ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {lesson.publishedAt ? "Unpublish" : "Publish"}
                      </button>

                      <Link
                        href={`/instructor/courses/${courseDocumentId}/lessons/${lesson.documentId}`}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() =>
                          handleDelete(
                            lesson.documentId,
                          )
                        }
                        className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
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
