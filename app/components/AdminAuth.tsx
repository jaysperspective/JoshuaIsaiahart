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
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-white font-body">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center p-8">
        <div className="flex flex-col gap-4 w-full max-w-md">
          {/* Back button */}
          <Link
            href="/"
            className="text-white font-body text-sm flex items-center gap-2 hover:text-gray-300 transition-colors mb-2 self-start"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Link>

          {/* Login Card */}
          <div className="card card-white p-10">
            <h1 className="font-heading text-2xl font-bold mb-2">Admin Login</h1>
            <p className="font-body text-[#6b6b6b] mb-8">
              Enter your password to access the dashboard
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 font-body focus:outline-none focus:border-gray-400 transition-colors"
              />
              {error && (
                <p className="text-red-500 text-sm mb-4 font-body">{error}</p>
              )}
              <button
                type="submit"
                className="w-full bg-[#1a1a1a] text-white py-3 rounded-xl font-body hover:bg-[#333] transition-colors"
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
    <div className="min-h-screen bg-[#181818]">
      <div className="bg-[#1a1a1a] border-b border-gray-800 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-gray-400 hover:text-white font-body text-sm flex items-center gap-2 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Home
          </Link>
          <span className="text-gray-600">|</span>
          <h1 className="text-white font-heading text-xl font-bold">Admin Dashboard</h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white font-body text-sm transition-colors"
        >
          Logout
        </button>
      </div>
      {children}
    </div>
  );
}
