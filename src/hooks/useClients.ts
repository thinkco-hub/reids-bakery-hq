import { useState } from "react";
import { initialClients } from "../data/initialClients";
import { recordAuditEvent } from "../utils/auditLog";
import { canAccessTab } from "../utils/permissions";
import type { Client, ClientFormData, ClientId, User } from "../types/domain";

interface UseClientsOptions {
  currentUser: User | null;
  /** Seeded clients; a test fixture replaces the value from src/data. */
  clients?: Client[];
}

/**
 * Owns the clients feature: the client list. Which client is on screen is the
 * router's `/clients/:clientId` route, not state held here.
 */
export function useClients({ currentUser, clients: seededClients }: UseClientsOptions) {
  const [clients, setClients] = useState<Client[]>(seededClients ?? initialClients);

  const logClientEvent = (
    action: "client.created" | "client.updated",
    clientId: ClientId,
    details: string
  ) => {
    if (!currentUser) return;
    recordAuditEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType: "Client",
      entityId: clientId,
      details,
    });
  };

  const addClient = (data: ClientFormData) => {
    // Re-checked here, not only at the overlay that offers it, the way useAuth
    // re-checks canAssignRole: a hidden picker is presentation, and the client
    // collection is the thing being written.
    if (!currentUser || !canAccessTab(currentUser.role, "clients")) return;
    const id: ClientId = `CL-${String(clients.length + 1).padStart(3, "0")}`;
    setClients((prev) => [...prev, { id, ...data }]);
    logClientEvent("client.created", id, `Added client ${id} (${data.name})`);
  };

  const updateClient = (id: ClientId, data: Partial<ClientFormData>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    logClientEvent("client.updated", id, `Updated client ${id}`);
  };

  return {
    clients,
    addClient,
    updateClient,
  };
}