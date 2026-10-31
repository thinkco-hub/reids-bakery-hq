import React from "react";
import { useParams } from "react-router";
import RecipeEditor from "../components/recipes/RecipeEditor";
import RecordRoute from "../components/common/RecordRoute";
import { RequireTab } from "../components/RequireAccess";
import {
  useCanViewIngredientCosts,
  useInventorySlice,
  useRecipesSlice,
} from "../store/slices";
import { PATH_BY_TAB } from "../routes";
import type { RecipeInput } from "../types/domain";
import { useShell } from "./shell";

/** `/recipes/:recipeId` — the editor opened on the recipe the URL names. */
export default function RecipeDetailRoute() {
  const { currentUser, backToList, openPath } = useShell();
  const { recipes, pricingRules, saveRecipe } = useRecipesSlice();
  const { ingredients } = useInventorySlice();
  const canViewIngredientCosts = useCanViewIngredientCosts();
  const { recipeId = "" } = useParams();
  const onBack = () => backToList(PATH_BY_TAB.recipes);

  const saveAndReturn = (recipe: RecipeInput) => {
    saveRecipe(recipe);
    openPath(PATH_BY_TAB.recipes, { replace: true });
  };

  return (
    <RequireTab role={currentUser.role} tab="recipes">
      <RecordRoute items={recipes} id={recipeId} kind="Recipe" onBack={onBack}>
        {(recipe) => (
          <RecipeEditor
            recipe={recipe}
            ingredients={ingredients}
            canViewIngredientCosts={canViewIngredientCosts}
            pricingRules={pricingRules}
            onCancel={onBack}
            onSave={saveAndReturn}
          />
        )}
      </RecordRoute>
    </RequireTab>
  );
}
