"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getToken, logout } from "@/lib/auth";
import {
  deleteBlogPost,
  getManagedBlogPosts,
  type BlogPost,
} from "@/services/blog";

export default function ContentManagerBlogPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    async function loadPosts() {
      try {
        const result = await getManagedBlogPosts(token);
        setPosts(result);
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

        setError("Unable to load blog posts.");
      } finally {
        setLoading(false);
      }
    }

    void loadPosts();
  }, [router]);

  async function handleDelete(documentId: string) {
    if (
      !window.confirm(
        "Are you sure you want to delete this blog post?",
      )
    ) {
      return;
    }

    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    try {
      await deleteBlogPost(
        storedToken,
        documentId,
      );

      setPosts((current) =>
        current.filter(
          (post) => post.documentId !== documentId,
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

      setError("Unable to delete the blog post.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="animate-pulse space-y-5">
            <div className="h-36 rounded-3xl bg-slate-200" />
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
            href="/content-manager"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Dashboard
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
              Blog Posts
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Create and manage blog content.
            </p>
          </div>

          <Link
            href="/content-manager/blog/new"
            className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
          >
            + New Post
          </Link>
        </section>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="mt-6 space-y-4 pb-10">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <h2 className="font-semibold text-slate-900">
                No blog posts
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Create your first blog post.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <article
                key={post.documentId}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">
                        {post.title}
                      </h2>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          post.publicationStatus ===
                          "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {post.publicationStatus}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      Author:{" "}
                      {post.author?.name ?? "Unknown"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/content-manager/blog/${post.documentId}`}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Edit
                    </Link>

                    {post.publicationStatus ===
                      "published" && (
                      <Link
                        href={`/blog/${post.documentId}`}
                        target="_blank"
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        View
                      </Link>
                    )}

                    <button
                      onClick={() =>
                        void handleDelete(
                          post.documentId,
                        )
                      }
                      className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
