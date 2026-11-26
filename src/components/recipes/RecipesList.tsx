import React, { useId, useState } from "react";
import { formatMoney } from "../../utils/money";
import { computeRecipeCost, suggestedPrice } from "../../utils/pricing";
import SearchField from "../common/SearchField";
import Table, { TableHead } from "../common/Table";
import EmptyState from "../common/EmptyState";
import Badge from "../common/Badge";
import Button from "../common/Button";
import type {
  IngredientStock,
  PricingRuleInput,
  PricingRules,
  Recipe,
} from "../../types/domain";

interface RecipesListProps {
  recipes: Recipe[];
  ingredients: IngredientStock[];
  /** COGS and the price suggested from it are unit costs seen sideways, so they travel with that grant. */
  canViewIngredientCosts: boolean;
  pricingRules: PricingRules;
  onEditRule: (data: PricingRuleInput) => void;
  onEdit: (recipe: Recipe) => void;
  onCreate: () => void;
}

export default function RecipesList({
  recipes,
  ingredients,
  canViewIngredientCosts,
  pricingRules,
  onEditRule,
  onEdit,
  onCreate,
}: RecipesListProps) {
  const headingId = useId();
  const [search, setSearch] = useState("");
  const columnCount = canViewIngredientCosts ? 6 : 4;

  const query = search.toLowerCase();
  const filtered = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(query)
  );
  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-10 w-full">
      <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 id={headingId} className="text-3xl font-bold text-ink">Recipes / BOM</h2>
          <p className="text-gray-500 mt-1">
            {canViewIngredientCosts
              ? "One recipe per menu item, with live cost and suggested pricing."
              : "One recipe per menu item."}
          </p>
        </div>
        <Button onClick={onCreate}>+ New Recipe</Button>
      </header>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div>
          <h3 className="font-bold text-ink">Pricing Rule</h3>
          <p className="text-sm text-gray-500">Target margin used to compute suggested prices.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="95"
            aria-label="Target margin percent"
            value={pricingRules.targetMarginPercent}
            onChange={(e) => onEditRule({ targetMarginPercent: e.target.value })}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-strong focus:border-brand-strong outline-none text-gray-800 text-right font-bold"
          />
          <span className="text-gray-500 font-medium">% target margin</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-2 mb-4 flex shadow-sm">
        <SearchField
          value={search}
          onChange={setSearch}
          ariaLabel="Search recipes by name"
          placeholder="Search recipes..."
        />
      </div>

      <Table label="Recipes list" labelledBy={headingId} minWidth="min-w-[760px]">
        <TableHead>
          <th scope="col" className="px-6 py-4">Recipe</th>
          <th scope="col" className="px-6 py-4">Yield</th>
          {canViewIngredientCosts && (
            <>
              <th scope="col" className="px-6 py-4 text-right">COGS / Unit</th>
              <th scope="col" className="px-6 py-4 text-right">Suggested Price</th>
            </>
          )}
          <th scope="col" className="px-6 py-4 text-right">Actual Price</th>
          <th scope="col" className="px-4 py-4 text-center">Action</th>
        </TableHead>
        <tbody className="divide-y divide-gray-200 text-sm">
          {recipes.length === 0 ? (
            <tr>
              <td colSpan={columnCount}>
                <EmptyState
                  title="No recipes yet."
                  hint="Create one to see live COGS and pricing."
                  action={<Button size="sm" onClick={onCreate}>+ New Recipe</Button>}
                />
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={columnCount}>
                <EmptyState
                  title="No recipes match your search."
                  action={
                    <Button size="sm" variant="ghostBrand" onClick={() => setSearch("")}>
                      Clear search
                    </Button>
                  }
                />
              </td>
            </tr>
          ) : (
            filtered.map((recipe) => {
              const actualPrice = recipe.price;
              const costPerUnit = canViewIngredientCosts
                ? computeRecipeCost(recipe, ingredients).costPerUnit
                : 0;
              const price = canViewIngredientCosts
                ? suggestedPrice(costPerUnit, pricingRules.targetMarginPercent)
                : 0;
              const delta = actualPrice - price;
              return (
                <tr key={recipe.id} className="hover:bg-gray-50/50 transition-colors">
                  <th scope="row" className="px-6 py-4 text-left font-medium text-gray-900">{recipe.name}</th>
                  <td className="px-6 py-4 text-gray-600">
                    {recipe.yieldQty} {recipe.yieldUnit}
                  </td>
                  {canViewIngredientCosts && (
                    <>
                      <td className="px-6 py-4 text-right font-medium text-gray-900 tabular-nums">
                        {formatMoney(costPerUnit)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-brand-strong tabular-nums">
                        {formatMoney(price)}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div>
                      <span className="font-bold text-gray-900 tabular-nums">{formatMoney(actualPrice)}</span>
                      {canViewIngredientCosts && (
                        <Badge
                          family="micro"
                          tone={delta >= 0 ? "success" : "danger"}
                          size="xs"
                          className="ml-2"
                        >
                          {delta >= 0 ? "+" : ""}
                          {formatMoney(delta)}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Button
                      size="sm"
                      variant="ghostBrand"
                      onClick={() => onEdit(recipe)}
                      aria-label={`Edit ${recipe.name}`}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
}
