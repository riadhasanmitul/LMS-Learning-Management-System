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
          className="mt-12 mb-5 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl lg:text-4xl"
        >
          {text}
        </h2>
      );
    }

    if (blockType === "quote") {
      return (
        <blockquote
          key={index}
          className="my-10 rounded-3xl border-l-4 border-blue-500 bg-blue-50/70 p-8 italic text-slate-800 dark:bg-blue-950/40 dark:text-slate-200"
        >
          &ldquo;{text}&rdquo;
        </blockquote>
      );
    }

    if (blockType === "code") {
      return (
        <pre
          key={index}
          className="my-10 overflow-x-auto rounded-3xl bg-slate-950 p-6 text-sm font-mono text-slate-100 shadow-xl sm:text-base"
        >
          <code>{text}</code>
        </pre>
      );
    }

    if (blockType === "list") {
      return (
        <ul
          key={index}
          className="my-8 list-disc space-y-3 pl-8 text-lg leading-relaxed text-slate-700 dark:text-slate-300 lg:text-xl"
        >
          <li>{text}</li>
        </ul>
      );
    }

    return (
      <p
        key={index}
        className="mb-8 text-base leading-relaxed text-slate-700 dark:text-slate-300 sm:text-lg sm:leading-8 md:text-xl md:leading-9"
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
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16 font-sans dark:bg-slate-950 sm:px-10">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-12">
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
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700"
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

      <article className="mx-auto max-w-6xl px-6 py-10 sm:px-10 md:py-16 lg:px-16">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8 flex items-center gap-2.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <Link
            href="/blog"
            className="font-medium transition hover:text-blue-600 dark:hover:text-blue-400"
          >
            Blog
          </Link>
          <span>/</span>
          <span className="max-w-md truncate font-semibold text-slate-800 dark:text-slate-200">
            {post.title}
          </span>
        </nav>

        {/* Header Metadata */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
              Published Article
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {readTime} min read
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl lg:leading-tight">
            {post.title}
          </h1>

          {/* Author Badge & Date */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-6 border-y border-slate-200/80 py-5 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20">
                {getInitials(post.author?.name)}
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900 dark:text-white">
                  {post.author?.name ?? "LMS Team"}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Author & Contributor
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500 dark:text-slate-400">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {formattedDate}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                LMS Knowledge Base
              </p>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImage ? (
          <div className="mb-12 overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-900 shadow-xl dark:border-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="aspect-video w-full object-cover md:max-h-[560px]"
            />
          </div>
        ) : (
          <div className="mb-12 flex h-52 w-full items-center justify-center rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 text-center shadow-lg sm:h-64">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-4xl backdrop-blur-md">
              📖
            </div>
          </div>
        )}

        {/* Article Body Container */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-12 lg:p-16">
          {renderBody(post.body)}
        </div>

        {/* Author Bio Footer Box */}
        <div className="mt-12 rounded-3xl border border-slate-200/80 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-8 text-white shadow-2xl dark:border-slate-800 sm:p-10">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold backdrop-blur-md">
              {getInitials(post.author?.name)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Written by {post.author?.name ?? "LMS Team"}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                Course contributor & educator at Learning Management System.
              </p>
            </div>
          </div>
        </div>

        {/* Back Link Button */}
        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <span>←</span>
            <span>Back to All Articles</span>
          </Link>
        </div>
      </article>
    </main>
  );
}
