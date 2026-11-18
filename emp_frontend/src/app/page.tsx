
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/features/auth/auth.api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Hooks must be called at the top level of the component.
  const [login, { isLoading }] = useLoginMutation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await login({
        email: email.trim(),
        password,
      }).unwrap();

      router.push("/dashboard");
    } catch (err) {
      // RTK Query errors are not instances of your custom ApiError.
      const apiError = err as {
        status?: number | string;
        data?: { message?: string };
      };

      if (apiError.status === 401) {
        setError("Invalid email or password.");
      } else if (apiError.data?.message) {
        setError(apiError.data.message);
      } else {
        setError(
          "Unable to connect to the server. Check that the backend is running.",
        );
      }
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold tracking-widest text-cyan-400">
            EMPLOYEE MANAGEMENT
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Sign in to access your workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-rose-900 bg-rose-950/50 px-4 py-3 text-sm text-rose-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          Authorized users only. Access depends on your assigned role.
        </p>
      </section>
    </main>
  );
}
