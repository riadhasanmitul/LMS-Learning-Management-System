"use client";

import axios from "axios";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getToken, logout } from "@/lib/auth";
import { createLesson } from "@/services/instructor";

export default function CreateLessonPage() {
  const router = useRouter();
  const params = useParams();

  const courseDocumentId = String(params.courseDocumentId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [order, setOrder] = useState("1");
  const [videoUrl, setVideoUrl] = useState("");

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

    const token: string = storedToken;

    if (!title.trim()) {
      setError("Lesson title is required.");
      return;
    }

    const parsedOrder = Number(order);

    if (
      !Number.isInteger(parsedOrder) ||
      parsedOrder < 1
    ) {
      setError("Lesson order must be a positive number.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createLesson(
        token,
        courseDocumentId,
        title.trim(),
        [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: content.trim(),
              },
            ],
          },
        ],
        parsedOrder,
        videoUrl.trim(),
      );

      router.push(
        `/instructor/courses/${courseDocumentId}/lessons`,
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
        setError("Unable to create the lesson.");
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
                Instructor Portal
              </div>
            </div>
          </Link>

          <Link
            href={`/instructor/courses/${courseDocumentId}/lessons`}
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to Lessons
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <section className="rounded-3xl bg-slate-950 p-8 md:p-10">
          <p className="text-sm font-medium text-blue-400">
            Course Content
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white">
            Create Lesson
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            Add a lesson to your course.
          </p>
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
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Introduction to ASP.NET Core"
              disabled={saving}
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="order"
              className="block text-sm font-semibold text-slate-900"
            >
              Lesson Order
            </label>

            <input
              id="order"
              type="number"
              min="1"
              value={order}
              onChange={(event) =>
                setOrder(event.target.value)
              }
              disabled={saving}
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
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
              rows={10}
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              placeholder="Write the lesson content here..."
              disabled={saving}
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="videoUrl"
              className="block text-sm font-semibold text-slate-900"
            >
              Video URL
              <span className="ml-2 font-normal text-slate-400">
                Optional
              </span>
            </label>

            <input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(event) =>
                setVideoUrl(event.target.value)
              }
              placeholder="https://..."
              disabled={saving}
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href={`/instructor/courses/${courseDocumentId}/lessons`}
              className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create Lesson"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
