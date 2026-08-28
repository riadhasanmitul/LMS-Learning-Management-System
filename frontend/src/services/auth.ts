import axios from "axios";
import { api, publicApi } from "@/lib/api";

export interface LoginResponse {
  jwt: string;
  user: {
    id: number;
    documentId: string;
    username: string;
    email: string;
    provider?: string;
    confirmed?: boolean;
    blocked?: boolean;
  };
}

export interface MeResponse {
  id: number;
  documentId: string;
  username: string;
  email: string;
  role?: {
    name: string;
    type: string;
  };
}

interface StrapiErrorResponse {
  error?: {
    message?: string;
  };
}

export async function login(
  identifier: string,
  password: string,
): Promise<LoginResponse> {
  const response = await publicApi.post<LoginResponse>(
    "/api/auth/local",
    {
      identifier: identifier.trim(),
      password,
    },
  );

  if (response.data.user?.blocked) {
    throw new Error("Your account has been blocked by an administrator.");
  }

  return response.data;
}

export async function getCurrentUser(
  token: string,
): Promise<MeResponse> {
  const response = await api.get<{
    data: MeResponse;
  }>("/api/current-user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}