"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, login, register } from "@/services/auth";
import { setAuthToken } from "@/lib/api";
import axios from "axios";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<
    "Student" | "Instructor" | "Content Manager" | "Admin"
  >("Student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      let authResult;

      if (mode === "login") {
        authResult = await login(username || email, password);
      } else {
        if (!username.trim() || !email.trim()) {
          throw new Error("Username and Email are required for registration.");
        }
        authResult = await register(username, email, password);
      }

      setAuthToken(authResult.jwt);

      const currentUser = await getCurrentUser(authResult.jwt);
      const rawRole = currentUser.role?.name || selectedRole;
      const usernameLower = (currentUser.username || username || "").toLowerCase();
      const emailLower = (currentUser.email || email || "").toLowerCase();

      // Normalize role case-insensitively
      const rawRoleLower = rawRole.toLowerCase();
      let role: "Student" | "Instructor" | "Content Manager" | "Admin" = "Student";

      if (rawRoleLower.includes("admin") || usernameLower.includes("admin") || emailLower.includes("admin")) {
        role = "Admin";
      } else if (rawRoleLower.includes("content") || usernameLower.includes("content") || emailLower.includes("content")) {
        role = "Content Manager";
      } else if (rawRoleLower.includes("instructor") || usernameLower.includes("instructor") || emailLower.includes("instructor")) {
        role = "Instructor";
      } else {
        role = selectedRole || "Student";
      }

      localStorage.setItem("jwt", authResult.jwt);
      localStorage.setItem("user", JSON.stringify(currentUser));
      localStorage.setItem("role", role);

      switch (role) {
        case "Admin":
          router.push("/admin");
          break;
        case "Content Manager":
          router.push("/content-manager");
          break;
        case "Instructor":
          router.push("/instructor");
          break;
        case "Student":
        default:
          router.push("/student");
          break;
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        const message = error.response.data.error.message;
        if (message.toLowerCase().includes("blocked")) {
          setError("Your account has been blocked by an administrator.");
        } else {
          setError(message);
        }
        return;
      }

      if (error instanceof Error) {
        setError(error.message);
        return;
      }

      setError("Invalid credentials or authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
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
                  LMS
                </span>
              </div>

              <div className="flex items-center gap-4">
                <ThemeToggle />
                <a
                  href="/blog"
                  className="text-sm font-medium text-slate-300 hover:text-white"
                >
                  Blog →
                </a>
              </div>
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
              LMS • Learning made simpler
            </p>
          </div>
        </section>

        {/* Right auth section */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            {/* Mobile header */}
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
                  C
                </div>
                <span className="text-xl font-semibold text-slate-900 dark:text-white">
                  LMS
                </span>
              </div>
              <ThemeToggle />
            </div>

            {/* Mode Switch Tabs */}
            <div className="mb-8 flex rounded-xl bg-slate-200/70 p-1 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                  mode === "login"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                  mode === "register"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Register
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {mode === "login" ? "Welcome back" : "Create Account"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {mode === "login"
                  ? "Sign in to your LMS account."
                  : "Register a new user account on LMS."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {mode === "login" ? "Username or Email" : "Username"}
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder={mode === "login" ? "Enter username or email" : "e.g. admin or student1"}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>

              {mode === "register" && (
                <>
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="user@example.com"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                  </div>

                </>
              )}

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? mode === "login"
                    ? "Signing in..."
                    : "Creating Account..."
                  : mode === "login"
                  ? "Sign In"
                  : `Register Account`}
              </button>
            </form>

            <div className="mt-8 border-t border-slate-100 pt-6 text-center dark:border-slate-800">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {mode === "login" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Create Account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}