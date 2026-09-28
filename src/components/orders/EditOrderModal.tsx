import React, { useState } from "react";
import EditHistoryList from "../common/EditHistoryList";
import type { FormEvent } from "react";
import { isValidCustomerContact, toContactDigits } from "../../utils/orders";
import type { Client, EditOrderInput, MenuItemStock, Order, OrderItem } from "../../types/domain";

interface Line {
  menuItemId: string;
  name: string;
  qty: string;
  unitPrice: number;
}

const lineName = (line: OrderItem | Line, menuInventory: MenuItemStock[]) =>
  menuInventory.find((m) => m.id === line.menuItemId)?.name || line.name || line.menuItemId;

interface EditOrderModalProps {
  order: Order;
  client: Client | undefined;
  menuInventory: MenuItemStock[];
  onClose: () => void;
  onSave: (input: EditOrderInput) => void;
}

export default function EditOrderModal({ order, client, menuInventory, onClose, onSave }: EditOrderModalProps) {
  const isClientOrder = order.clientId !== null;
  const [customerName, setCustomerName] = useState(order.customerName || "");
  const [customerContact, setCustomerContact] = useState(order.customerContact || "");
  const [lines, setLines] = useState<Line[]>(
    order.items.map((item) => ({
      menuItemId: item.menuItemId,
      name: item.name || "",
      qty: String(item.qty),
      unitPrice: item.unitPrice,
    }))
  );

  const updateLine = (idx: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((line, i) => (i === idx ? { ...line, ...patch } : line)));
  const changeItem = (idx: number, menuItemId: string) => {
    const menuItem = menuInventory.find((m) => m.id === menuItemId);
    updateLine(idx, {
      menuItemId,
      name: menuItem?.name || "",
      unitPrice: menuItem ? menuItem.price : 0,
    });
  };
  const addLine = () => setLines((prev) => [...prev, { menuItemId: "", name: "", qty: "", unitPrice: 0 }]);
  const removeLine = (idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const cleanLines = lines.filter((l) => l.menuItemId && (parseFloat(l.qty) || 0) >= 1);
  const contactOk = isClientOrder || isValidCustomerContact(customerContact);
  const canSave =
    contactOk && cleanLines.length > 0 && (isClientOrder || customerName.trim().length > 0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    const items: OrderItem[] = cleanLines.map((l) => ({
      menuItemId: l.menuItemId,
      name: lineName(l, menuInventory),
      qty: parseFloat(l.qty) || 0,
      unitPrice: l.unitPrice,
    }));
    onSave({
      customerName,
      customerContact,
      items,
      describeItem: (line) => `${line.qty} × ${lineName(line, menuInventory)}`,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-lg animate-fadeIn max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-[#121212] mb-6">Edit Order {order.id}</h2>

        <div className="space-y-4">
          {isClientOrder && (
            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              This order is linked to a client. Customer details are managed in the Clients record; only items can be edited here.
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={isClientOrder ? client?.name || "—" : customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={isClientOrder}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F17D0C] focus:border-[#F17D0C] outline-none text-gray-800 disabled:bg-gray-100 disabled:text-gray-500"
                required={!isClientOrder}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label>
              <input
                type="tel"
                value={isClientOrder ? client?.contact || "—" : customerContact}
                onChange={(e) => setCustomerContact(toContactDigits(e.target.value))}
                disabled={isClientOrder}
                placeholder="11-digit mobile number"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F17D0C] focus:border-[#F17D0C] outline-none text-gray-800 disabled:bg-gray-100 disabled:text-gray-500"
              />
              {!isClientOrder && customerContact.length > 0 && !contactOk && (
                <p className="text-xs text-gray-400 mt-1">Enter the full 11-digit number.</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">Items</label>
              <button
                type="button"
                onClick={addLine}
                className="text-sm font-bold text-[#F17D0C] hover:underline"
              >
                + Add Item
              </button>
            </div>
            <div className="space-y-2">
              {lines.map((line, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={line.menuItemId}
                    onChange={(e) => changeItem(idx, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F17D0C] focus:border-[#F17D0C] outline-none text-gray-800 text-sm"
                  >
                    <option value="">Select item...</option>
                    {!menuInventory.some((m) => m.id === line.menuItemId) && line.menuItemId && (
                      <option value={line.menuItemId}>{line.name || line.menuItemId}</option>
                    )}
                    {menuInventory.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (₱{m.price})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={line.qty}
                    onChange={(e) => updateLine(idx, { qty: e.target.value })}
                    className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F17D0C] focus:border-[#F17D0C] outline-none text-gray-800 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    className="text-gray-400 hover:text-red-500 p-1.5 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {order.editHistory && order.editHistory.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Edit History</label>
              <EditHistoryList entries={order.editHistory} />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="flex-1 py-3 rounded-xl text-white font-bold bg-[#562D07] hover:bg-[#3a1d04] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
