import React from "react";
import { useParams } from "react-router";
import RecipeEditor from "./RecipeEditor";
import RecordNotFound from "../common/RecordNotFound";
import type { IngredientStock, PricingRules, Recipe, RecipeInput } from "../../types/domain";

interface RecipeDetailRouteProps {
  recipes: Recipe[];
  ingredients: IngredientStock[];
  canViewIngredientCosts: boolean;
  pricingRules: PricingRules;
  onSave: (recipe: RecipeInput) => void;
  onCancel: () => void;
  onBack: () => void;
}

/** `/recipes/:recipeId` — the editor opened on the recipe the URL names. */
export default function RecipeDetailRoute({
  recipes,
  ingredients,
  canViewIngredientCosts,
  pricingRules,
  onSave,
  onCancel,
  onBack,
}: RecipeDetailRouteProps) {
  const { recipeId = "" } = useParams();
  const recipe = recipes.find((r) => r.id === recipeId);

  if (!recipe) {
    return <RecordNotFound kind="Recipe" id={recipeId} onBack={onBack} />;
  }

  return (
    <RecipeEditor
      recipe={recipe}
      ingredients={ingredients}
      canViewIngredientCosts={canViewIngredientCosts}
      pricingRules={pricingRules}
      onCancel={onCancel}
      onSave={onSave}
    />
  );
}
