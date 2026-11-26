import { useContext } from "react";
import type { Context } from "react";
import {
  CatalogueContext,
  ClientsContext,
  ClosingContext,
  CurrentUserContext,
  OrdersContext,
  PosContext,
  ProductionContext,
} from "./BakeryProvider";
import { canAccessIngredients, canViewRecipeCosts } from "../utils/permissions";
import type {
  CatalogueSlice,
  ClientsSlice,
  ClosingSlice,
  OrdersSlice,
  PosSlice,
  ProductionSlice,
} from "./BakeryProvider";
import type { IngredientStock, User } from "../types/domain";

export type {
  CatalogueSlice,
  ClientsSlice,
  ClosingSlice,
  OrdersSlice,
  PosSlice,
  ProductionSlice,
};

/** A slice a component asked for outside the provider is a wiring bug, not a type. */
function useRequired<T>(context: Context<T | null>, name: string): T {
  const value = useContext(context);
  if (!value) throw new Error(`${name} must be used inside BakeryProvider`);
  return value;
}

export const useCurrentUser = (): User => useRequired(CurrentUserContext, "useCurrentUser");

export const useCatalogueSlice = (): CatalogueSlice =>
  useRequired(CatalogueContext, "useCatalogueSlice");
export const useClientsSlice = (): ClientsSlice => useRequired(ClientsContext, "useClientsSlice");
export const useProductionSlice = (): ProductionSlice =>
  useRequired(ProductionContext, "useProductionSlice");
export const useOrdersSlice = (): OrdersSlice => useRequired(OrdersContext, "useOrdersSlice");
export const useClosingSlice = (): ClosingSlice => useRequired(ClosingContext, "useClosingSlice");
export const usePosSlice = (): PosSlice => useRequired(PosContext, "usePosSlice");

export const useCanViewIngredients = (): boolean =>
  canAccessIngredients(useCurrentUser().role);

export const useCanViewIngredientCosts = (): boolean =>
  canViewRecipeCosts(useCurrentUser().role);

/**
 * Raw-material stock reduced to the one projection the screens may read. Its
 * default is no rows: a screen added later cannot disclose unit costs by
 * forgetting to ask. The full array stays with the admin-tier Reconciliation
 * screen and with the two tools that need an ingredient's identity to do their
 * job — production runs and the recipe editor — where the money derived from
 * unit cost is suppressed by useCanViewIngredientCosts instead.
 */
export function useVisibleIngredients(): IngredientStock[] {
  const ingredients = useCatalogueSlice().ingredients;
  return useCanViewIngredients() ? ingredients : [];
}
