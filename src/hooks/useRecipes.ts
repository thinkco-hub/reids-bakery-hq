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
  /** Seeded recipes; a test fixture replaces the value from src/data. */
  recipes?: Recipe[];
}

/**
 * Owns the recipes/BOM feature: the recipe list and the pricing rules. Whether
 * the editor is open, and on which recipe, is the router's `/recipes/new` and
 * `/recipes/:recipeId` routes, not state held here.
 */
export function useRecipes({ currentUser, recipes: seededRecipes }: UseRecipesOptions) {
  const [recipes, setRecipes] = useState<Recipe[]>(seededRecipes ?? initialRecipes);
  const [pricingRules, setPricingRules] = useState<PricingRules>({
    targetMarginPercent: 40,
  });

  const saveRecipe = (recipe: RecipeInput) => {
    const exists = recipes.some((r) => r.id === recipe.id);
    const savedId = exists
      ? (recipe.id as string)
      : `REC-${String(recipes.length + 1).padStart(2, "0")}`;

    setRecipes((prev) => {
      if (exists) return prev.map((r) => (r.id === recipe.id ? (recipe as Recipe) : r));
      return [...prev, { ...recipe, id: savedId }];
    });

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
    saveRecipe,
    updatePricingRule,
  };
}