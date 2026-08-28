import { api } from "@/lib/api";

export interface Course {
  id: number;
  documentId: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  publishedAt?: string | null;
}

export interface LessonTextNode {
  type?: string;
  text?: string;
}

export interface LessonBlock {
  type?: string;
  level?: number;
  format?: string;
  children?: LessonTextNode[];
}

export interface Lesson {
  id: number;
  documentId: string;
  title: string;
  content: LessonBlock[];
  videoUrl?: string | null;
  order: number;
  publishedAt?: string | null;
  course?: {
    id: number;
    documentId: string;
    title: string;
  } | null;
}

export interface Progress {
  course: {
    documentId: string;
    title: string;
  };
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
}

export interface LessonProgress {
  id: number;
  documentId: string;
  completed: boolean;
  completedAt?: string | null;
  lesson?: {
    id: number;
    documentId: string;
    title: string;
  };
}

export interface Question {
  id: number;
  documentId: string;
  question: string;
  options: string[];
}

export interface Quiz {
  id: number;
  documentId: string;
  title: string;
  questions: Question[];
  course?: {
    id: number;
    documentId: string;
    title: string;
  } | null;
}

export interface QuizAttemptResult {
  documentId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
}

export async function getCourses(token: string): Promise<Course[]> {
  const response = await api.get<{
    data: Course[];
  }>("/api/courses", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}

export async function getMyCourses(token: string): Promise<Course[]> {
  const response = await api.get<{
    data: Course[];
  }>("/api/courses/my-courses", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}

export async function getCourseProgress(
  token: string,
  courseDocumentId: string,
): Promise<Progress> {
  const response = await api.get<{
    data: Progress;
  }>(`/api/courses/${courseDocumentId}/progress`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}

export async function getCourseLessons(
  token: string,
  courseDocumentId: string,
): Promise<Lesson[]> {
  const response = await api.get<{
    data: Lesson[];
  }>(`/api/lessons/course/${courseDocumentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}

export async function getLesson(
  token: string,
  lessonDocumentId: string,
): Promise<Lesson> {
  const response = await api.get<{
    data: Lesson;
  }>(`/api/lessons/${lessonDocumentId}?populate=course`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}

export async function enrollInCourse(
  token: string,
  courseDocumentId: string,
) {
  const response = await api.post(
    "/api/enrollments",
    {
      data: {
        course: courseDocumentId,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}

export async function markLessonComplete(
  token: string,
  lessonDocumentId: string,
): Promise<LessonProgress> {
  const response = await api.post<{
    data: LessonProgress;
  }>(
    "/api/lesson-progresses",
    {
      data: {
        lesson: lessonDocumentId,
        completed: true,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data.data;
}

export async function getQuiz(
  token: string,
  quizDocumentId: string,
): Promise<Quiz> {
  const response = await api.get<{
    data: Quiz;
  }>(
    `/api/quizzes/${quizDocumentId}?populate=questions,course`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data.data;
}

export async function submitQuiz(
  token: string,
  quizDocumentId: string,
  answers: Record<string, string>,
): Promise<QuizAttemptResult> {
  const response = await api.post<{
    data: {
      attempt: QuizAttemptResult;
    };
  }>(
    "/api/quiz-attempts/submit",
    {
      data: {
        quiz: quizDocumentId,
        answers,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data.data.attempt;
}
export interface QuizAttempt {
  id: number;
  documentId: string;
  score: number;
  totalQuestions: number;
  submittedAt: string;
  quiz?: {
    id: number;
    documentId: string;
    title: string;
    course?: {
      id: number;
      documentId: string;
      title: string;
    } | null;
  } | null;
}

export async function getMyQuizAttempts(
  token: string,
): Promise<QuizAttempt[]> {
  const response = await api.get<{
    data: QuizAttempt[];
  }>("/api/quiz-attempts/my-attempts", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}
export interface CourseQuiz {
  id: number;
  documentId: string;
  title: string;
}
export async function getCourseQuizzes(
  token: string,
  courseDocumentId: string,
): Promise<CourseQuiz[]> {
  const response = await api.get<{
    data: CourseQuiz[];
  }>(
    `/api/quizzes?filters[course][documentId][$eq]=${courseDocumentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data.data;
}