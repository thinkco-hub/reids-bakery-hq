import { useState } from "react";
import { initialClients } from "../data/initialClients";
import { recordAuditEvent } from "../utils/auditLog";
import type { Client, ClientFormData, ClientId, User } from "../types/domain";

interface UseClientsOptions {
  currentUser: User | null;
}

/**
 * Owns the clients feature: the client list and the client detail panel
 * (viewingClient).
 */
export function useClients({ currentUser }: UseClientsOptions) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

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
    const id: ClientId = `CL-${String(clients.length + 1).padStart(3, "0")}`;
    setClients((prev) => [...prev, { id, ...data }]);
    logClientEvent("client.created", id, `Added client ${id} (${data.name})`);
  };

  const updateClient = (id: ClientId, data: Partial<ClientFormData>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    setViewingClient((prev) => (prev && prev.id === id ? { ...prev, ...data } : prev));
    logClientEvent("client.updated", id, `Updated client ${id}`);
  };

  const clearViewingClient = () => setViewingClient(null);

  return {
    clients,
    viewingClient,
    setViewingClient,
    addClient,
    updateClient,
    clearViewingClient,
  };
}