import React, { useId, useState } from "react";
import InventoryStatsBar from "./InventoryStatsBar";
import StockStatusBadge from "./StockStatusBadge";
import SearchField from "../common/SearchField";
import Table, { TableHead } from "../common/Table";
import EmptyState from "../common/EmptyState";
import Button from "../common/Button";
import { STOCK_STATUS_LABELS } from "../../utils/status";
import { groupByStatus, getStockStatus } from "../../utils/stock";
import type { MenuItemStock, StockStatus } from "../../types/domain";

interface FinishedGoodsTableProps {
  menuInventory: MenuItemStock[];
  onRestock: (itemId: string) => void;
}

export default function FinishedGoodsTable({ menuInventory, onRestock }: FinishedGoodsTableProps) {
  const headingId = useId();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StockStatus>("all");

  const searched = menuInventory.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase())
  );
  const filtered =
    statusFilter === "all" ? searched : searched.filter((item) => getStockStatus(item) === statusFilter);
  const groups = groupByStatus(filtered);

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-10 w-full">
      <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-espresso">Inventory: Menu Items</h2>
          <p className="text-espresso/70 mt-1 font-medium text-sm md:text-base">
            Track finished baked goods ready for dispatch
          </p>
        </div>
      </header>

      <InventoryStatsBar items={menuInventory} activeFilter={statusFilter} onFilterChange={setStatusFilter} />

      <div className="bg-white border border-gray-200 rounded-lg p-2 mb-4 shadow-sm flex">
        <SearchField
          value={search}
          onChange={setSearch}
          ariaLabel="Search items by name or ID"
          placeholder="Search items by name or ID..."
        />
      </div>

      <div className="mb-6 md:mb-8">
        <Table
          label="Finished goods stock"
          labelledBy={headingId}
          minWidth="min-w-[600px]"
          header={
            <div className="px-4 md:px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <h2 id={headingId} className="text-base md:text-lg font-bold text-ink">
                Finished Goods Stock
              </h2>
            </div>
          }
        >
          <TableHead>
              <th scope="col" className="px-4 md:px-6 py-3">Pastry Type</th>
              <th scope="col" className="px-4 md:px-6 py-3">Batch ID</th>
              <th scope="col" className="px-4 md:px-6 py-3">Qty Ready</th>
              <th scope="col" className="px-4 md:px-6 py-3">Shelf Life</th>
              <th scope="col" className="px-4 md:px-6 py-3">Status</th>
              <th scope="col" className="px-4 md:px-6 py-3 text-center">Action</th>
            </TableHead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title={search ? "No items match your search." : "No menu items in this view."}
                      hint={search ? undefined : "Items without stock in the selected status are hidden."}
                      action={
                        search ? (
                          <Button size="sm" variant="ghostBrand" onClick={() => setSearch("")}>
                            Clear search
                          </Button>
                        ) : undefined
                      }
                    />
                  </td>
                </tr>
              ) : (
                groups.map((group) => (
                  <React.Fragment key={group.status}>
                    {statusFilter === "all" && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 md:px-6 py-2 bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-700"
                        >
                          {STOCK_STATUS_LABELS[group.status]} ({group.items.length})
                        </td>
                      </tr>
                    )}
                    {group.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <th scope="row" className="px-4 md:px-6 py-4 text-left font-semibold text-ink">{item.name}</th>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-600 font-medium">{item.id}</td>
                        <td className="px-4 md:px-6 py-4 font-bold text-ink text-lg tabular-nums">{item.qty}</td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-600 font-medium">
                          {item.shelfLife}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <StockStatusBadge item={item} />
                        </td>
                        <td className="px-4 md:px-6 py-4 text-center">
                          <Button
                            size="sm"
                            variant="ghostBrand"
                            onClick={() => onRestock(item.id)}
                            aria-label={`Restock ${item.name}`}
                          >
                            + Restock
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
        </Table>
      </div>
    </div>
  );
}
