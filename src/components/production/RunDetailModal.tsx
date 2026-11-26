import React, { useId } from "react";
import Modal from "../common/Modal";
import Badge from "../common/Badge";
import Button from "../common/Button";
import {
  computeBatches,
  computeRequiredIngredients,
  getRunStatus,
  isRunFeasible,
} from "../../utils/production";
import { RUN_STATUS_LABELS, RUN_STATUS_TONES } from "../../utils/status";
import type { IngredientStock, ProductionRun, ProductionRunId, Recipe } from "../../types/domain";

interface RunDetailModalProps {
  run: ProductionRun;
  recipe: Recipe;
  ingredients: IngredientStock[];
  onClose: () => void;
  onComplete: (id: ProductionRunId) => void;
  onDelete: () => void;
}

export default function RunDetailModal({ run, recipe, ingredients, onClose, onComplete, onDelete }: RunDetailModalProps) {
  const batches = computeBatches(run.plannedQty, recipe);
  const required = computeRequiredIngredients(run, recipe, ingredients);
  const feasible = isRunFeasible(run, recipe, ingredients);
  const actualYield = batches * (Number(recipe.yieldQty) || 0);
  const isCompleted = run.status === "completed";
  const status = getRunStatus(run, recipe, ingredients);
  const headingId = useId();
  const requiredHeadingId = useId();

  return (
    <Modal
      labelledBy={headingId}
      onClose={onClose}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fadeIn max-h-[85dvh] flex flex-col overflow-hidden"
    >
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mb-1">
            <h2 id={headingId} className="min-w-0 text-lg md:text-2xl font-bold text-ink">{recipe.name}</h2>
            <Badge tone={RUN_STATUS_TONES[status]}>{RUN_STATUS_LABELS[status]}</Badge>
          </div>
          <p className="text-gray-500 text-sm mb-6">Planned {run.plannedDate}</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 font-medium mb-1">Planned Qty</p>
              <p className="font-bold text-ink">
                {run.plannedQty} {recipe.yieldUnit}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 font-medium mb-1">Batches</p>
              <p className="font-bold text-ink">{batches}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 font-medium mb-1">Batch Yield</p>
              <p className="font-bold text-ink">
                {actualYield} {recipe.yieldUnit}
              </p>
            </div>
          </div>

          {run.notes && (
            <div className="bg-orange-50 rounded-lg p-3 text-sm text-espresso font-medium mb-6">{run.notes}</div>
          )}

          <h3 id={requiredHeadingId} className="text-sm font-bold text-gray-700 mb-3">Required Ingredients</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table aria-labelledby={requiredHeadingId} className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th scope="col" className="px-4 py-2.5">Ingredient</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Required</th>
                  <th scope="col" className="px-4 py-2.5 text-right">In Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {required.map((line) => (
                  <tr key={line.ingredientId} className={line.shortfall > 0 ? "bg-red-50/50" : ""}>
                    <th scope="row" className="px-4 py-2.5 text-left font-medium text-gray-800">{line.name}</th>
                    <td className="px-4 py-2.5 text-right text-gray-700">
                      {line.requiredQty} {line.unit}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-semibold ${
                        line.shortfall > 0 ? "text-red-700" : "text-gray-700"
                      }`}
                    >
                      {line.inStock} {line.unit}
                      {line.shortfall > 0 && (
                        <span className="block text-xs font-normal text-red-700">
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
            <p className="mt-4 text-xs text-red-700 font-medium">
              Completing this run will deduct available stock down to zero for short ingredients.
            </p>
          )}
        </div>

        <div className="shrink-0 flex flex-wrap gap-3 border-t border-gray-100 px-6 md:px-8 py-4 md:py-6">
          <Button variant="secondary" size="lg" className="flex-1" onClick={onClose}>
            Close
          </Button>
          {!isCompleted && (
            <>
              <Button variant="dangerOutline" size="lg" onClick={onDelete}>
                Delete
              </Button>
              <Button size="lg" className="flex-1" onClick={() => onComplete(run.id)}>
                Mark Complete
              </Button>
            </>
          )}
        </div>
    </Modal>
  );
}
