import React, { useState } from "react";
import SelectField from "../common/SelectField";
import { formatMonthLabel, monthKey } from "../../utils/dates";
import type { FormEvent } from "react";
import type { ChamsBranch, ChamsMovement, ChamsProduct, MonthKey } from "../../types/domain";

const MONTH_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const d = new Date();
  d.setMonth(d.getMonth() - i);
  return monthKey(d);
});

interface MovementLogFormProps {
  branches: ChamsBranch[];
  products: ChamsProduct[];
  movements: ChamsMovement[];
  onSubmit: (data: {
    branchId: string;
    productId: string;
    month: MonthKey;
    restocked: number;
    spoilage: number;
    sold: number;
  }) => void;
}

export default function MovementLogForm({ branches, products, movements, onSubmit }: MovementLogFormProps) {
  const [branchId, setBranchId] = useState(branches[0]?.id || "");
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [month, setMonth] = useState(MONTH_OPTIONS[0]);
  const [submittedMsg, setSubmittedMsg] = useState("");

  const existing = movements.find(
    (m) => m.branchId === branchId && m.productId === productId && m.month === month
  );
  // Key the quantity fields on the combo so changing the selection remounts them
  // with the saved values, instead of syncing state in an effect.
  const combo = `${branchId}|${productId}|${month}`;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    onSubmit({
      branchId,
      productId,
      month,
      restocked: parseFloat(String(data.get("restocked"))) || 0,
      spoilage: parseFloat(String(data.get("spoilage"))) || 0,
      sold: parseFloat(String(data.get("sold"))) || 0,
    });
    setSubmittedMsg(`Stock movement for ${formatMonthLabel(month)} saved.`);
    setTimeout(() => setSubmittedMsg(""), 4000);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn pb-10 w-full">
      <header className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1B2A4A]">Spoilage / Sold Logging</h2>
        <p className="text-[#1B2A4A]/70 mt-1 font-medium text-sm md:text-base">
          Supplier/admin entry — restocked, spoilage and sold quantities per branch, siopao type, and month.
          Restocked here is stock newly delivered this month; last month's remaining is added on top automatically.
        </p>
      </header>

      {submittedMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-lg px-4 py-3 mb-4">
          {submittedMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label htmlFor="movement-branch" className="block text-sm font-semibold text-gray-700 mb-1.5">Branch</label>
            <SelectField
              id="movement-branch"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B5BA5] focus:border-[#3B5BA5] outline-none text-gray-800"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </SelectField>
          </div>
          <div>
            <label htmlFor="movement-product" className="block text-sm font-semibold text-gray-700 mb-1.5">Siopao Type</label>
            <SelectField
              id="movement-product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B5BA5] focus:border-[#3B5BA5] outline-none text-gray-800"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </SelectField>
          </div>
          <div>
            <label htmlFor="movement-month" className="block text-sm font-semibold text-gray-700 mb-1.5">Month</label>
            <SelectField
              id="movement-month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B5BA5] focus:border-[#3B5BA5] outline-none text-gray-800"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
            </SelectField>
          </div>
        </div>

        <div key={combo} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label htmlFor="movement-restocked" className="block text-sm font-semibold text-gray-700 mb-1.5">Restocked</label>
            <input
              id="movement-restocked"
              name="restocked"
              type="number"
              min="0"
              step="any"
              defaultValue={existing ? String(existing.restocked) : ""}
              placeholder="0"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B5BA5] focus:border-[#3B5BA5] outline-none text-gray-800"
            />
          </div>
          <div>
            <label htmlFor="movement-spoilage" className="block text-sm font-semibold text-gray-700 mb-1.5">Spoilage</label>
            <input
              id="movement-spoilage"
              name="spoilage"
              type="number"
              min="0"
              step="any"
              defaultValue={existing ? String(existing.spoilage) : ""}
              placeholder="0"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B5BA5] focus:border-[#3B5BA5] outline-none text-gray-800"
            />
          </div>
          <div>
            <label htmlFor="movement-sold" className="block text-sm font-semibold text-gray-700 mb-1.5">Sold</label>
            <input
              id="movement-sold"
              name="sold"
              type="number"
              min="0"
              step="any"
              defaultValue={existing ? String(existing.sold) : ""}
              placeholder="0"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B5BA5] focus:border-[#3B5BA5] outline-none text-gray-800"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-bold bg-[#1B2A4A] hover:bg-[#12203a] transition-colors"
        >
          Save Movement
        </button>
      </form>
    </div>
  );
}