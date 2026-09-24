import { useState } from "react";
import { ALL_ROLES, ROLE_LABELS, canAssignRole } from "../../utils/permissions";
import type { RoleChangeResult } from "../../hooks/useAuth";
import type { User, UserId, UserRole } from "../../types/domain";

interface UserManagementViewProps {
  users: User[];
  currentUser: User;
  onChangeRole: (userId: UserId, newRole: UserRole) => RoleChangeResult;
}

interface Feedback {
  type: "success" | "error";
  message: string;
}

export default function UserManagementView({
  users,
  currentUser,
  onChangeRole,
}: UserManagementViewProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const activeUsers = users.filter((u) => u.active);

  const handleChange = (user: User, newRole: UserRole) => {
    const result = onChangeRole(user.id, newRole);
    setFeedback(
      result.ok
        ? { type: "success", message: `${user.name} is now ${ROLE_LABELS[newRole]}.` }
        : { type: "error", message: result.error }
    );
  };

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-10 w-full">
      <header className="mb-6 md:mb-8">
        <h2 className="text-3xl font-bold text-[#121212]">Roles</h2>
        <p className="text-gray-500 mt-1">
          Assign roles to active users. A role controls which views a user can open.
        </p>
      </header>

      {feedback && (
        <div
          role={feedback.type === "error" ? "alert" : "status"}
          className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium border ${
            feedback.type === "error"
              ? "bg-red-50 text-red-600 border-red-200"
              : "bg-green-50 text-green-700 border-green-200"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <p className="text-sm text-gray-500 mb-3">
        {activeUsers.length} active {activeUsers.length === 1 ? "user" : "users"}
      </p>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-semibold text-gray-700 bg-gray-50/50 uppercase tracking-wider">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {activeUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No active users.
                  </td>
                </tr>
              ) : (
                activeUsers.map((user) => {
                  const options = ALL_ROLES.map((role) => ({
                    role,
                    allowed:
                      role === user.role || canAssignRole(currentUser.role, user.role, role),
                  }));
                  const locked = options.every((o) => o.role === user.role || !o.allowed);

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{user.name}</span>
                        {user.id === currentUser.id && (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-[#562D07]">
                            You
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          disabled={locked}
                          onChange={(e) => handleChange(user, e.target.value as UserRole)}
                          aria-label={`Role for ${user.name}`}
                          title={
                            locked
                              ? "Only a Super Admin can change this user's role"
                              : undefined
                          }
                          className="px-3 py-1.5 border border-gray-200 rounded-md bg-white text-sm text-gray-800 focus:ring-1 focus:ring-[#F17D0C] focus:border-[#F17D0C] outline-none disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {options.map(({ role, allowed }) => (
                            <option key={role} value={role} disabled={!allowed}>
                              {ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
