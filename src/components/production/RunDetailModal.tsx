import React from "react";
import { createPortal } from "react-dom";
import { computeBatches, computeRequiredIngredients, isRunFeasible } from "../../utils/production";
import type { IngredientStock, MenuItemStock, ProductionRun, ProductionRunId, Recipe } from "../../types/domain";

interface RunDetailModalProps {
  run: ProductionRun;
  recipe: Recipe;
  menuItem: MenuItemStock | undefined;
  ingredients: IngredientStock[];
  onClose: () => void;
  onComplete: (id: ProductionRunId) => void;
  onDelete: () => void;
}

export default function RunDetailModal({ run, recipe, menuItem, ingredients, onClose, onComplete, onDelete }: RunDetailModalProps) {
  const batches = computeBatches(run.plannedQty, recipe);
  const required = computeRequiredIngredients(run, recipe, ingredients);
  const feasible = isRunFeasible(run, recipe, ingredients);
  const actualYield = batches * (Number(recipe.yieldQty) || 0);
  const isCompleted = run.status === "completed";

  // Portalled to <body>: <main> is `relative z-10`, which caps this overlay's z-[100] below the mobile top bar's z-30.
  return createPortal(
    <div
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fadeIn max-h-[85dvh] flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8">
          <div className="flex items-center justify-between gap-3 mb-1">
            <h2 className="min-w-0 text-2xl font-bold text-[#121212]">{recipe.name}</h2>
            {isCompleted ? (
              <span className="shrink-0 whitespace-nowrap px-3 py-1 rounded-full border border-green-300 bg-green-50 text-green-700 text-xs font-bold">
                Completed
              </span>
            ) : feasible ? (
              <span className="shrink-0 whitespace-nowrap px-3 py-1 rounded-full border border-blue-300 bg-blue-50 text-blue-700 text-xs font-bold">
                Scheduled
              </span>
            ) : (
              <span className="shrink-0 whitespace-nowrap px-3 py-1 rounded-full border border-red-300 bg-red-50 text-red-700 text-xs font-bold">
                Insufficient Stock
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mb-6">
            {menuItem ? menuItem.name : "—"} · Planned {run.plannedDate}
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 font-medium mb-1">Planned Qty</p>
              <p className="font-bold text-[#121212]">
                {run.plannedQty} {recipe.yieldUnit}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 font-medium mb-1">Batches</p>
              <p className="font-bold text-[#121212]">{batches}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 font-medium mb-1">Batch Yield</p>
              <p className="font-bold text-[#121212]">
                {actualYield} {recipe.yieldUnit}
              </p>
            </div>
          </div>

          {run.notes && (
            <div className="bg-[#fff6ef] rounded-lg p-3 text-sm text-[#562D07] font-medium mb-6">{run.notes}</div>
          )}

          <h3 className="text-sm font-bold text-gray-700 mb-3">Required Ingredients</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-2.5">Ingredient</th>
                  <th className="px-4 py-2.5 text-right">Required</th>
                  <th className="px-4 py-2.5 text-right">In Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {required.map((line) => (
                  <tr key={line.ingredientId} className={line.shortfall > 0 ? "bg-red-50/50" : ""}>
                    <td className="px-4 py-2.5 font-medium text-gray-800">{line.name}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">
                      {line.requiredQty} {line.unit}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-semibold ${
                        line.shortfall > 0 ? "text-red-600" : "text-gray-700"
                      }`}
                    >
                      {line.inStock} {line.unit}
                      {line.shortfall > 0 && (
                        <span className="block text-xs font-normal text-red-500">
                          short {line.shortfall} {line.unit}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isCompleted && !feasible && (
            <p className="mt-4 text-xs text-red-600 font-medium">
              Completing this run will deduct available stock down to zero for short ingredients.
            </p>
          )}
        </div>

        <div className="shrink-0 flex flex-wrap gap-3 border-t border-gray-100 px-6 md:px-8 py-4 md:py-6">
          <button
            onClick={onClose}
            className="flex-1 min-h-[2.75rem] md:min-h-0 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold whitespace-nowrap hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          {!isCompleted && (
            <>
              <button
                onClick={onDelete}
                className="min-h-[2.75rem] md:min-h-0 px-4 py-3 rounded-xl border border-red-200 text-red-600 font-bold whitespace-nowrap hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => onComplete(run.id)}
                className="flex-1 min-h-[2.75rem] md:min-h-0 px-4 py-3 rounded-xl text-white font-bold whitespace-nowrap bg-[#562D07] hover:bg-[#3a1d04] transition-colors"
              >
                Mark Complete
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
