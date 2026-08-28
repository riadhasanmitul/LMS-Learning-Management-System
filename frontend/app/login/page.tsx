"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, login } from "@/services/auth";
import { setAuthToken } from "@/lib/api";
import axios from "axios";
export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const loginResult = await login(identifier, password);

      setAuthToken(loginResult.jwt);

      const currentUser = await getCurrentUser(loginResult.jwt);

      const role = currentUser.role?.name;

      if (!role) {
        throw new Error("User role not found");
      }

      localStorage.setItem("jwt", loginResult.jwt);
      localStorage.setItem("user", JSON.stringify(currentUser));
      localStorage.setItem("role", role);

      switch (role) {
        case "Student":
          router.push("/student");
          break;
        case "Instructor":
          router.push("/instructor");
          break;
        case "Content Manager":
          router.push("/content-manager");
          break;
        case "Admin":
          router.push("/admin");
          break;
        default:
          throw new Error(`Unknown role: ${role}`);
      }
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response?.data?.error?.message
      ) {
        const message = error.response.data.error.message;

        if (message.toLowerCase().includes("blocked")) {
          setError(
            "Your account has been blocked by an administrator.",
          );
        } else {
          setError(message);
        }

        return;
      }

      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("blocked")
      ) {
        setError(error.message);
        return;
      }

      setError("Invalid username or password.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left branding section */}
        <section className="relative hidden overflow-hidden bg-slate-950 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.18),transparent_35%)]" />

          <div className="relative flex w-full flex-col justify-between p-12 xl:p-16">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-lg font-bold text-white">
                    C
                  </div>

                  <span className="text-xl font-semibold text-white">
                    CPS LMS
                  </span>
                </div>

                <a
                  href="/blog"
                  className="text-sm font-medium text-slate-300 hover:text-white"
                >
                  Blog →
                </a>
              </div>

            <div className="max-w-xl">
              <span className="mb-5 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300">
                Learning Management System
              </span>

              <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                Learn.
                <br />
                Build.
                <br />
                Grow.
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
                Your courses, lessons, progress and quizzes in one place.
              </p>
            </div>

            <p className="text-sm text-slate-500">
              CPS LMS • Learning made simpler
            </p>
          </div>
        </section>

        {/* Right login section */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
                C
              </div>

              <span className="text-xl font-semibold text-slate-900">
                CPS LMS
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to continue learning.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="identifier"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Username or email
                </label>

                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(event) =>
                    setIdentifier(event.target.value)
                  }
                  required
                  autoComplete="username"
                  placeholder="Enter your username or email"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <p className="text-center text-xs leading-5 text-slate-400">
                Secure access to your CPS LMS account
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}