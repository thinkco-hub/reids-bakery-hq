import React, { useEffect, useRef, useState } from "react";
import SelectField from "../common/SelectField";
import Button from "../common/Button";
import { useAnnounce } from "../common/Announcer";
import { formatMonthLabel, recentMonthKeys } from "../../utils/dates";
import type { FormEvent } from "react";
import type { ChamsBeginning, ChamsBranch, ChamsProduct, MonthKey } from "../../types/domain";

interface BeginningInventoryFormProps {
  branches: ChamsBranch[];
  products: ChamsProduct[];
  beginnings: ChamsBeginning[];
  onSubmit: (data: {
    branchId: string;
    productId: string;
    month: MonthKey;
    openingCount: number;
  }) => void;
}

export default function BeginningInventoryForm({ branches, products, beginnings, onSubmit }: BeginningInventoryFormProps) {
  const [branchId, setBranchId] = useState(branches[0]?.id || "");
  const [productId, setProductId] = useState(products[0]?.id || "");
  const monthOptions = recentMonthKeys(6);
  const [month, setMonth] = useState(monthOptions[0]);
  const [submittedMsg, setSubmittedMsg] = useState("");
  const announce = useAnnounce();
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The form can unmount (tab switch) while its 4s dismissal is pending.
  useEffect(() => () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
  }, []);

  const existing = beginnings.find(
    (b) => b.branchId === branchId && b.productId === productId && b.month === month
  );
  const hasExisting = !!existing;
  // Key the count field on the combo so changing the selection remounts it with
  // the saved value, instead of syncing state in an effect.
  const combo = `${branchId}|${productId}|${month}`;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    onSubmit({ branchId, productId, month, openingCount: parseFloat(String(data.get("openingCount"))) || 0 });
    const message = `Beginning inventory for ${formatMonthLabel(month)} saved.`;
    setSubmittedMsg(message);
    announce(message);
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => setSubmittedMsg(""), 4000);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn pb-10 w-full">
      <header className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-chams-navy">Beginning Inventory</h2>
        <p className="text-chams-navy/70 mt-1 font-medium text-sm md:text-base">
          Set up the opening stock count for a branch, siopao type, and month — used to onboard a new branch/siopao
          type or correct an error. Ongoing months carry stock forward automatically through Restocked.
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
            <label htmlFor="beginning-branch" className="block text-sm font-semibold text-gray-700 mb-1.5">Branch</label>
            <SelectField
              id="beginning-branch"
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
            <label htmlFor="beginning-product" className="block text-sm font-semibold text-gray-700 mb-1.5">Siopao Type</label>
            <SelectField
              id="beginning-product"
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
          <div>
            <label htmlFor="beginning-month" className="block text-sm font-semibold text-gray-700 mb-1.5">Month</label>
            <SelectField
              id="beginning-month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chams-blue focus:border-chams-blue outline-none text-gray-800"
            >
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
            </SelectField>
          </div>
        </div>

        <div>
          <label htmlFor="beginning-opening" className="block text-sm font-semibold text-gray-700 mb-1.5">Opening Count</label>
          <input
            key={combo}
            id="beginning-opening"
            name="openingCount"
            type="number"
            min="0"
            step="any"
            defaultValue={existing ? String(existing.openingCount) : "0"}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chams-blue focus:border-chams-blue outline-none text-gray-800"
          />
          <p className="text-xs text-gray-500 mt-1.5">
            {hasExisting
              ? "This month already has a confirmed opening count. Editing and saving will overwrite it."
              : "No opening count set for this combo/month yet — defaults to 0. Only set this to onboard a new branch/siopao type or to correct an error."}
          </p>
        </div>

        <Button type="submit" variant="chams" size="lg" className="w-full sm:w-auto">
          Save Beginning Inventory
        </Button>
      </form>
    </div>
  );
}