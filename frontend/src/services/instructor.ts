import { api } from "@/lib/api";

export interface InstructorCourse {
  id: number;
  documentId: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  publishedAt?: string | null;
}

export interface InstructorLesson {
  id: number;
  documentId: string;
  title: string;
  content: unknown;
  videoUrl?: string | null;
  order: number;
  publishedAt?: string | null;
}

export async function getInstructorCourses(
  token: string,
): Promise<InstructorCourse[]> {
  const response = await api.get<{
    data: InstructorCourse[];
  }>("/api/courses/instructor-courses", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}

export async function getInstructorLessons(
  token: string,
  courseDocumentId: string,
): Promise<InstructorLesson[]> {
  const response = await api.get<{
    data: InstructorLesson[];
  }>(
    `/api/lessons/instructor/${courseDocumentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data.data;
}

export async function createLesson(
  token: string,
  courseDocumentId: string,
  title: string,
  content: unknown,
  order: number,
  videoUrl?: string,
) {
  const response = await api.post(
    "/api/lessons",
    {
      data: {
        title,
        content,
        order,
        videoUrl: videoUrl || null,
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

export async function updateLesson(
  token: string,
  lessonDocumentId: string,
  data: {
    title: string;
    content: unknown;
    order: number;
    videoUrl?: string;
  },
) {
  const response = await api.put(
    `/api/lessons/${lessonDocumentId}?status=draft`,
    {
      data: {
        ...data,
        videoUrl: data.videoUrl || null,
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

export async function deleteLesson(
  token: string,
  lessonDocumentId: string,
) {
  const response = await api.delete(
    `/api/lessons/${lessonDocumentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}
export interface InstructorQuiz {
  id: number;
  documentId: string;
  title: string;
  publishedAt?: string | null;
}

export async function getInstructorQuizzes(
  token: string,
  courseDocumentId: string,
): Promise<InstructorQuiz[]> {
  const response = await api.get<{
    data: InstructorQuiz[];
  }>(
    `/api/quizzes/content-manager/${courseDocumentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data.data;
}

export async function createQuiz(
  token: string,
  courseDocumentId: string,
  title: string,
) {
  const response = await api.post(
    "/api/quizzes",
    {
      data: {
        title,
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

export async function updateQuiz(
  token: string,
  quizDocumentId: string,
  title: string,
) {
  const response = await api.put(
    `/api/quizzes/${quizDocumentId}?status=draft`,
    {
      data: {
        title,
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

export async function deleteQuiz(
  token: string,
  quizDocumentId: string,
) {
  const response = await api.delete(
    `/api/quizzes/${quizDocumentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}
export interface InstructorQuestion {
  id: number;
  documentId: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export async function getQuizQuestions(
  token: string,
  quizDocumentId: string,
): Promise<InstructorQuestion[]> {
  const response = await api.get<{
    data: InstructorQuestion[];
  }>(
    `/api/questions/content-manager/${quizDocumentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data.data;
}

export async function createQuestion(
  token: string,
  quizDocumentId: string,
  question: string,
  options: string[],
  correctAnswer: string,
) {
  const response = await api.post(
    "/api/questions",
    {
      data: {
        question,
        options,
        correctAnswer,
        quiz: quizDocumentId,
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

export async function updateQuestion(
  token: string,
  questionDocumentId: string,
  question: string,
  options: string[],
  correctAnswer: string,
) {
  const response = await api.put(
    `/api/questions/${questionDocumentId}`,
    {
      data: {
        question,
        options,
        correctAnswer,
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

export async function deleteQuestion(
  token: string,
  questionDocumentId: string,
) {
  const response = await api.delete(
    `/api/questions/${questionDocumentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}

export async function publishCourse(token: string, courseDocumentId: string) {
  const response = await api.post(
    `/api/courses/${courseDocumentId}/publish`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
}

export async function unpublishCourse(token: string, courseDocumentId: string) {
  const response = await api.post(
    `/api/courses/${courseDocumentId}/unpublish`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
}

export async function publishLesson(token: string, lessonDocumentId: string) {
  const response = await api.post(
    `/api/lessons/${lessonDocumentId}/publish`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
}

export async function unpublishLesson(token: string, lessonDocumentId: string) {
  const response = await api.post(
    `/api/lessons/${lessonDocumentId}/unpublish`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
}

export async function publishQuiz(token: string, quizDocumentId: string) {
  const response = await api.post(
    `/api/quizzes/${quizDocumentId}/publish`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
}

export async function unpublishQuiz(token: string, quizDocumentId: string) {
  const response = await api.post(
    `/api/quizzes/${quizDocumentId}/unpublish`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
}