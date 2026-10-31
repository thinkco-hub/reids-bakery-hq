import React from "react";
import { useParams } from "react-router";
import RecipeEditor from "./RecipeEditor";
import RecordRoute from "../common/RecordRoute";
import type { IngredientStock, PricingRules, Recipe, RecipeInput } from "../../types/domain";

interface RecipeDetailRouteProps {
  recipes: Recipe[];
  ingredients: IngredientStock[];
  canViewIngredientCosts: boolean;
  pricingRules: PricingRules;
  onSave: (recipe: RecipeInput) => void;
  onBack: () => void;
}

/** `/recipes/:recipeId` — the editor opened on the recipe the URL names. */
export default function RecipeDetailRoute({
  recipes,
  ingredients,
  canViewIngredientCosts,
  pricingRules,
  onSave,
  onBack,
}: RecipeDetailRouteProps) {
  const { recipeId = "" } = useParams();

  return (
    <RecordRoute items={recipes} id={recipeId} kind="Recipe" onBack={onBack}>
      {(recipe) => (
        <RecipeEditor
          recipe={recipe}
          ingredients={ingredients}
          canViewIngredientCosts={canViewIngredientCosts}
          pricingRules={pricingRules}
          onCancel={onBack}
          onSave={onSave}
        />
      )}
    </RecordRoute>
  );
}
