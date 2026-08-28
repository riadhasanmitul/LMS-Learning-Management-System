"use client";

import axios from "axios";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { getToken, logout } from "@/lib/auth";
import { createBlogPost } from "@/services/blog";

export default function AdminCreateBlogPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [body, setBody] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
    status: "draft" | "published",
  ) {
    event.preventDefault();

    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!body.trim()) {
      setError("Body is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createBlogPost(storedToken, {
        title: title.trim(),
        body: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: body.trim(),
              },
            ],
          },
        ],
        coverImage: coverImage.trim(),
        publicationStatus: status,
      });

      router.push("/admin/blog");
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
        setError("Unable to create the blog post.");
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
            href="/admin"
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
                Admin Portal
              </div>
            </div>
          </Link>

          <Link
            href="/admin/blog"
            className="text-sm font-medium text-slate-500"
          >
            ← Blog
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <section className="rounded-3xl bg-slate-950 p-8 md:p-10">
          <p className="text-sm font-medium text-blue-400">
            Administration
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white">
            Create Blog Post
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Create, save, or publish an article.
          </p>
        </section>

        <form className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <label
            htmlFor="title"
            className="block text-sm font-semibold text-slate-900"
          >
            Title
          </label>

          <input
            id="title"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            disabled={saving}
            placeholder="Blog post title"
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
          />

          <label
            htmlFor="coverImage"
            className="mt-6 block text-sm font-semibold text-slate-900"
          >
            Cover Image URL
          </label>

          <input
            id="coverImage"
            value={coverImage}
            onChange={(event) =>
              setCoverImage(event.target.value)
            }
            disabled={saving}
            placeholder="https://..."
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
          />

          <label
            htmlFor="body"
            className="mt-6 block text-sm font-semibold text-slate-900"
          >
            Body
          </label>

          <textarea
            id="body"
            rows={16}
            value={body}
            onChange={(event) =>
              setBody(event.target.value)
            }
            disabled={saving}
            placeholder="Write the article..."
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm leading-7 outline-none focus:border-blue-500"
          />

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/blog"
              className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-600"
            >
              Cancel
            </Link>

            <button
              type="button"
              disabled={saving}
              onClick={(event) =>
                void handleSubmit(
                  event as unknown as FormEvent<HTMLFormElement>,
                  "draft",
                )
              }
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={(event) =>
                void handleSubmit(
                  event as unknown as FormEvent<HTMLFormElement>,
                  "published",
                )
              }
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Publishing..." : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
