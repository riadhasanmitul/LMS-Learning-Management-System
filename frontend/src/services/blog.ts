import { api, publicApi } from "@/lib/api";

export interface BlogAuthor {
  id: number;
  documentId: string;
  name: string;
}

export interface BlogPost {
  id: number;
  documentId: string;
  title: string;
  body: unknown;
  coverImage?: string | null;
  publicationStatus: "draft" | "published";
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  author?: BlogAuthor | null;
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const response = await publicApi.get<{
    data: BlogPost[];
  }>("/api/blog-posts/published");

  return response.data.data;
}

export async function getPublishedPost(
  documentId: string,
): Promise<BlogPost> {
  const response = await publicApi.get<{
    data: BlogPost;
  }>(`/api/blog-posts/published/${documentId}`);

  return response.data.data;
}

export async function getManagedBlogPosts(
  token: string,
): Promise<BlogPost[]> {
  const response = await api.get<{
    data: BlogPost[];
  }>("/api/blog-posts", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}

export async function createBlogPost(
  token: string,
  data: {
    title: string;
    body: unknown;
    coverImage?: string;
    publicationStatus: "draft" | "published";
  },
) {
  const response = await api.post(
    "/api/blog-posts",
    {
      data,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}

export async function updateBlogPost(
  token: string,
  documentId: string,
  data: {
    title?: string;
    body?: unknown;
    coverImage?: string;
    publicationStatus: "draft" | "published";
  },
) {
  const response = await api.put(
    `/api/blog-posts/${documentId}`,
    {
      data,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}

export async function deleteBlogPost(
  token: string,
  documentId: string,
) {
  const response = await api.delete(
    `/api/blog-posts/${documentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}
