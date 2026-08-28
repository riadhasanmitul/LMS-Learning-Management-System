import Link from "next/link";
import { BlogHeader } from "@/components/BlogHeader";
import { getPublishedPosts, type BlogPost } from "@/services/blog";

function getBodyText(body: unknown): string {
  if (!Array.isArray(body)) return "";
  return body
    .map((block) => {
      if (typeof block !== "object" || block === null || !("children" in block)) {
        return "";
      }
      const children = (block as { children?: unknown }).children;
      if (!Array.isArray(children)) return "";
      return children
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
    })
    .join(" ");
}

function estimateReadTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "Recently published";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  let error = "";

  try {
    posts = await getPublishedPosts();
  } catch {
    error = "Unable to load blog posts. Please check back later.";
  }

  const featuredPost = posts.length > 0 ? posts[0] : null;
  const regularPosts = posts.length > 1 ? posts.slice(1) : [];

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
      <BlogHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 py-16 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.15),transparent_40%)]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              Educational Insights & Updates
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
              Knowledge Hub <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">& Articles</span>
            </h1>

            <p className="mt-4 text-base leading-7 text-slate-400 md:text-lg">
              Explore the latest insights, tutorials, and course updates from the CPS LMS team.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-blue-400 font-bold">
                  ✓
                </span>
                <span>Verified Authors</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-indigo-400 font-bold">
                  📖
                </span>
                <span>{posts.length} Published Articles</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        {error && (
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {posts.length === 0 && !error && (
          <div className="my-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              📝
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">No articles published yet</h2>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              Our instructors and content managers are working on new content. Check back soon!
            </p>
          </div>
        )}

        {/* Featured Post Card */}
        {featuredPost && (
          <section className="mb-14">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Featured Article
              </h2>
            </div>

            <Link href={`/blog/${featuredPost.documentId}`} className="group block">
              <article className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 group-hover:border-blue-300 group-hover:shadow-xl md:grid md:grid-cols-12 md:items-stretch">
                {/* Image / Gradient Banner */}
                <div className="relative h-64 overflow-hidden bg-slate-900 md:col-span-6 md:h-auto">
                  {featuredPost.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featuredPost.coverImage}
                      alt={featuredPost.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-8 text-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-4xl shadow-inner backdrop-blur-md">
                        📚
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    Featured
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col justify-between p-8 md:col-span-6 md:p-10">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="font-semibold text-blue-600">
                        {featuredPost.author?.name ?? "CPS LMS Team"}
                      </span>
                      <span>•</span>
                      <span>{formatDate(featuredPost.publishedAt)}</span>
                      <span>•</span>
                      <span>{estimateReadTime(getBodyText(featuredPost.body))} min read</span>
                    </div>

                    <h3 className="mt-4 text-2xl font-bold leading-tight text-slate-900 transition group-hover:text-blue-600 md:text-3xl">
                      {featuredPost.title}
                    </h3>

                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600 md:text-base">
                      {getBodyText(featuredPost.body)}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm">
                        {getInitials(featuredPost.author?.name)}
                      </div>
                      <span className="text-xs font-medium text-slate-700">
                        {featuredPost.author?.name ?? "CPS LMS Author"}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 transition group-hover:translate-x-1">
                      Read Article →
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          </section>
        )}

        {/* Regular Posts Grid */}
        {regularPosts.length > 0 && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent Articles ({regularPosts.length})
              </h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {regularPosts.map((post) => {
                const bodyText = getBodyText(post.body);
                const readTime = estimateReadTime(bodyText);

                return (
                  <Link key={post.documentId} href={`/blog/${post.documentId}`} className="group flex">
                    <article className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-blue-300 group-hover:shadow-xl">
                      {/* Image Banner */}
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        {post.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50/60 p-6 text-center">
                            <span className="text-3xl">📝</span>
                          </div>
                        )}
                        <div className="absolute bottom-3 right-3 rounded-full bg-slate-900/70 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-md">
                          {readTime} min read
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="flex flex-1 flex-col justify-between p-6">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="font-semibold text-blue-600">
                              {post.author?.name ?? "CPS LMS"}
                            </span>
                            <span>•</span>
                            <span>{formatDate(post.publishedAt)}</span>
                          </div>

                          <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-slate-900 transition group-hover:text-blue-600">
                            {post.title}
                          </h3>

                          <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-slate-500">
                            {bodyText || "Click to read the full article."}
                          </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-blue-600">
                          <span className="flex items-center gap-2 text-slate-600">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">
                              {getInitials(post.author?.name)}
                            </span>
                            <span className="text-[11px] font-normal text-slate-500">
                              {post.author?.name ?? "Author"}
                            </span>
                          </span>

                          <span className="transition group-hover:translate-x-1">
                            Read →
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Footer Callout */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
            🎓
          </div>
          <h3 className="mt-3 text-lg font-bold text-slate-900">Ready to start learning?</h3>
          <p className="mt-1 text-sm text-slate-500">Explore interactive courses with real-time progress tracking and quizzes.</p>
          <div className="mt-5">
            <Link
              href="/login"
              className="inline-flex rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
