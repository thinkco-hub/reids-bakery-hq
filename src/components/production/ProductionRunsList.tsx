import React, { useId, useState } from "react";
import ScheduleRunModal from "./ScheduleRunModal";
import RunDetailModal from "./RunDetailModal";
import DeleteConfirmDialog from "../common/DeleteConfirmDialog";
import { useAnnounce } from "../common/Announcer";
import SearchField from "../common/SearchField";
import Table, { TableHead } from "../common/Table";
import EmptyState from "../common/EmptyState";
import StatCard from "../common/StatCard";
import Badge from "../common/Badge";
import Button from "../common/Button";
import { getRunStatus } from "../../utils/production";
import {
  RUN_STATUS_LABELS,
  RUN_STATUS_TONES,
} from "../../utils/status";
import type {
  CatalogueItem,
  IngredientStock,
  ProductionRun,
  ProductionRunDisposition,
  ProductionRunId,
  ScheduleRunData,
} from "../../types/domain";

const STAT_CARDS: Array<{ key: "all" | ProductionRunDisposition; label: string }> = [
  { key: "all", label: "Total Runs" },
  { key: "scheduled", label: RUN_STATUS_LABELS.scheduled },
  { key: "insufficient", label: RUN_STATUS_LABELS.insufficient },
  { key: "completed", label: RUN_STATUS_LABELS.completed },
];

interface ProductionRunsListProps {
  productionRuns: ProductionRun[];
  catalogue: CatalogueItem[];
  ingredients: IngredientStock[];
  onSchedule: (data: ScheduleRunData) => void;
  onComplete: (id: ProductionRunId) => void;
  onDelete: (id: ProductionRunId) => void;
}

export default function ProductionRunsList({
  productionRuns,
  catalogue,
  ingredients,
  onSchedule,
  onComplete,
  onDelete,
}: ProductionRunsListProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | ProductionRunDisposition>("all");
  const [search, setSearch] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<ProductionRunId | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ProductionRun | null>(null);
  const announce = useAnnounce();
  const tableHeadingBase = useId();

  const withStatus = productionRuns.map((run) => {
    const recipe = catalogue.find((r) => r.id === run.recipeId) || null;
    return {
      run,
      recipe,
      status: (recipe ? getRunStatus(run, recipe, ingredients) : "scheduled") as ProductionRunDisposition,
    };
  });

  const counts: Record<"all" | ProductionRunDisposition, number> = {
    all: withStatus.length,
    scheduled: 0,
    insufficient: 0,
    completed: 0,
  };
  withStatus.forEach(({ status }) => {
    counts[status] += 1;
  });

  const query = search.toLowerCase();
  const filtered = withStatus.filter((entry) => {
    const { recipe, status } = entry;
    if (statusFilter !== "all" && status !== statusFilter) return false;
    if (!search) return true;
    return (recipe?.name ?? "").toLowerCase().includes(query);
  });

  const sorted = [...filtered].sort((a, b) => a.run.plannedDate.localeCompare(b.run.plannedDate));

  const groupedByDate: Array<{ date: string; entries: typeof withStatus }> = [];
  sorted.forEach((entry) => {
    const lastGroup = groupedByDate[groupedByDate.length - 1];
    if (lastGroup && lastGroup.date === entry.run.plannedDate) {
      lastGroup.entries.push(entry);
    } else {
      groupedByDate.push({ date: entry.run.plannedDate, entries: [entry] });
    }
  });

  const selectedEntry = withStatus.find((entry) => entry.run.id === selectedRunId);
  const selectedModalEntry =
    selectedEntry && selectedEntry.recipe ? { ...selectedEntry, recipe: selectedEntry.recipe } : null;

  const handleSchedule = (data: ScheduleRunData) => {
    onSchedule(data);
    setIsScheduling(false);
    announce(`Production run scheduled for ${data.plannedDate}.`);
  };

  const handleComplete = (id: ProductionRunId) => {
    onComplete(id);
    setSelectedRunId(null);
    announce("Production run completed.");
  };

  const pendingRecipe = pendingDelete
    ? catalogue.find((recipe) => recipe.id === pendingDelete.recipeId)
    : undefined;

  const confirmPendingDelete = () => {
    if (!pendingDelete) return;
    onDelete(pendingDelete.id);
    setPendingDelete(null);
    setSelectedRunId(null);
    announce(`${pendingRecipe ? pendingRecipe.name : "Production run"} deleted.`);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-10 w-full">
      {isScheduling && (
        <ScheduleRunModal recipes={catalogue} onClose={() => setIsScheduling(false)} onSchedule={handleSchedule} />
      )}
      {selectedModalEntry && (
        <RunDetailModal
          run={selectedModalEntry.run}
          recipe={selectedModalEntry.recipe}
          ingredients={ingredients}
          onClose={() => setSelectedRunId(null)}
          onComplete={handleComplete}
          onDelete={() => setPendingDelete(selectedModalEntry.run)}
        />
      )}
      {pendingDelete && (
        <DeleteConfirmDialog
          title="Delete this run?"
          message={`Deleting ${
            pendingRecipe
              ? `${pendingRecipe.name} (${pendingDelete.plannedQty} ${pendingRecipe.yieldUnit})`
              : "this scheduled run"
          } is irreversible and cannot be undone.`}
          confirmLabel="Delete run"
          onConfirm={confirmPendingDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-ink">Production Runs</h2>
          <p className="text-gray-500 mt-1">Schedule batches and track them against ingredient stock.</p>
        </div>
        <Button onClick={() => setIsScheduling(true)} disabled={catalogue.length === 0}>
          + Schedule Production Run
        </Button>
      </header>

      {catalogue.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg mb-6">
          <EmptyState
            title="No recipes yet."
            hint="Create one under Recipes before scheduling a production run."
          />
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.key}
            label={card.label}
            value={counts[card.key]}
            active={statusFilter === card.key}
            onSelect={() => setStatusFilter(card.key)}
          />
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-2 mb-6 flex shadow-sm">
        <SearchField
          value={search}
          onChange={setSearch}
          ariaLabel="Search production runs by recipe name"
          placeholder="Search recipes..."
        />
      </div>

      {groupedByDate.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <EmptyState
            title={search || statusFilter !== "all" ? "No production runs in this view." : "No production runs yet."}
            hint={
              search || statusFilter !== "all"
                ? "Try another recipe name or status."
                : "Schedule a run to plan a batch against ingredient stock."
            }
            action={
              search || statusFilter !== "all" ? (
                <Button
                  size="sm"
                  variant="ghostBrand"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              ) : catalogue.length > 0 ? (
                <Button size="sm" onClick={() => setIsScheduling(true)}>
                  + Schedule Production Run
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByDate.map((group, groupIndex) => {
            const groupHeadingId = `${tableHeadingBase}-${groupIndex}`;
            return (
              <Table
                key={group.date}
                label={`Production runs for ${group.date}`}
                labelledBy={groupHeadingId}
                minWidth="min-w-[720px]"
                header={
                  <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                    <h3 id={groupHeadingId} className="text-sm font-bold text-gray-700">{group.date}</h3>
                  </div>
                }
              >
                <TableHead>
                  <th scope="col" className="px-5 py-4">Recipe</th>
                  <th scope="col" className="px-5 py-4">Qty</th>
                  <th scope="col" className="px-5 py-4">Status</th>
                  <th scope="col" className="px-5 py-4 text-right">Actions</th>
                </TableHead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {group.entries.map(({ run, recipe, status }) => (
                    <tr key={run.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-ink">{recipe ? recipe.name : "—"}</td>
                      <td className="px-5 py-4 text-gray-600 tabular-nums">
                        {run.plannedQty} {recipe ? recipe.yieldUnit : ""}
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={RUN_STATUS_TONES[status]}>{RUN_STATUS_LABELS[status]}</Badge>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="ghostBrand"
                          onClick={() => setSelectedRunId(run.id)}
                          aria-label={`${status === "completed" ? "View" : "View / Complete"} ${recipe ? recipe.name : "run"} for ${run.plannedDate}`}
                        >
                          {status === "completed" ? "View" : "View / Complete"}
                        </Button>
                        {status !== "completed" && (
                          <Button
                            size="sm"
                            variant="ghostDanger"
                            onClick={() => setPendingDelete(run)}
                            aria-label={`Delete ${recipe ? recipe.name : "run"} for ${run.plannedDate}`}
                          >
                            Delete
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            );
          })}
        </div>
      )}
    </div>
  );
}
