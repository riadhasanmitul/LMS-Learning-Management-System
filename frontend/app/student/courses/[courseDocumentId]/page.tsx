"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

import {
  enrollInCourse,
  getCourseLessons,
  getCourseProgress,
  getCourseQuizzes,
  getCourses,
  getMyCourses,
  type Course,
  type Lesson,
  type Progress,
  type CourseQuiz,
} from "@/services/student";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function CourseDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const courseDocumentId = String(params.courseDocumentId);

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [quizzes, setQuizzes] = useState<CourseQuiz[]>([]);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    async function loadCourse() {
      try {
        const [coursesResult, myCoursesResult] = await Promise.allSettled([
          getCourses(token),
          getMyCourses(token),
        ]);

        const courses =
          coursesResult.status === "fulfilled" ? coursesResult.value : [];
        const myCourses =
          myCoursesResult.status === "fulfilled" ? myCoursesResult.value : [];

        const foundCourse =
          courses.find((item) => item.documentId === courseDocumentId) ??
          myCourses.find((item) => item.documentId === courseDocumentId) ??
          null;

        if (!foundCourse) {
          setError("Course not found.");
          return;
        }

        setCourse(foundCourse);

        const enrolled = myCourses.some(
          (item) => item.documentId === courseDocumentId,
        );

        setIsEnrolled(enrolled);

        if (enrolled) {
          const [lessonsResult, progressResult, quizzesResult] =
            await Promise.allSettled([
              getCourseLessons(token, courseDocumentId),
              getCourseProgress(token, courseDocumentId),
              getCourseQuizzes(token, courseDocumentId),
            ]);

          if (lessonsResult.status === "fulfilled")
            setLessons(lessonsResult.value);
          if (progressResult.status === "fulfilled")
            setProgress(progressResult.value);
          if (quizzesResult.status === "fulfilled")
            setQuizzes(quizzesResult.value);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load this course.");
      } finally {
        setLoading(false);
      }
    }

    void loadCourse();
  }, [courseDocumentId, router]);

  async function handleEnroll() {
    const storedToken = getToken();

    if (storedToken === null) {
      router.push("/login");
      return;
    }

    const token: string = storedToken;

    setEnrolling(true);
    setError("");

    try {
      await enrollInCourse(token, courseDocumentId);

      setIsEnrolled(true);

      const [lessonsResult, progressResult, quizzesResult] =
        await Promise.allSettled([
          getCourseLessons(token, courseDocumentId),
          getCourseProgress(token, courseDocumentId),
          getCourseQuizzes(token, courseDocumentId),
        ]);

      if (lessonsResult.status === "fulfilled") setLessons(lessonsResult.value);
      if (progressResult.status === "fulfilled")
        setProgress(progressResult.value);
      if (quizzesResult.status === "fulfilled")
        setQuizzes(quizzesResult.value);
    } catch (err) {
      console.error(err);
      setError("Unable to enroll in this course.");
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-40 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-72 rounded-3xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </main>
    );
  }

  if (error && !course) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Course unavailable
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {error}
          </p>

          <Link
            href="/student"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/student"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              C
            </div>

            <div className="text-base font-bold text-slate-900 dark:text-white">
              CPS LMS
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/student"
              className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Course hero */}
        <section className="overflow-hidden rounded-3xl bg-slate-950">
          <div className="grid lg:grid-cols-[1.5fr_1fr]">
            <div className="p-8 md:p-10">
              <div className="mb-4">
                {isEnrolled ? (
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
                    Enrolled
                  </span>
                ) : (
                  <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-400">
                    Available Course
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                {course.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
                {course.description || "No description provided."}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {!isEnrolled ? (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {enrolling
                      ? "Enrolling..."
                      : "Enroll in course"}
                  </button>
                ) : (
                  <Link
                    href={
                      lessons.length > 0
                        ? `/student/lessons/${lessons[0].documentId}`
                        : "#lessons"
                    }
                    className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    Start learning
                  </Link>
                )}

                <Link
                  href="/student"
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Back
                </Link>
              </div>
            </div>

            <div className="flex min-h-64 items-center justify-center bg-gradient-to-br from-blue-600/20 to-cyan-500/10">
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-3xl text-white">
                  📚
                </div>

                <p className="mt-4 text-sm font-medium text-slate-400">
                  CPS LMS Course
                </p>
              </div>
            </div>
          </div>
        </section>

        {error && course && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Course stats */}
        {isEnrolled && progress && (
          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <InfoCard
              label="Lessons"
              value={String(progress.totalLessons)}
            />

            <InfoCard
              label="Completed"
              value={String(progress.completedLessons)}
            />

            <InfoCard
              label="Progress"
              value={`${progress.progressPercentage}%`}
            />
          </section>
        )}

        {/* Progress */}
        {isEnrolled && progress && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Your Progress
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Keep going — you&#39;re making progress.
                </p>
              </div>

              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {progress.progressPercentage}%
              </span>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${progress.progressPercentage}%`,
                }}
              />
            </div>
          </section>
        )}

        {/* Lessons */}
        {isEnrolled && (
          <section id="lessons" className="mt-8 pb-10">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Course Lessons
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Work through the lessons in order.
              </p>
            </div>

            {lessons.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
                <div className="text-3xl">📖</div>

                <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">
                  No lessons yet
                </h3>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  This course does not have any lessons yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson, index) => (
                  <Link
                    key={lesson.documentId}
                    href={`/student/lessons/${lesson.documentId}`}
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-blue-950/40 dark:group-hover:text-blue-400">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                        {lesson.title}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        Lesson {index + 1}
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      Open →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Assessments */}
        {isEnrolled && quizzes.length > 0 && (
          <section className="mt-8 pb-10">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Assessments
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Test your knowledge with the course quizzes.
              </p>
            </div>

            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <Link
                  key={quiz.documentId}
                  href={`/student/quizzes/${quiz.documentId}`}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-lg text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">
                    ✓
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      {quiz.title}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      Course assessment
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    Take Quiz →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>

      <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}