"use client";

import axios from "axios";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { getToken, logout } from "@/lib/auth";
import {
  updateBlogPost,
  type BlogPost,
} from "@/services/blog";

function extractBodyText(body: unknown): string {
  if (!Array.isArray(body)) {
    return "";
  }

  return body
    .map((block) => {
      if (
        typeof block !== "object" ||
        block === null ||
        !("children" in block)
      ) {
        return "";
      }

      const children = (block as {
        children?: unknown;
      }).children;

      if (!Array.isArray(children)) {
        return "";
      }

      return children
        .map((child) => {
          if (
            typeof child === "object" &&
            child !== null &&
            "text" in child &&
            typeof (child as { text?: unknown }).text ===
              "string"
          ) {
            return (child as { text: string }).text;
          }

          return "";
        })
        .join("");
    })
    .join("\n\n");
}

export default function EditContentManagerBlogPage() {
  const router = useRouter();
  const params = useParams();

  const documentId = String(params.documentId);

  const [post, setPost] = useState<BlogPost | null>(null);

  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [body, setBody] = useState("");
  const [publicationStatus, setPublicationStatus] =
    useState<"draft" | "published">("draft");

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

    async function loadPost() {
      try {
        const response = await api.get<{
          data: BlogPost;
        }>(`/api/blog-posts/${documentId}?status=draft`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = response.data.data;

        setPost(result);
        setTitle(result.title);
        setCoverImage(result.coverImage ?? "");
        setBody(extractBodyText(result.body));

        setPublicationStatus(
          result.publicationStatus === "published"
            ? "published"
            : "draft",
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
            "You do not have permission to edit this post.",
          );
          return;
        }

        if (
          axios.isAxiosError(error) &&
          error.response?.status === 404
        ) {
          setError("Blog post not found.");
          return;
        }

        setError("Unable to load the blog post.");
      } finally {
        setLoading(false);
      }
    }

    void loadPost();
  }, [documentId, router]);

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
    setSuccess("");

    try {
      const updatedPost = await updateBlogPost(
        storedToken,
        documentId,
        {
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
        },
      );

      const result = updatedPost?.data;

      if (result) {
        setPost(result);
      }

      setPublicationStatus(status);

      setSuccess(
        status === "published"
          ? "Blog post published successfully."
          : "Blog post saved as draft.",
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
          "You do not have permission to update this post.",
        );
        return;
      }

      if (
        axios.isAxiosError(error) &&
        error.response?.data?.error?.message
      ) {
        setError(error.response.data.error.message);
      } else {
        setError("Unable to update the blog post.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this blog post?",
    );

    if (!confirmed) {
      return;
    }

    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const token: string = storedToken;

      await (
        await import("@/services/blog")
      ).deleteBlogPost(token, documentId);

      router.push("/content-manager/blog");
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
        setError("Unable to delete the blog post.");
      }

      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="animate-pulse space-y-5">
            <div className="h-32 rounded-3xl bg-slate-200" />
            <div className="h-16 rounded-2xl bg-slate-200" />
            <div className="h-72 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Blog Post Unavailable
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error || "Blog post not found."}
          </p>

          <Link
            href="/content-manager/blog"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Blog
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
            className="font-bold text-slate-900"
          >
            LMS
          </Link>

          <Link
            href="/content-manager/blog"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Blog Posts
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <section className="rounded-3xl bg-slate-950 p-8 md:p-10">
          <p className="text-sm font-medium text-blue-400">
            Content Management
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white">
            Edit Blog Post
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Update the article and choose whether to save it as a
            draft or publish it.
          </p>
        </section>

        <form className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-slate-900"
            >
              Title
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              disabled={saving || deleting}
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="coverImage"
              className="block text-sm font-semibold text-slate-900"
            >
              Cover Image URL
            </label>

            <input
              id="coverImage"
              type="url"
              value={coverImage}
              onChange={(event) =>
                setCoverImage(event.target.value)
              }
              disabled={saving || deleting}
              placeholder="https://..."
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="body"
              className="block text-sm font-semibold text-slate-900"
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
              disabled={saving || deleting}
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm leading-7 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Current Status
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900">
              {publicationStatus === "published"
                ? "Published"
                : "Draft"}
            </p>
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

          <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={saving || deleting}
              className="rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Post"}
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/content-manager/blog"
                className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="button"
                disabled={saving || deleting}
                onClick={(event) =>
                  void handleSubmit(
                    event as unknown as FormEvent<HTMLFormElement>,
                    "draft",
                  )
                }
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Draft"}
              </button>

              <button
                type="button"
                disabled={saving || deleting}
                onClick={(event) =>
                  void handleSubmit(
                    event as unknown as FormEvent<HTMLFormElement>,
                    "published",
                  )
                }
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Publish"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
