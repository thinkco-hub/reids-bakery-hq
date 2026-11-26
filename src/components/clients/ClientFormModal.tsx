import React, { useId, useState } from "react";
import type { FormEvent } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { toContactDigits } from "../../utils/orders";
import type { Client, ClientFormData } from "../../types/domain";

interface ClientFormModalProps {
  initial: Client | null;
  onClose: () => void;
  onSave: (data: ClientFormData) => void;
}

export default function ClientFormModal({ initial, onClose, onSave }: ClientFormModalProps) {
  const [form, setForm] = useState<ClientFormData>(
    initial || { name: "", contact: "", email: "", address: "", standingOrder: "" }
  );
  const headingId = useId();
  const nameFieldId = useId();
  const contactFieldId = useId();
  const emailFieldId = useId();
  const addressFieldId = useId();
  const standingOrderFieldId = useId();

  const update = (field: keyof ClientFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    onSave(form);
    onClose();
  };

  return (
    <Modal
      labelledBy={headingId}
      onClose={onClose}
      overlayClassName="z-[100] bg-black/50 backdrop-blur-sm p-4"
      className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md max-h-[85dvh] overflow-y-auto overscroll-contain animate-fadeIn"
    >
      <form onSubmit={handleSubmit}>
        <h2 id={headingId} className="text-2xl font-bold text-ink mb-6">
          {initial ? "Edit Client" : "Add Client"}
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor={nameFieldId} className="block text-sm font-semibold text-gray-700 mb-1">Client / Business Name</label>
            <input
              id={nameFieldId}
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-strong focus:border-brand-strong outline-none text-gray-800"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={contactFieldId} className="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label>
              <input
                id={contactFieldId}
                type="tel"
                inputMode="numeric"
                placeholder="09XXXXXXXXX"
                value={form.contact}
                onChange={(e) => update("contact", toContactDigits(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-strong focus:border-brand-strong outline-none text-gray-800"
              />
            </div>
            <div>
              <label htmlFor={emailFieldId} className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                id={emailFieldId}
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-strong focus:border-brand-strong outline-none text-gray-800"
              />
            </div>
          </div>
          <div>
            <label htmlFor={addressFieldId} className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
            <input
              id={addressFieldId}
              type="text"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-strong focus:border-brand-strong outline-none text-gray-800"
            />
          </div>
          <div>
            <label htmlFor={standingOrderFieldId} className="block text-sm font-semibold text-gray-700 mb-1">
              Standing Order Preferences
            </label>
            <textarea
              id={standingOrderFieldId}
              value={form.standingOrder}
              onChange={(e) => update("standingOrder", e.target.value)}
              rows={3}
              placeholder="e.g. 20 Butter Croissants every Monday"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-strong focus:border-brand-strong outline-none text-gray-800"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="lg" className="flex-1">
            Save Client
          </Button>
        </div>
      </form>
    </Modal>
  );
}
