import { useEffect, useState } from "react";
import { initialUsers } from "../data/initialUsers";
import { verifyPassword } from "../utils/auth";
import type { LoginCredentials, User } from "../types/domain";

const ATTEMPTS_STORAGE_KEY = "bakery.loginAttempts";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;

interface AttemptRecord {
  failedAttempts: number;
  lockedUntil: number | null;
}

type AttemptsByEmail = Record<string, AttemptRecord>;

function loadAttempts(): AttemptsByEmail {
  try {
    const raw = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export type LoginResult = { ok: true } | { ok: false; error: string };

/**
 * Owns login/logout and per-email rate limiting. There is no persisted
 * session — currentUser always starts null, so a page refresh returns to
 * the login page. The rate-limit record is persisted so a refresh can't be
 * used to reset a lockout.
 */
export function useAuth() {
  const [users] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [attempts, setAttempts] = useState<AttemptsByEmail>(loadAttempts);

  useEffect(() => {
    try {
      localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attempts));
    } catch {
      // ignore storage errors (e.g. private browsing)
    }
  }, [attempts]);

  const login = async ({ email, password }: LoginCredentials): Promise<LoginResult> => {
    const key = email.trim().toLowerCase();
    const now = Date.now();
    const record = attempts[key];

    if (record?.lockedUntil && record.lockedUntil > now) {
      const secondsLeft = Math.ceil((record.lockedUntil - now) / 1000);
      return { ok: false, error: `Too many failed attempts. Try again in ${secondsLeft}s.` };
    }

    const user = users.find((u) => u.email.toLowerCase() === key && u.active);
    const valid = user ? await verifyPassword(password, user.passwordHash) : false;

    if (valid && user) {
      setAttempts((prev) => {
        const { [key]: _removed, ...rest } = prev;
        return rest;
      });
      setCurrentUser(user);
      return { ok: true };
    }

    setAttempts((prev) => {
      const prevRecord = prev[key] ?? { failedAttempts: 0, lockedUntil: null };
      const failedAttempts = prevRecord.failedAttempts + 1;
      const lockedUntil = failedAttempts >= MAX_ATTEMPTS ? now + LOCKOUT_MS : null;
      return { ...prev, [key]: { failedAttempts, lockedUntil } };
    });
    return { ok: false, error: "Invalid email or password." };
  };

  const logout = () => setCurrentUser(null);

  return { currentUser, login, logout };
}
