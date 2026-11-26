import React, { useId } from "react";
import type { FormEvent } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import SelectField from "../common/SelectField";
import type { RestockModalState, StockItem } from "../../types/domain";

interface RestockModalProps {
  modal: RestockModalState;
  items: StockItem[];
  onItemChange: (itemId: string) => void;
  onAmountChange: (amount: string) => void;
  onQuickAdd: (delta: number) => void;
  onClose: () => void;
  onConfirm: () => void;
  disabled: boolean;
}

export default function RestockModal({
  modal,
  items,
  onItemChange,
  onAmountChange,
  onQuickAdd,
  onClose,
  onConfirm,
  disabled,
}: RestockModalProps) {
  const headingId = useId();
  const itemFieldId = useId();
  const amountFieldId = useId();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabled) return;
    onConfirm();
  };

  return (
    <Modal
      labelledBy={headingId}
      onClose={onClose}
      className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-sm max-h-[90dvh] overflow-y-auto overscroll-contain animate-fadeIn"
    >
      <form onSubmit={handleSubmit}>
        <h2 id={headingId} className="text-2xl font-bold text-ink mb-1">
          Restock{" "}
          {modal.category === "menu" ? "Menu Item" : "Ingredient"}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Select an item and add the received stock amount.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor={itemFieldId} className="block text-sm font-semibold text-gray-700 mb-1">
              Item to Restock
            </label>
            <SelectField
              id={itemFieldId}
              className="w-full pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-strong focus:border-brand-strong outline-none text-gray-800"
              value={modal.selectedItemId}
              onChange={(e) => onItemChange(e.target.value)}
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} (Current: {item.qty})
                </option>
              ))}
            </SelectField>
          </div>

          <div>
            <label htmlFor={amountFieldId} className="block text-sm font-semibold text-gray-700 mb-1">
              Quantity to Add
            </label>
            <input
              id={amountFieldId}
              type="number"
              min="1"
              placeholder="Enter amount..."
              value={modal.amountToAdd}
              onChange={(e) => onAmountChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-strong focus:border-brand-strong outline-none text-gray-800"
            />
          </div>

          {/* Quick Increment Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onQuickAdd(5)}
              className="flex-1 py-2 bg-orange-50 text-brand-strong font-bold rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors"
            >
              + 5
            </button>
            <button
              type="button"
              onClick={() => onQuickAdd(10)}
              className="flex-1 py-2 bg-orange-50 text-brand-strong font-bold rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors"
            >
              + 10
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="lg" className="flex-1" disabled={disabled}>
            Confirm Restock
          </Button>
        </div>
      </form>
    </Modal>
  );
}