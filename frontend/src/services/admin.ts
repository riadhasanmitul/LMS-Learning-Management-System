import { api } from "@/lib/api";

export interface AdminStats {
  users: number;
  usersByRole?: {
    Student: number;
    Instructor: number;
    "Content Manager": number;
    Admin: number;
  };
  courses: number;
  lessons: number;
  enrollments: number;
  quizzes: number;
  quizAttempts: number;
}

export interface AdminUser {
  id: number;
  documentId: string;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  role: {
    id: number;
    name: string;
    type: string;
  } | null;
}

export async function getAdminStats(
  token: string,
): Promise<AdminStats> {
  const response = await api.get<{
    data: AdminStats;
  }>("/api/admin-dashboard/stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}

export async function getAdminUsers(
  token: string,
): Promise<AdminUser[]> {
  const response = await api.get<{
    data: AdminUser[];
  }>("/api/admin-dashboard/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}

export async function createAdminUser(
  token: string,
  data: {
    username: string;
    email: string;
    password?: string;
    role?: string;
  },
): Promise<AdminUser> {
  const response = await api.post<{
    data: AdminUser;
  }>("/api/admin-dashboard/users", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}

export async function assignUserRole(
  token: string,
  userDocumentId: string,
  role: string,
) {
  const response = await api.put(
    `/api/admin-dashboard/users/${userDocumentId}/role`,
    {
      role,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}

export async function blockUser(
  token: string,
  userDocumentId: string,
) {
  const response = await api.put(
    `/api/admin-dashboard/users/${userDocumentId}/block`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}

export async function unblockUser(
  token: string,
  userDocumentId: string,
) {
  const response = await api.put(
    `/api/admin-dashboard/users/${userDocumentId}/unblock`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}
