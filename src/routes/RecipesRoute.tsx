import React from "react";
import RecipesList from "../components/recipes/RecipesList";
import { RequireTab } from "../components/RequireAccess";
import {
  useCanViewIngredientCosts,
  useInventorySlice,
  useRecipesSlice,
  useVisibleIngredients,
} from "../store/slices";
import { PATH_BY_TAB } from "../routes";
import { useShell } from "./shell";

export default function RecipesRoute() {
  const { currentUser, openPath } = useShell();
  const { recipes, pricingRules, updatePricingRule } = useRecipesSlice();
  const { menuInventory } = useInventorySlice();
  const ingredients = useVisibleIngredients();
  const canViewIngredientCosts = useCanViewIngredientCosts();

  return (
    <RequireTab role={currentUser.role} tab="recipes">
      <RecipesList
        recipes={recipes}
        ingredients={ingredients}
        canViewIngredientCosts={canViewIngredientCosts}
        menuInventory={menuInventory}
        pricingRules={pricingRules}
        onEditRule={updatePricingRule}
        onEdit={(recipe) => openPath(`${PATH_BY_TAB.recipes}/${recipe.id}`)}
        onCreate={() => openPath(`${PATH_BY_TAB.recipes}/new`)}
      />
    </RequireTab>
  );
}
