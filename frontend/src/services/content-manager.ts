import { api } from "@/lib/api";

export interface ContentManagerCourse {
  id: number;
  documentId: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  publishedAt?: string | null;
}

export interface ContentManagerLesson {
  id: number;
  documentId: string;
  title: string;
  content: unknown;
  videoUrl?: string | null;
  order: number;
  publishedAt?: string | null;
}

export interface ContentManagerQuiz {
  id: number;
  documentId: string;
  title: string;
  publishedAt?: string | null;
}

export interface ContentManagerQuestion {
  id: number;
  documentId: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export async function getContentManagerCourses(
  token: string,
): Promise<ContentManagerCourse[]> {
  const response = await api.get<{
    data: ContentManagerCourse[];
  }>("/api/courses/content-manager-courses", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}

export async function getContentManagerLessons(
  token: string,
  courseDocumentId: string,
): Promise<ContentManagerLesson[]> {
  const response = await api.get<{
    data: ContentManagerLesson[];
  }>(
    `/api/lessons/content-manager/${courseDocumentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data.data;
}

export async function getContentManagerLesson(
  token: string,
  lessonDocumentId: string,
): Promise<ContentManagerLesson> {
  const response = await api.get<{
    data: ContentManagerLesson;
  }>(`/api/lessons/${lessonDocumentId}?status=draft`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}

export async function createContentManagerLesson(
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

export async function updateContentManagerLesson(
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

export async function deleteContentManagerLesson(
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

export async function getContentManagerQuizzes(
  token: string,
  courseDocumentId: string,
): Promise<ContentManagerQuiz[]> {
  const response = await api.get<{
    data: ContentManagerQuiz[];
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

export async function createContentManagerQuiz(
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

export async function updateContentManagerQuiz(
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

export async function deleteContentManagerQuiz(
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

export async function getContentManagerQuestions(
  token: string,
  quizDocumentId: string,
): Promise<ContentManagerQuestion[]> {
  const response = await api.get<{
    data: ContentManagerQuestion[];
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

export async function createContentManagerQuestion(
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

export async function updateContentManagerQuestion(
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

export async function deleteContentManagerQuestion(
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

export async function publishContentManagerCourse(token: string, courseDocumentId: string) {
  const response = await api.post(
    `/api/courses/${courseDocumentId}/publish`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
}

export async function unpublishContentManagerCourse(token: string, courseDocumentId: string) {
  const response = await api.post(
    `/api/courses/${courseDocumentId}/unpublish`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
}

export async function publishContentManagerLesson(token: string, lessonDocumentId: string) {
  const response = await api.post(
    `/api/lessons/${lessonDocumentId}/publish`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
}

export async function unpublishContentManagerLesson(token: string, lessonDocumentId: string) {
  const response = await api.post(
    `/api/lessons/${lessonDocumentId}/unpublish`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
}

export async function publishContentManagerQuiz(token: string, quizDocumentId: string) {
  const response = await api.post(
    `/api/quizzes/${quizDocumentId}/publish`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
}

export async function unpublishContentManagerQuiz(token: string, quizDocumentId: string) {
  const response = await api.post(
    `/api/quizzes/${quizDocumentId}/unpublish`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
}