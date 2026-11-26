import React, { useId, useState } from "react";
import ClientFormModal from "./ClientFormModal";
import SearchField from "../common/SearchField";
import Table, { TableHead } from "../common/Table";
import EmptyState from "../common/EmptyState";
import Button from "../common/Button";
import type { Client, ClientFormData, ClientId, Order } from "../../types/domain";

interface ClientsListProps {
  clients: Client[];
  orders: Order[];
  onAdd: (data: ClientFormData) => void;
  onUpdate: (id: ClientId, data: Partial<ClientFormData>) => void;
  onView: (client: Client) => void;
}

export default function ClientsList({ clients, orders, onAdd, onUpdate, onView }: ClientsListProps) {
  const headingId = useId();
  const [search, setSearch] = useState("");
  const [modalState, setModalState] = useState<{ isOpen: boolean; editing: Client | null }>({
    isOpen: false,
    editing: null,
  });

  const filtered = clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const orderCount = (clientId: ClientId) => orders.filter((o) => o.clientId === clientId).length;

  const handleSave = (data: ClientFormData) => {
    if (modalState.editing) onUpdate(modalState.editing.id, data);
    else onAdd(data);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-10 w-full">
      {modalState.isOpen && (
        <ClientFormModal
          initial={modalState.editing}
          onClose={() => setModalState({ isOpen: false, editing: null })}
          onSave={handleSave}
        />
      )}

      <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 id={headingId} className="text-3xl font-bold text-ink">Clients</h2>
          <p className="text-gray-500 mt-1">Client records and standing order preferences.</p>
        </div>
        <Button onClick={() => setModalState({ isOpen: true, editing: null })}>
          + Add Client
        </Button>
      </header>

      <div className="bg-white border border-gray-200 rounded-lg p-2 mb-4 shadow-sm flex">
        <SearchField
          value={search}
          onChange={setSearch}
          ariaLabel="Search clients by name"
          placeholder="Search clients..."
        />
      </div>

      <Table label="Clients list" labelledBy={headingId} minWidth="min-w-[720px]">
        <TableHead>
          <th scope="col" className="px-6 py-4">Client</th>
          <th scope="col" className="px-6 py-4">Contact</th>
          <th scope="col" className="px-6 py-4">Standing Order</th>
          <th scope="col" className="px-6 py-4 text-right">Orders</th>
          <th scope="col" className="px-4 py-4 text-center">Action</th>
        </TableHead>
        <tbody className="divide-y divide-gray-200 text-sm">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <EmptyState
                  title={search ? "No clients match your search." : "No clients yet."}
                  hint={search ? undefined : "Add a client to keep their orders and standing preferences together."}
                  action={
                    search ? (
                      <Button size="sm" variant="ghostBrand" onClick={() => setSearch("")}>
                        Clear search
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => setModalState({ isOpen: true, editing: null })}>
                        + Add Client
                      </Button>
                    )
                  }
                />
              </td>
            </tr>
          ) : (
            filtered.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                <th scope="row" className="px-6 py-4 text-left font-medium text-gray-900">{client.name}</th>
                <td className="px-6 py-4 text-gray-600">
                  <div>{client.contact || "—"}</div>
                  {client.email && <div className="text-xs text-gray-500">{client.email}</div>}
                </td>
                <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{client.standingOrder || "—"}</td>
                <td className="px-6 py-4 text-right text-gray-600 tabular-nums">{orderCount(client.id)}</td>
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setModalState({ isOpen: true, editing: client })}
                    aria-label={`Edit ${client.name}`}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghostBrand"
                    onClick={() => onView(client)}
                    aria-label={`View ${client.name}`}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
