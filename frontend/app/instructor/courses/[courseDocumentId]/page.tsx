"use client";

import axios from "axios";
import Link from "next/link";
import {
  publishCourse,
  unpublishCourse,
} from "@/services/instructor";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getToken, logout } from "@/lib/auth";
import { api } from "@/lib/api";

interface Course {
  id: number;
  documentId: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  publishedAt?: string | null;
}

export default function ManageCoursePage() {
  const router = useRouter();
  const params = useParams();

  const courseDocumentId = String(params.courseDocumentId);

  const [course, setCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    async function loadCourse() {
      try {
        let response;
        try {
          response = await api.get<{
            data: Course;
          }>(`/api/courses/${courseDocumentId}?status=draft`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (err: unknown) {
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            response = await api.get<{
              data: Course;
            }>(`/api/courses/${courseDocumentId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          } else {
            throw err;
          }
        }

        const result = response.data.data;

        setCourse(result);
        setTitle(result.title);
        setDescription(result.description || "");
      } catch (error: unknown) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 404
        ) {
          setError("This course is no longer available.");
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
          setError("You do not have access to this course.");
          return;
        }

        console.error(error);
        setError("Unable to load this course.");
      } finally {
        setLoading(false);
      }
    }

    void loadCourse();
  }, [courseDocumentId, router]);

  async function handleUpdate(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    if (!title.trim()) {
      setError("Course title is required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.put<{
        data: Course;
      }>(
        `/api/courses/${courseDocumentId}`,
        {
          data: {
            title: title.trim(),
            description: description.trim(),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCourse(response.data.data);
      setSuccess("Course updated successfully.");
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
        setError("Unable to update the course.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course?",
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

    setDeleting(true);
    setError("");

    try {
      await api.delete(
        `/api/courses/${courseDocumentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      router.replace("/instructor");
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
        setError("Unable to delete the course.");
      }

      setDeleting(false);
    }
  }

  const [publishing, setPublishing] = useState(false);

  async function handleTogglePublish() {
    const storedToken = getToken();
    if (storedToken === null) {
      router.push("/login");
      return;
    }

    setPublishing(true);
    setError("");
    setSuccess("");

    try {
      if (course?.publishedAt) {
        await unpublishCourse(storedToken, courseDocumentId);
        setCourse((curr) => (curr ? { ...curr, publishedAt: null } : curr));
        setSuccess("Course saved as draft (unpublished).");
      } else {
        await publishCourse(storedToken, courseDocumentId);
        setCourse((curr) =>
          curr ? { ...curr, publishedAt: new Date().toISOString() } : curr,
        );
        setSuccess("Course published successfully!");
      }
    } catch (err: unknown) {
      console.error(err);
      setError("Unable to change publish status.");
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 rounded bg-slate-200" />
            <div className="h-64 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Course unavailable
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error || "Course not found."}
          </p>

          <Link
            href="/instructor"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Instructor Dashboard
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
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              C
            </div>

            <div>
              <div className="font-bold text-slate-900">
                CPS LMS
              </div>

              <div className="text-[11px] text-slate-400">
                Instructor Portal
              </div>
            </div>
          </Link>

          <Link
            href="/instructor"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <section className="flex flex-col gap-4 rounded-3xl bg-slate-950 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <p className="text-sm font-medium text-blue-400">
              Course Management
            </p>

            <h1 className="mt-3 text-3xl font-bold text-white">
              {course.title}
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              Manage your course information and content.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-block rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                course.publishedAt
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {course.publishedAt ? "● Published" : "○ Draft"}
            </span>

            <button
              onClick={() => void handleTogglePublish()}
              disabled={publishing}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition disabled:opacity-50 ${
                course.publishedAt
                  ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                  : "bg-emerald-500 text-white hover:bg-emerald-400"
              }`}
            >
              {publishing
                ? "Updating..."
                : course.publishedAt
                ? "Unpublish"
                : "Publish Course"}
            </button>
          </div>
        </section>

        <form
          onSubmit={handleUpdate}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 md:p-8"
        >
          <h2 className="text-xl font-bold text-slate-900">
            Course Information
          </h2>

          <div className="mt-6">
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-slate-900"
            >
              Course Title
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              disabled={saving}
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-slate-900"
            >
              Description
            </label>

            <textarea
              id="description"
              rows={6}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              disabled={saving}
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

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Course"}
            </button>

            <div className="flex gap-3">
              <Link
                href="/instructor"
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving || deleting}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>

        {/* Content management */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Course Content
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Manage lessons and quizzes for this course.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link
              href={`/instructor/courses/${courseDocumentId}/lessons`}
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-200 hover:bg-blue-50/30"
            >
              <div className="text-2xl">📖</div>

              <h3 className="mt-3 font-semibold text-slate-900">
                Lessons
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create and manage course lessons.
              </p>

              <span className="mt-4 block text-sm font-semibold text-blue-600">
                Manage Lessons →
              </span>
            </Link>

            <Link
              href={`/instructor/courses/${courseDocumentId}/quizzes`}
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-200 hover:bg-blue-50/30"
            >
              <div className="text-2xl">✓</div>

              <h3 className="mt-3 font-semibold text-slate-900">
                Quizzes
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create and manage course quizzes.
              </p>

              <span className="mt-4 block text-sm font-semibold text-blue-600">
                Manage Quizzes →
              </span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
