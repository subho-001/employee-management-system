
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type ApiErrorBody = {
  success?: boolean;
  message?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`,
    {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      cache: "no-store",
    },
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const errorBody = data as ApiErrorBody | null;
    throw new ApiError(
      errorBody?.message ?? "Something went wrong",
      response.status,
    );
  }

  return data as T;
}
