"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";

export function BlogHeader() {
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null);
  const [roleName, setRoleName] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setRoleName(role);
    if (role === "Student") setDashboardUrl("/student");
    else if (role === "Instructor") setDashboardUrl("/instructor");
    else if (role === "Content Manager") setDashboardUrl("/content-manager");
    else if (role === "Admin") setDashboardUrl("/admin");
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all dark:border-slate-800/80 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href={dashboardUrl ?? "/"}
          className="group flex items-center gap-2.5 sm:gap-3.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-white shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105 sm:h-10 sm:w-10">
            C
          </div>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100">
                LMS
              </span>
              <span className="rounded-full border border-blue-200/60 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:border-blue-800/60 dark:bg-blue-950/60 dark:text-blue-400">
                Blog
              </span>
            </div>
            <p className="hidden text-[11px] font-medium text-slate-400 dark:text-slate-500 sm:block">
              Articles & Resources
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <Link
            href="/blog"
            className="rounded-xl border border-slate-200/80 bg-slate-100/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Blog
          </Link>

          {dashboardUrl ? (
            <Link
              href={dashboardUrl}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:px-4 sm:py-2"
            >
              <span>Dashboard</span>
              <span className="hidden text-slate-400 sm:inline">
                ({roleName})
              </span>
              <span className="text-blue-400">→</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
