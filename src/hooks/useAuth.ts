import { useEffect, useState } from "react";
import { initialUsers } from "../data/initialUsers";
import { verifyPassword } from "../utils/auth";
import { recordAuditEvent } from "../utils/auditLog";
import { ALL_ROLES, canAssignRole, roleLabel } from "../utils/permissions";
import type { LoginCredentials, User, UserId, UserRole } from "../types/domain";

const ATTEMPTS_STORAGE_KEY = "bakery.loginAttempts";
const ROLES_STORAGE_KEY = "bakery.userRoles";
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
export type RoleChangeResult = { ok: true } | { ok: false; error: string };

type RoleOverrides = Record<UserId, UserRole>;

/** Saved role changes only ({ userId: role }) — password hashes never touch storage. */
function loadRoleOverrides(): RoleOverrides {
  try {
    const raw = localStorage.getItem(ROLES_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== "object") return {};
    const overrides: RoleOverrides = {};
    for (const [id, role] of Object.entries(parsed)) {
      if (ALL_ROLES.includes(role as UserRole)) overrides[id] = role as UserRole;
    }
    return overrides;
  } catch {
    return {};
  }
}

function loadUsers(): User[] {
  const overrides = loadRoleOverrides();
  return initialUsers.map((u) => (overrides[u.id] ? { ...u, role: overrides[u.id] } : u));
}

/**
 * Owns login/logout, per-email rate limiting and user role changes. There is
 * no persisted session — currentUser always starts null, so a page refresh
 * returns to the login page. The rate-limit record IS persisted
 * (localStorage), and exposed live via getLockedUntil so the UI reflects an
 * in-progress lockout immediately after a refresh, not just after the next
 * submit. Role changes are persisted the same way, as overrides on top of
 * the seed users.
 */
export function useAuth() {
  const [users, setUsers] = useState<User[]>(loadUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [attempts, setAttempts] = useState<AttemptsByEmail>(loadAttempts);

  useEffect(() => {
    try {
      localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attempts));
    } catch {
      // ignore storage errors (e.g. private browsing)
    }
  }, [attempts]);

  useEffect(() => {
    // Store only roles that differ from the seed, so seed changes still propagate.
    const overrides: RoleOverrides = {};
    for (const user of users) {
      const seed = initialUsers.find((u) => u.id === user.id);
      if (seed && seed.role !== user.role) overrides[user.id] = user.role;
    }
    try {
      localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(overrides));
    } catch {
      // ignore storage errors (e.g. private browsing)
    }
  }, [users]);

  /** Timestamp (ms) the given email is locked out until, or null if not locked. */
  const getLockedUntil = (email: string): number | null => {
    const key = email.trim().toLowerCase();
    return attempts[key]?.lockedUntil ?? null;
  };

  const login = async ({ email, password }: LoginCredentials): Promise<LoginResult> => {
    const key = email.trim().toLowerCase();
    const now = Date.now();
    const record = attempts[key];

    if (record?.lockedUntil && record.lockedUntil > now) {
      return { ok: false, error: "Too many failed attempts. Please wait for the lockout to expire." };
    }

    const user = users.find((u) => u.email.toLowerCase() === key && u.active);
    const valid = user ? await verifyPassword(password, user.passwordHash) : false;

    if (valid && user) {
      setAttempts((prev) => {
        const { [key]: _removed, ...rest } = prev;
        return rest;
      });
      setCurrentUser(user);
      recordAuditEvent({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "auth.login.success",
        details: `${user.email} logged in`,
      });
      return { ok: true };
    }

    const existingRecord = attempts[key];
    const lockoutExpired = !!existingRecord?.lockedUntil && existingRecord.lockedUntil <= now;
    const prevRecord =
      existingRecord && !lockoutExpired ? existingRecord : { failedAttempts: 0, lockedUntil: null };
    const failedAttempts = prevRecord.failedAttempts + 1;
    const lockedUntil = failedAttempts >= MAX_ATTEMPTS ? now + LOCKOUT_MS : null;
    setAttempts((prev) => ({ ...prev, [key]: { failedAttempts, lockedUntil } }));

    recordAuditEvent({
      userId: null,
      userName: email.trim(),
      userRole: null,
      action: lockedUntil ? "auth.login.lockout" : "auth.login.failure",
      details: lockedUntil
        ? `Locked out for 60s after ${failedAttempts} failed attempts`
        : `Failed login attempt (${failedAttempts}/${MAX_ATTEMPTS})`,
    });

    return { ok: false, error: "Invalid email or password." };
  };

  const logout = () => {
    if (currentUser) {
      recordAuditEvent({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: "auth.logout",
        details: `${currentUser.email} logged out`,
      });
    }
    setCurrentUser(null);
  };

  /** Changes a user's role on behalf of the signed-in user, enforcing who may assign what. */
  const updateUserRole = (userId: UserId, newRole: UserRole): RoleChangeResult => {
    if (!currentUser) return { ok: false, error: "You must be signed in." };
    const target = users.find((u) => u.id === userId);
    if (!target) return { ok: false, error: "User not found." };
    if (target.role === newRole) return { ok: true };

    if (!canAssignRole(currentUser.role, target.role, newRole)) {
      return { ok: false, error: "You don't have permission to make this role change." };
    }
    const activeSuperAdmins = users.filter((u) => u.active && u.role === "super_admin");
    if (target.role === "super_admin" && activeSuperAdmins.length <= 1) {
      return { ok: false, error: "There must be at least one Super Admin." };
    }

    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    // Keep the signed-in session in step so permissions update immediately.
    if (currentUser.id === userId) setCurrentUser({ ...currentUser, role: newRole });

    recordAuditEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: "user.role_changed",
      entityType: "User",
      entityId: userId,
      details: `Changed ${target.name}'s role from ${roleLabel(target.role)} to ${roleLabel(newRole)}`,
    });
    return { ok: true };
  };

  return { users, currentUser, login, logout, getLockedUntil, updateUserRole };
}
