import Link from "next/link";
import { BlogHeader } from "@/components/BlogHeader";
import { getPublishedPost } from "@/services/blog";

function renderBody(body: unknown) {
  if (!Array.isArray(body)) {
    return (
      <p className="italic text-slate-500 dark:text-slate-400">
        No content available for this article.
      </p>
    );
  }

  return body.map((block, index) => {
    if (typeof block !== "object" || block === null || !("children" in block)) {
      return null;
    }

    const children = (block as { children?: unknown }).children;
    if (!Array.isArray(children)) return null;

    const blockType = (block as { type?: string }).type;

    const text = children
      .map((child) => {
        if (
          typeof child === "object" &&
          child !== null &&
          "text" in child &&
          typeof (child as { text?: unknown }).text === "string"
        ) {
          return (child as { text: string }).text;
        }
        return "";
      })
      .join("");

    if (!text.trim()) return null;

    if (blockType === "heading") {
      return (
        <h2
          key={index}
          className="mt-10 mb-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl"
        >
          {text}
        </h2>
      );
    }

    if (blockType === "quote") {
      return (
        <blockquote
          key={index}
          className="my-8 rounded-2xl border-l-4 border-blue-500 bg-blue-50/70 p-6 italic text-slate-800 dark:bg-blue-950/40 dark:text-slate-200"
        >
          &ldquo;{text}&rdquo;
        </blockquote>
      );
    }

    if (blockType === "code") {
      return (
        <pre
          key={index}
          className="my-8 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-sm font-mono text-slate-100 shadow-inner"
        >
          <code>{text}</code>
        </pre>
      );
    }

    if (blockType === "list") {
      return (
        <ul
          key={index}
          className="my-6 list-disc space-y-2.5 pl-6 text-base leading-relaxed text-slate-700 dark:text-slate-300 md:text-lg"
        >
          <li>{text}</li>
        </ul>
      );
    }

    return (
      <p
        key={index}
        className="mb-6 text-base leading-relaxed text-slate-700 dark:text-slate-300 md:text-lg md:leading-8"
      >
        {text}
      </p>
    );
  });
}

function calculateReadingTime(body: unknown): number {
  if (!Array.isArray(body)) return 1;
  const fullText = body
    .map((b) => {
      if (
        typeof b === "object" &&
        b !== null &&
        "children" in b &&
        Array.isArray((b as { children?: unknown[] }).children)
      ) {
        return (b as { children: unknown[] }).children
          .map((c) =>
            typeof c === "object" && c !== null && "text" in c
              ? (c as { text: string }).text
              : "",
          )
          .join(" ");
      }
      return "";
    })
    .join(" ");
  const words = fullText.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function getInitials(name?: string | null): string {
  if (!name) return "LMS";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  let post;

  try {
    post = await getPublishedPost(documentId);
  } catch {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 font-sans dark:bg-slate-950 sm:px-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl dark:bg-red-950/40">
            📄
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
            Article Not Found
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            This article may have been unpublished or removed by the author.
          </p>
          <Link
            href="/blog"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700"
          >
            ← Return to Blog
          </Link>
        </div>
      </main>
    );
  }

  const readTime = calculateReadingTime(post.body);
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recently Published";

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors selection:bg-blue-500 selection:text-white dark:bg-slate-950 dark:text-slate-100">
      <BlogHeader />

      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:py-14 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/blog"
            className="transition hover:text-blue-600 dark:hover:text-blue-400"
          >
            Blog
          </Link>
          <span>/</span>
          <span className="max-w-xs truncate font-medium text-slate-800 dark:text-slate-200">
            {post.title}
          </span>
        </nav>

        {/* Header Metadata */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
              Published Article
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {readTime} min read
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl lg:leading-tight">
            {post.title}
          </h1>

          {/* Author Badge & Date */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-slate-200/80 py-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-white shadow-md shadow-blue-500/20">
                {getInitials(post.author?.name)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {post.author?.name ?? "LMS Team"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Author & Contributor
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500 dark:text-slate-400">
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {formattedDate}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                LMS Knowledge Base
              </p>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImage ? (
          <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-900 shadow-lg dark:border-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="aspect-video w-full object-cover md:max-h-[480px]"
            />
          </div>
        ) : (
          <div className="mb-8 flex h-44 w-full items-center justify-center rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-center shadow-md sm:h-52">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl backdrop-blur-md">
              📖
            </div>
          </div>
        )}

        {/* Article Body */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8 md:p-12">
          {renderBody(post.body)}
        </div>

        {/* Author Bio Footer Box */}
        <div className="mt-8 rounded-3xl border border-slate-200/80 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl dark:border-slate-800 sm:p-8">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold backdrop-blur-md">
              {getInitials(post.author?.name)}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Written by {post.author?.name ?? "LMS Team"}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                Course contributor & educator at Learning Management System.
              </p>
            </div>
          </div>
        </div>

        {/* Back Link Button */}
        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <span>←</span>
            <span>Back to All Articles</span>
          </Link>
        </div>
      </article>
    </main>
  );
}
