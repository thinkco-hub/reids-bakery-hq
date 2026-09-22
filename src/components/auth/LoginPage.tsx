import React, { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { LoginCredentials } from "../../types/domain";
import type { LoginResult } from "../../hooks/useAuth";

interface LoginPageProps {
  onLogin: (credentials: LoginCredentials) => Promise<LoginResult>;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lockedForSeconds, setLockedForSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (lockedForSeconds === null || lockedForSeconds <= 0) return;
    const timer = setTimeout(() => {
      setLockedForSeconds((s) => (s !== null ? s - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [lockedForSeconds]);

  const isLocked = lockedForSeconds !== null && lockedForSeconds > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await onLogin({ email, password });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      setLockedForSeconds(result.lockedForSeconds ?? null);
    } else {
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#FDF9F3] px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm animate-fadeIn"
      >
        <h1 className="text-2xl font-bold text-[#121212] mb-1">Bakery Command Center</h1>
        <p className="text-gray-500 text-sm mb-6">Sign in to continue</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F17D0C] focus:border-[#F17D0C] outline-none text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
              autoComplete="username"
              disabled={isLocked}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F17D0C] focus:border-[#F17D0C] outline-none text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
              autoComplete="current-password"
              disabled={isLocked}
              required
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm font-semibold text-red-600">
            {isLocked
              ? `Too many failed attempts. Try again in ${lockedForSeconds}s.`
              : error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || isLocked}
          className="w-full mt-6 py-3 rounded-xl text-white font-bold bg-[#562D07] hover:bg-[#3a1d04] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLocked ? "Locked" : submitting ? "Signing in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}
