"use client";

import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getToken, logout } from "@/lib/auth";
import {
  getContentManagerLesson,
  updateContentManagerLesson,
  deleteContentManagerLesson,
  type ContentManagerLesson,
} from "@/services/content-manager";

export default function ContentManagerEditLessonPage() {
  const router = useRouter();
  const params = useParams();

  const courseDocumentId = String(params.courseDocumentId);
  const lessonDocumentId = String(params.lessonDocumentId);

  const [lesson, setLesson] = useState<ContentManagerLesson | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [order, setOrder] = useState("1");
  const [videoUrl, setVideoUrl] = useState("");

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

    async function loadLesson() {
      try {
        const result = await getContentManagerLesson(token, lessonDocumentId);

        setLesson(result);
        setTitle(result.title);
        setOrder(String(result.order));
        setVideoUrl(result.videoUrl ?? "");

        const firstBlock = Array.isArray(result.content)
          ? result.content[0]
          : null;

        const firstText =
          firstBlock &&
          typeof firstBlock === "object" &&
          "children" in firstBlock &&
          Array.isArray((firstBlock as { children?: unknown }).children)
            ? ((firstBlock as { children: unknown[] }).children)
                .map((child: unknown) =>
                  typeof child === "object" &&
                  child !== null &&
                  "text" in child &&
                  typeof (child as { text?: unknown }).text === "string"
                    ? (child as { text: string }).text
                    : "",
                )
                .join("")
            : typeof result.content === "string"
            ? result.content
            : "";

        setContent(firstText);
      } catch (error: unknown) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 404
        ) {
          setError("This lesson is no longer available.");
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

        setError("Unable to load this lesson.");
      } finally {
        setLoading(false);
      }
    }

    void loadLesson();
  }, [lessonDocumentId, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    if (!title.trim()) {
      setError("Lesson title is required.");
      return;
    }

    const parsedOrder = Number(order);

    if (!Number.isInteger(parsedOrder) || parsedOrder < 1) {
      setError("Order must be a positive integer.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const updatedContent = [
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            text: content,
          },
        ],
      },
    ];

    try {
      await updateContentManagerLesson(token, lessonDocumentId, {
        title: title.trim(),
        content: updatedContent,
        order: parsedOrder,
        videoUrl: videoUrl.trim(),
      });

      setLesson((current) =>
        current
          ? {
              ...current,
              title: title.trim(),
              content: updatedContent,
              order: parsedOrder,
              videoUrl: videoUrl.trim() || null,
            }
          : current,
      );

      setSuccess("Lesson updated successfully.");
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
        setError("Unable to update the lesson.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Are you sure you want to delete this lesson?");
    if (!confirmed) return;

    const storedToken = getToken();
    if (storedToken === null) {
      router.push("/login");
      return;
    }

    try {
      await deleteContentManagerLesson(storedToken, lessonDocumentId);
      router.replace(`/content-manager/courses/${courseDocumentId}/lessons`);
    } catch (error: unknown) {
      console.error(error);
      setError("Unable to delete the lesson.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 rounded bg-slate-200" />
            <div className="h-16 rounded-xl bg-slate-200" />
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

          <p className="mt-2 text-sm text-red-600">
            {error || "Lesson not found."}
          </p>

          <Link
            href={`/content-manager/courses/${courseDocumentId}/lessons`}
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Lessons
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
            href="/content-manager"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              C
            </div>

            <div>
              <div className="font-bold text-slate-900">
                LMS
              </div>

              <div className="text-[11px] text-slate-400">
                Content Manager
              </div>
            </div>
          </Link>

          <Link
            href={`/content-manager/courses/${courseDocumentId}/lessons`}
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to Lessons
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <section className="flex flex-col gap-5 rounded-3xl bg-slate-950 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-400">
              Content Management
            </p>

            <h1 className="mt-2 text-3xl font-bold text-white">
              Edit Lesson
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Update lesson details, content, and video links.
            </p>
          </div>

          <button
            onClick={() => void handleDelete()}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-center text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
          >
            Delete Lesson
          </button>
        </section>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 md:p-8"
        >
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-slate-900"
            >
              Lesson Title
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={saving}
              placeholder="e.g. Introduction to React Components"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="order"
              className="block text-sm font-semibold text-slate-900"
            >
              Lesson Order Number
            </label>

            <input
              id="order"
              type="number"
              min="1"
              value={order}
              onChange={(event) => setOrder(event.target.value)}
              disabled={saving}
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="content"
              className="block text-sm font-semibold text-slate-900"
            >
              Lesson Content
            </label>

            <textarea
              id="content"
              rows={8}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              disabled={saving}
              placeholder="Enter lesson text content..."
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="videoUrl"
              className="block text-sm font-semibold text-slate-900"
            >
              Video URL (Optional)
            </label>

            <input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              disabled={saving}
              placeholder="https://..."
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
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
              href={`/content-manager/courses/${courseDocumentId}/lessons`}
              className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
