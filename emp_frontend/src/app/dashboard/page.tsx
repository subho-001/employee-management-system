"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useGetCurrentUserQuery,
  useLogoutMutation,
} from "@/features/auth/auth.api";

export default function DashboardPage() {
  const router = useRouter();

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useGetCurrentUserQuery();

  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const apiError = error as {
    status?: number | string;
    data?: { message?: string };
  } | undefined;

  useEffect(() => {
    if (apiError?.status === 401) {
      router.replace("/");
    }
  }, [apiError?.status, router]);

  async function handleLogout() {
    try {
      await logout().unwrap();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      router.replace("/");
    }
  }

  if (isLoading) {
    return <main className="p-8">Checking your session...</main>;
  }

  if (isError || !user) {
    if (apiError?.status === 401) {
      return <main className="p-8">Redirecting to login...</main>;
    }

    return (
      <main className="p-8">
        <p>
          {apiError?.data?.message ??
            "Unable to load your account. Please try logging in again."}
        </p>

        <button
          onClick={() => router.replace("/")}
          className="mt-4 rounded bg-black px-4 py-2 text-white"
        >
          Back to login
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Employee Management System
            </h1>

            <p className="mt-2 text-gray-600">
              Welcome, {user.name}
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </header>

        <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Dashboard
          </h2>

          <div className="mt-4 space-y-2 text-gray-700">
            <p>
              <span className="font-medium">Name:</span> {user.name}
            </p>

            <p>
              <span className="font-medium">Email:</span> {user.email}
            </p>

            <p>
              <span className="font-medium">Role:</span> {user.role}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}