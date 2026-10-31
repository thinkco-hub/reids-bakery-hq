import React from "react";
import RecipeEditor from "../components/recipes/RecipeEditor";
import { RequireTab } from "../components/RequireAccess";
import {
  useCanViewIngredientCosts,
  useCatalogueSlice,
} from "../store/slices";
import { PATH_BY_TAB } from "../routes";
import type { RecipeInput } from "../types/domain";
import { useShell } from "./shell";

export default function RecipeNewRoute() {
  const { currentUser, backToList, openPath } = useShell();
  const { ingredients, pricingRules, saveRecipe } = useCatalogueSlice();
  const canViewIngredientCosts = useCanViewIngredientCosts();

  // Both editor routes save and leave for the list. The replace is load-bearing:
  // without it browser Back walks into an editor that already saved.
  const saveAndReturn = (recipe: RecipeInput) => {
    saveRecipe(recipe);
    openPath(PATH_BY_TAB.recipes, { replace: true });
  };

  return (
    <RequireTab role={currentUser.role} tab="recipes">
      <RecipeEditor
        recipe={null}
        ingredients={ingredients}
        canViewIngredientCosts={canViewIngredientCosts}
        pricingRules={pricingRules}
        onCancel={() => backToList(PATH_BY_TAB.recipes)}
        onSave={saveAndReturn}
      />
    </RequireTab>
  );
}
