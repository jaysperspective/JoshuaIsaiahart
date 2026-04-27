"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";

interface AdminAuthProps {
  children: ReactNode;
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = sessionStorage.getItem("adminAuth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        sessionStorage.setItem("adminAuth", "true");
        setIsAuthenticated(true);
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Authentication failed");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
    setPassword("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-[var(--text-muted)] font-body">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
        <div className="flex flex-col gap-4 w-full max-w-md">
          <Link
            href="/"
            className="text-[var(--text-muted)] font-body text-sm flex items-center gap-2 hover:text-[var(--foreground)] transition-colors self-start no-underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>

          <div
            className="neu-card p-8"
            style={{ borderLeftWidth: "4px", borderLeftColor: "var(--accent-external)" }}
          >
            <span
              className="inline-block font-medium px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide font-body mb-3"
              style={{ color: "var(--accent-external)", border: "1px solid var(--accent-external)" }}
            >
              Admin
            </span>
            <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)] mb-2">
              Sign in
            </h1>
            <p className="font-body text-sm text-[var(--text-muted)] mb-6">
              Enter your password to access the dashboard
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="neu-input w-full px-3 py-2.5 mb-4 text-sm focus:border-[var(--accent-external)]"
              />
              {error && (
                <p className="font-body text-sm mb-4" style={{ color: "var(--accent-videography)" }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="neu-button w-full py-2.5 font-body text-sm font-medium text-[var(--foreground)]"
                style={{ borderLeftWidth: "3px", borderLeftColor: "var(--accent-external)" }}
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="bg-[var(--card-bg)] border-b-2 border-[var(--border-color)] px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-[var(--text-muted)] hover:text-[var(--foreground)] font-body text-sm flex items-center gap-2 transition-colors no-underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </Link>
          <span className="text-[var(--text-faint)]">·</span>
          <h1 className="text-[var(--foreground)] font-heading text-base font-semibold">
            Admin Dashboard
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-[var(--text-muted)] hover:text-[var(--foreground)] font-body text-sm transition-colors"
        >
          Logout
        </button>
      </div>
      {children}
    </div>
  );
}
