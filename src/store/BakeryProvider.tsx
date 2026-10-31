import React, { createContext, useContext } from "react";
import { initialPosProducts } from "../data/initialProducts";
import { useClients } from "../hooks/useClients";
import { useClosing } from "../hooks/useClosing";
import { useInventory } from "../hooks/useInventory";
import { useOrders } from "../hooks/useOrders";
import { usePos } from "../hooks/usePos";
import { useProduction } from "../hooks/useProduction";
import { useRecipes } from "../hooks/useRecipes";
import type {
  Client,
  IngredientStock,
  InventoryCount,
  MenuItemStock,
  Order,
  PosProduct,
  ProductionRun,
  Recipe,
  RestockReminder,
  Sale,
  User,
} from "../types/domain";

/**
 * The collections a test fixture may replace. The app passes no seed, so every
 * hook starts from src/data exactly as it did when the shell called it.
 */
export interface BakerySeed {
  menuInventory?: MenuItemStock[];
  ingredients?: IngredientStock[];
  restockReminders?: RestockReminder[];
  clients?: Client[];
  recipes?: Recipe[];
  productionRuns?: ProductionRun[];
  orders?: Order[];
  inventoryCounts?: InventoryCount[];
  sales?: Sale[];
  posProducts?: PosProduct[];
}

export interface BakeryStore {
  currentUser: User;
  inventory: ReturnType<typeof useInventory>;
  clients: ReturnType<typeof useClients>;
  recipes: ReturnType<typeof useRecipes>;
  production: ReturnType<typeof useProduction>;
  orders: ReturnType<typeof useOrders>;
  closing: ReturnType<typeof useClosing>;
  pos: ReturnType<typeof usePos>;
}

const BakeryContext = createContext<BakeryStore | null>(null);

interface BakeryProviderProps {
  currentUser: User;
  seed?: BakerySeed;
  children: React.ReactNode;
}

/**
 * Calls every feature hook once and exposes the slices. It lives above the
 * router outlet, so swapping routes changes what reads the state, never the
 * state itself. The hooks are ordered by dependency: stock movements feed
 * orders, production and closing, and the POS needs orders to mint a linked
 * order.
 */
export function BakeryProvider({ currentUser, seed, children }: BakeryProviderProps) {
  const inventory = useInventory({
    currentUser,
    menuInventory: seed?.menuInventory,
    ingredients: seed?.ingredients,
    restockReminders: seed?.restockReminders,
  });
  const clients = useClients({ currentUser, clients: seed?.clients });
  const recipes = useRecipes({ currentUser, recipes: seed?.recipes });
  const production = useProduction({
    recipes: recipes.recipes,
    deductRecipeLines: inventory.deductRecipeLines,
    addMenuStock: inventory.addMenuStock,
    currentUser,
    productionRuns: seed?.productionRuns,
  });
  const orders = useOrders({
    deductOrderLines: inventory.deductOrderLines,
    currentUser,
    orders: seed?.orders,
  });
  const closing = useClosing({
    applyCountedQty: inventory.applyCountedQty,
    applyPendingCounts: inventory.applyPendingCounts,
    currentUser,
    inventoryCounts: seed?.inventoryCounts,
  });
  const pos = usePos({
    posProducts: seed?.posProducts ?? initialPosProducts,
    createOrderFromSale: orders.createOrderFromSale,
    deductOrderLines: inventory.deductOrderLines,
    currentUser,
    sales: seed?.sales,
  });

  return (
    <BakeryContext.Provider
      value={{ currentUser, inventory, clients, recipes, production, orders, closing, pos }}
    >
      {children}
    </BakeryContext.Provider>
  );
}

/** The whole store, for a module that legitimately spans several features. */
export function useBakeryStore(): BakeryStore {
  const store = useContext(BakeryContext);
  if (!store) throw new Error("useBakeryStore must be used inside BakeryProvider");
  return store;
}
