import React, { createContext } from "react";
import { useCatalogue } from "../hooks/useCatalogue";
import { useClients } from "../hooks/useClients";
import { useClosing } from "../hooks/useClosing";
import { useOrders } from "../hooks/useOrders";
import { usePos } from "../hooks/usePos";
import { useProduction } from "../hooks/useProduction";
import type {
  CatalogueItem,
  Client,
  IngredientStock,
  InventoryCount,
  Order,
  ProductionRun,
  RestockReminder,
  Sale,
  User,
} from "../types/domain";

/**
 * The collections a test fixture may replace. The app passes no seed, so every
 * hook starts from src/data exactly as it did when the shell called it.
 */
export interface BakerySeed {
  catalogue?: CatalogueItem[];
  ingredients?: IngredientStock[];
  restockReminders?: RestockReminder[];
  clients?: Client[];
  productionRuns?: ProductionRun[];
  orders?: Order[];
  inventoryCounts?: InventoryCount[];
  sales?: Sale[];
}

export type CatalogueSlice = ReturnType<typeof useCatalogue>;
export type ClientsSlice = ReturnType<typeof useClients>;
export type ProductionSlice = ReturnType<typeof useProduction>;
export type OrdersSlice = ReturnType<typeof useOrders>;
export type ClosingSlice = ReturnType<typeof useClosing>;
export type PosSlice = ReturnType<typeof usePos>;

/**
 * One context per slice, each holding the hook's memoized object. A feature
 * writing its own state invalidates only the slices that changed, so a POS
 * search keystroke cannot re-render the inventory or orders screens.
 */
export const CurrentUserContext = createContext<User | null>(null);
export const CatalogueContext = createContext<CatalogueSlice | null>(null);
export const ClientsContext = createContext<ClientsSlice | null>(null);
export const ProductionContext = createContext<ProductionSlice | null>(null);
export const OrdersContext = createContext<OrdersSlice | null>(null);
export const ClosingContext = createContext<ClosingSlice | null>(null);
export const PosContext = createContext<PosSlice | null>(null);

interface BakeryProviderProps {
  currentUser: User;
  seed?: BakerySeed;
  children: React.ReactNode;
}

/**
 * Calls every feature hook once and exposes the slices. It lives above the
 * router outlet, so swapping routes changes what reads the state, never the
 * state itself. The hooks are ordered by dependency: the catalogue feeds stock
 * movements to orders, production and closing, and the POS reads its products
 * from the same records.
 */
export function BakeryProvider({ currentUser, seed, children }: BakeryProviderProps) {
  const catalogue = useCatalogue({
    currentUser,
    catalogue: seed?.catalogue,
    ingredients: seed?.ingredients,
    restockReminders: seed?.restockReminders,
  });
  const clients = useClients({ currentUser, clients: seed?.clients });
  const production = useProduction({
    recipes: catalogue.stockItems,
    deductRecipeLines: catalogue.deductRecipeLines,
    addMenuStock: catalogue.addMenuStock,
    currentUser,
    productionRuns: seed?.productionRuns,
  });
  const orders = useOrders({
    deductOrderLines: catalogue.deductOrderLines,
    currentUser,
    orders: seed?.orders,
  });
  const closing = useClosing({
    applyCountedQty: catalogue.applyCountedQty,
    applyPendingCounts: catalogue.applyPendingCounts,
    currentUser,
    inventoryCounts: seed?.inventoryCounts,
  });
  const pos = usePos({
    posProducts: catalogue.posProducts,
    createOrderFromSale: orders.createOrderFromSale,
    deductOrderLines: catalogue.deductOrderLines,
    currentUser,
    sales: seed?.sales,
  });

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <CatalogueContext.Provider value={catalogue}>
        <ClientsContext.Provider value={clients}>
          <ProductionContext.Provider value={production}>
            <OrdersContext.Provider value={orders}>
              <ClosingContext.Provider value={closing}>
                <PosContext.Provider value={pos}>{children}</PosContext.Provider>
              </ClosingContext.Provider>
            </OrdersContext.Provider>
          </ProductionContext.Provider>
        </ClientsContext.Provider>
      </CatalogueContext.Provider>
    </CurrentUserContext.Provider>
  );
}
