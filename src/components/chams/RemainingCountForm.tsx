import React, { useEffect, useRef, useState } from "react";
import SelectField from "../common/SelectField";
import Button from "../common/Button";
import { useAnnounce } from "../common/Announcer";
import { formatMonthLabel, monthKey } from "../../utils/dates";
import type { FormEvent } from "react";
import type { ChamsBranch, ChamsCount, ChamsProduct } from "../../types/domain";

interface RemainingCountFormProps {
  branches: ChamsBranch[];
  products: ChamsProduct[];
  counts: ChamsCount[];
  onSubmit: (data: {
    branchId: string;
    productId: string;
    month: string;
    remainingReported: number;
  }) => void;
}

export default function RemainingCountForm({ branches, products, counts, onSubmit }: RemainingCountFormProps) {
  const month = monthKey();
  const [branchId, setBranchId] = useState(branches[0]?.id || "");
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [remainingReported, setRemainingReported] = useState("");
  const [submittedMsg, setSubmittedMsg] = useState("");
  const announce = useAnnounce();
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The form can unmount (tab switch) while its 4s dismissal is pending.
  useEffect(() => () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
  }, []);

  const existing = counts.find(
    (c) => c.branchId === branchId && c.productId === productId && c.month === month
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (remainingReported === "") return;

    onSubmit({ branchId, productId, month, remainingReported: parseFloat(remainingReported) || 0 });
    const message = `Remaining count for ${formatMonthLabel(month)} submitted.`;
    setSubmittedMsg(message);
    announce(message);
    setRemainingReported("");
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => setSubmittedMsg(""), 4000);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn pb-10 w-full">
      <header className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-chams-navy">Remaining Count Entry</h2>
        <p className="text-chams-navy/70 mt-1 font-medium text-sm md:text-base">
          Submit the physical remaining stock count for your branch and siopao type this month.
        </p>
      </header>

      {submittedMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-lg px-4 py-3 mb-4">
          {submittedMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="remaining-branch" className="block text-sm font-semibold text-gray-700 mb-1.5">Branch</label>
            <SelectField
              id="remaining-branch"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chams-blue focus:border-chams-blue outline-none text-gray-800"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </SelectField>
          </div>
          <div>
            <label htmlFor="remaining-product" className="block text-sm font-semibold text-gray-700 mb-1.5">Siopao Type</label>
            <SelectField
              id="remaining-product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chams-blue focus:border-chams-blue outline-none text-gray-800"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </SelectField>
          </div>
        </div>

        <div>
          <span className="block text-sm font-semibold text-gray-700 mb-1.5">Period</span>
          <div className="px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 font-medium">
            {formatMonthLabel(month)}
          </div>
        </div>

        {existing && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
            A count of <span className="font-bold">{existing.remainingReported}</span> was already submitted for
            this branch and siopao type this month. Submitting again will overwrite it.
          </div>
        )}

        <div>
          <label htmlFor="remaining-count" className="block text-sm font-semibold text-gray-700 mb-1.5">Physical Remaining Count</label>
          <input
            id="remaining-count"
            type="number"
            min="0"
            step="any"
            value={remainingReported}
            onChange={(e) => setRemainingReported(e.target.value)}
            placeholder="Enter what you physically counted"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chams-blue focus:border-chams-blue outline-none text-gray-800"
            required
          />
        </div>

        <Button type="submit" variant="chams" size="lg" className="w-full sm:w-auto">
          Submit Count
        </Button>
      </form>
    </div>
  );
}
