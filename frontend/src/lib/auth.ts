export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("jwt");
}

export function logout() {
  localStorage.removeItem("jwt");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
}
