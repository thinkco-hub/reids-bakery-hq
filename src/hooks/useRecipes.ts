import { useState } from "react";
import { initialRecipes } from "../data/initialRecipes";
import { recordAuditEvent } from "../utils/auditLog";
import type {
  PricingRuleInput,
  PricingRules,
  Recipe,
  RecipeInput,
  User,
} from "../types/domain";

interface UseRecipesOptions {
  currentUser: User | null;
}

/**
 * Owns the recipes/BOM feature: the recipe list, pricing rules and the state
 * of the recipe editor (viewing an existing recipe or creating a new one).
 */
export function useRecipes({ currentUser }: UseRecipesOptions) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [pricingRules, setPricingRules] = useState<PricingRules>({
    targetMarginPercent: 40,
  });
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);

  const saveRecipe = (recipe: RecipeInput) => {
    const exists = recipes.some((r) => r.id === recipe.id);
    const savedId = exists
      ? (recipe.id as string)
      : `REC-${String(recipes.length + 1).padStart(2, "0")}`;

    setRecipes((prev) => {
      if (exists) return prev.map((r) => (r.id === recipe.id ? (recipe as Recipe) : r));
      return [...prev, { ...recipe, id: savedId }];
    });
    setViewingRecipe(null);
    setIsCreatingRecipe(false);

    if (currentUser) {
      recordAuditEvent({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: "recipe.saved",
        entityType: "Recipe",
        entityId: savedId,
        details: `${exists ? "Updated" : "Created"} recipe ${savedId} (${recipe.name})`,
      });
    }
  };

  const cancelRecipeEdit = () => {
    setViewingRecipe(null);
    setIsCreatingRecipe(false);
  };

  const updatePricingRule = (data: PricingRuleInput) => {
    setPricingRules((prev) => ({
      ...prev,
      targetMarginPercent:
        data.targetMarginPercent === "" ? "" : parseFloat(data.targetMarginPercent) || 0,
    }));
  };

  return {
    recipes,
    pricingRules,
    viewingRecipe,
    setViewingRecipe,
    isCreatingRecipe,
    setIsCreatingRecipe,
    saveRecipe,
    cancelRecipeEdit,
    updatePricingRule,
  };
}