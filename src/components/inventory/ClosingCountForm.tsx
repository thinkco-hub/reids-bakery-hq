import React, { useEffect, useId, useRef, useState } from "react";
import { useAnnounce } from "../common/Announcer";
import Button from "../common/Button";
import { ArrowLeftIcon, BoxIcon, ShoppingCartIcon } from "../icons";
import { todayISO } from "../../utils/dates";
import type { ReactNode } from "react";
import type { FormEvent } from "react";
import type {
  ClosingCountEntry,
  ClosingCountSubmission,
  IngredientStock,
  InventoryItemCategory,
  MenuItemStock,
} from "../../types/domain";

type CountMap = Record<string, string>;

function CountSection({
  title,
  icon,
  items,
  counts,
  onUpdate,
}: {
  title: string;
  icon: ReactNode;
  items: (MenuItemStock | IngredientStock)[];
  counts: CountMap;
  onUpdate: (id: string, value: string) => void;
}) {
  const headingId = useId();
  // Phone inputs would sit off-screen inside the 420px table, so phones get a
  // stacked row per item and the table only ships from md up.
  const inputCls =
    "px-2 py-1.5 border border-gray-300 rounded-md text-right focus:ring-2 focus:ring-brand-strong focus:border-brand-strong outline-none text-gray-800";
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
      <h3 id={headingId} className="text-base font-bold text-ink mb-4">
        {icon} {title}
      </h3>
      <ul className="md:hidden space-y-4">
        {items.map((item) => (
          <li key={item.id}>
            <div className="flex items-baseline justify-between gap-2 mb-1.5">
              <span className="text-sm font-medium text-gray-900">{item.name}</span>
              <span className="text-xs text-gray-500">{("unit" in item && item.unit) || "pcs"}</span>
            </div>
            <input
              type="number"
              min="0"
              step="any"
              aria-label={`${title} count for ${item.name}`}
              value={counts[item.id] ?? ""}
              onChange={(e) => onUpdate(item.id, e.target.value)}
              placeholder="Enter count"
              className={`w-full min-h-[2.75rem] ${inputCls}`}
            />
          </li>
        ))}
      </ul>
      <div
        className="hidden md:block overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-label={`${title} count table`}
      >
        <table aria-labelledby={headingId} className="w-full text-left border-collapse min-w-[420px]">
          <thead>
            <tr className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th scope="col" className="px-4 py-3">Item</th>
              <th scope="col" className="px-4 py-3">Unit</th>
              <th scope="col" className="px-4 py-3 text-right">Counted Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {items.map((item) => (
              <tr key={item.id}>
                <th scope="row" className="px-4 py-3 text-left font-medium text-gray-900">{item.name}</th>
                <td className="px-4 py-3 text-gray-500">{("unit" in item && item.unit) || "pcs"}</td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    aria-label={`${title} count for ${item.name}`}
                    value={counts[item.id] ?? ""}
                    onChange={(e) => onUpdate(item.id, e.target.value)}
                    placeholder="Enter count"
                    className={`w-32 ${inputCls}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ClosingCountFormProps {
  menuInventory: MenuItemStock[];
  ingredients: IngredientStock[];
  onSubmit: (submission: ClosingCountSubmission) => void;
  onBack: () => void;
}

export default function ClosingCountForm({ menuInventory, ingredients, onSubmit, onBack }: ClosingCountFormProps) {
  const [date, setDate] = useState(todayISO());
  const [menuCounts, setMenuCounts] = useState<CountMap>({});
  const [ingredientCounts, setIngredientCounts] = useState<CountMap>({});
  const [submittedMsg, setSubmittedMsg] = useState("");
  const announce = useAnnounce();
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The form can unmount (route change) while its 4s dismissal is pending.
  useEffect(() => () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
  }, []);

  const updateMenuCount = (id: string, value: string) => setMenuCounts((prev) => ({ ...prev, [id]: value }));
  const updateIngredientCount = (id: string, value: string) =>
    setIngredientCounts((prev) => ({ ...prev, [id]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const menuEntries: ClosingCountEntry[] = menuInventory
      .filter((item) => menuCounts[item.id] !== undefined && menuCounts[item.id] !== "")
      .map((item) => ({
        itemId: item.id,
        itemType: "menu" as InventoryItemCategory,
        systemQty: item.qty,
        countedQty: parseFloat(menuCounts[item.id]) || 0,
      }));

    const ingredientEntries: ClosingCountEntry[] = ingredients
      .filter((item) => ingredientCounts[item.id] !== undefined && ingredientCounts[item.id] !== "")
      .map((item) => ({
        itemId: item.id,
        itemType: "ingredient" as InventoryItemCategory,
        systemQty: item.qty,
        countedQty: parseFloat(ingredientCounts[item.id]) || 0,
      }));

    const entries = [...menuEntries, ...ingredientEntries];
    if (entries.length === 0) return;

    onSubmit({ date, entries });
    setMenuCounts({});
    setIngredientCounts({});
    const message = `Closing count for ${date} submitted for review.`;
    setSubmittedMsg(message);
    announce(message);
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => setSubmittedMsg(""), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn pb-10 w-full">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 -mt-2 mb-2 py-2 text-sm font-semibold text-espresso/70 hover:text-espresso transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Inventory
      </button>

      <header className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-espresso">Closing Inventory Count</h2>
        <p className="text-espresso/70 mt-1 font-medium text-sm md:text-base">
          End-of-day physical count. Enter what you physically counted;
          system stock is only compared afterward during reconciliation.
        </p>
      </header>

      {submittedMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-lg px-4 py-3 mb-4">
          {submittedMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label htmlFor="closing-count-date" className="text-sm font-semibold text-gray-700">Count Date</label>
            <input
              id="closing-count-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-strong focus:border-brand-strong outline-none text-gray-800"
              required
            />
          </div>
        </div>

        <CountSection
          title="Menu Items"
          icon={<BoxIcon className="w-5 h-5 text-gray-500" />}
          items={menuInventory}
          counts={menuCounts}
          onUpdate={updateMenuCount}
        />
        {/* The shell hands roles without the ingredient grant an empty
            projection, so this section would be a header over no rows. */}
        {ingredients.length > 0 && (
          <CountSection
            title="Raw Materials"
            icon={<ShoppingCartIcon className="w-5 h-5 text-gray-500" />}
            items={ingredients}
            counts={ingredientCounts}
            onUpdate={updateIngredientCount}
          />
        )}

        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Submit Closing Count
        </Button>
      </form>
    </div>
  );
}
