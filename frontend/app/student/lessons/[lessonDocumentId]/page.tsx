"use client";

import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import {
  getLesson,
  markLessonComplete,
  type Lesson,
} from "@/services/student";


export default function LessonViewerPage() {
  const router = useRouter();
  const params = useParams();

  const lessonDocumentId = String(params.lessonDocumentId);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    async function loadLesson() {
      try {
        const result = await getLesson(
          token,
          lessonDocumentId,
        );

        setLesson(result);
      } catch (err) {
        if (
          axios.isAxiosError(err) &&
          err.response?.status === 404
        ) {
          setError("This lesson is no longer available.");
          return;
        }

        console.error(err);
        setError("Unable to load this lesson.");
      } finally {
        setLoading(false);
      }
    }

    void loadLesson();
  }, [lessonDocumentId, router]);

  async function handleComplete() {
    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    setSaving(true);
    setError("");

    try {
      await markLessonComplete(
        token,
        lessonDocumentId,
      );

      setCompleted(true);
    } catch (err) {
      console.error(err);
      setError("Unable to save your progress.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-slate-200" />
            <div className="h-12 w-3/4 rounded bg-slate-200" />
            <div className="h-64 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Lesson unavailable
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error || "This lesson could not be loaded."}
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
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link
            href={
              lesson.course
                ? `/student/courses/${lesson.course.documentId}`
                : "/student"
            }
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              C
            </div>

            <span className="text-base font-bold text-slate-900">
              LMS
            </span>
          </Link>

          {lesson.course && (
            <Link
              href={`/student/courses/${lesson.course.documentId}`}
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              ← Back to Course
            </Link>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <section className="rounded-3xl bg-slate-950 p-8 md:p-10">
          {lesson.course && (
            <p className="text-sm font-medium text-blue-400">
              {lesson.course.title}
            </p>
          )}

          <div className="mt-3 flex items-start justify-between gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Lesson {lesson.order}
              </span>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
                {lesson.title}
              </h1>
            </div>

            {completed && (
              <span className="shrink-0 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                Completed
              </span>
            )}
          </div>
        </section>

        {lesson.videoUrl && (
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
            <div className="aspect-video">
              <iframe
                src={lesson.videoUrl}
                title={lesson.title}
                className="h-full w-full"
                allowFullScreen
              />
            </div>
          </section>
        )}

        <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-7 md:p-10">
          <LessonContent content={lesson.content} />
        </article>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Finish this lesson
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Mark the lesson as complete to update your course
                progress.
              </p>
            </div>

            {completed ? (
              <div className="rounded-xl bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">
                ✓ Lesson completed
              </div>
            ) : (
              <button
                onClick={handleComplete}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Mark as complete"}
              </button>
            )}
          </div>
        </section>

        {lesson.course && (
          <div className="mt-6 pb-10">
            <Link
              href={`/student/courses/${lesson.course.documentId}`}
              className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Return to course
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function LessonContent({
  content,
}: {
  content: Lesson["content"];
}) {
  if (!content || content.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No lesson content available.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {content.map((block, index) => {
        const text = (block.children ?? [])
          .map((child) => child.text ?? "")
          .join("");

        if (block.type === "heading") {
          return (
            <h2
              key={index}
              className="text-2xl font-bold text-slate-900"
            >
              {text}
            </h2>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={index}
              className="border-l-4 border-blue-500 bg-blue-50 px-5 py-4 text-slate-700"
            >
              {text}
            </blockquote>
          );
        }

        if (block.type === "list") {
          return (
            <ul
              key={index}
              className="list-disc space-y-2 pl-6 text-slate-700"
            >
              <li>{text}</li>
            </ul>
          );
        }

        return (
          <p
            key={index}
            className="text-base leading-8 text-slate-700"
          >
            {text}
          </p>
        );
      })}
    </div>
  );
}