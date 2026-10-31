import { useState } from "react";
import { initialCatalogue } from "../data/initialCatalogue";
import {
  initialIngredients,
  initialRestockReminders,
} from "../data/initialInventory";
import { recordAuditEvent } from "../utils/auditLog";
import { DEFAULT_POS_COLOR, toPosProducts, trackedItems } from "../utils/catalogue";
import type {
  CatalogueItem,
  IngredientFormData,
  IngredientId,
  IngredientStock,
  InventoryCount,
  InventoryItemCategory,
  MenuItemId,
  OrderItem,
  PricingRuleInput,
  PricingRules,
  Quantity,
  Recipe,
  RecipeIngredientLine,
  RecipeInput,
  RestockCategory,
  RestockModalState,
  RestockReminder,
  RestockReminderData,
  RestockReminderId,
  User,
} from "../types/domain";

const EMPTY_RESTOCK_MODAL: RestockModalState = {
  isOpen: false,
  category: "menu",
  selectedItemId: "",
  amountToAdd: "",
};

// Monotonic ID counters, seeded past the highest seeded record so new IDs keep
// the display formats (ING-xx, RR-xxx) and never collide — even after deletes.
let nextIngredientSeq = initialIngredients.length + 1;
const nextIngredientId = (): IngredientId =>
  `ING-${String(nextIngredientSeq++).padStart(2, "0")}`;

let nextReminderSeq = initialRestockReminders.length + 1;
const nextReminderId = (): RestockReminderId =>
  `RR-${String(nextReminderSeq++).padStart(3, "0")}`;

interface UseCatalogueOptions {
  currentUser: User | null;
  /** Seeded collections; a test fixture replaces the values from src/data. */
  catalogue?: CatalogueItem[];
  ingredients?: IngredientStock[];
  restockReminders?: RestockReminder[];
}

/**
 * Owns the menu catalogue and the raw-material stock beside it: one record per
 * menu item carries its recipe detail, POS presentation and finished-goods
 * stock, so a recipe edit and a POS price are the same write. Stock movements
 * target catalogue ids and skip untracked items, whose goods never enter stock.
 */
export function useCatalogue({
  currentUser,
  catalogue: seededCatalogue,
  ingredients: seededIngredients,
  restockReminders: seededRestockReminders,
}: UseCatalogueOptions) {
  const [catalogue, setCatalogue] = useState<CatalogueItem[]>(
    seededCatalogue ?? initialCatalogue
  );
  const [pricingRules, setPricingRules] = useState<PricingRules>({
    targetMarginPercent: 40,
  });
  const [ingredients, setIngredients] = useState<IngredientStock[]>(
    seededIngredients ?? initialIngredients
  );
  const [restockReminders, setRestockReminders] = useState<RestockReminder[]>(
    seededRestockReminders ?? initialRestockReminders
  );
  const [restockModal, setRestockModal] = useState<RestockModalState>(EMPTY_RESTOCK_MODAL);

  const stockItems = trackedItems(catalogue);
  const posProducts = toPosProducts(catalogue);

  // --- RECIPES (FR-1.1, FR-2.x) ---
  const saveRecipe = (recipe: RecipeInput) => {
    const existing = catalogue.find((item) => item.id === recipe.id);
    const savedId = existing
      ? (recipe.id as string)
      : `REC-${String(catalogue.length + 1).padStart(2, "0")}`;

    setCatalogue((prev) => {
      if (existing) {
        // A recipe edit rewrites the catalogue record in place; the POS swatch
        // and stock participation belong to the record, not the editor form.
        return prev.map((item) =>
          item.id === recipe.id
            ? {
                ...(recipe as Recipe),
                id: item.id,
                color: item.color,
                trackedStock: item.trackedStock,
              }
            : item
        );
      }
      return [
        ...prev,
        { ...(recipe as Recipe), id: savedId, color: DEFAULT_POS_COLOR, trackedStock: true },
      ];
    });

    if (currentUser) {
      recordAuditEvent({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: "recipe.saved",
        entityType: "Recipe",
        entityId: savedId,
        details: `${existing ? "Updated" : "Created"} recipe ${savedId} (${recipe.name})`,
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

  // --- STOCK MOVEMENTS (consumed by orders, production and closing) ---

  const setMenuQty = (id: string, qty: (prev: Quantity) => Quantity) => {
    setCatalogue((prev) =>
      prev.map((item) =>
        item.id === id && item.trackedStock ? { ...item, qty: qty(item.qty) } : item
      )
    );
  };

  const setIngredientQty = (id: string, qty: (prev: Quantity) => Quantity) => {
    setIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: qty(item.qty) } : item))
    );
  };

  // Deducts the menu items of a delivered order (FR-8). Untracked items have no
  // stock row to move.
  const deductOrderLines = (lines: OrderItem[]) => {
    setCatalogue((prev) =>
      prev.map((item) => {
        if (!item.trackedStock) return item;
        const line = lines.find((l) => l.menuItemId === item.id);
        if (!line) return item;
        return { ...item, qty: Math.max(0, item.qty - line.qty) };
      })
    );
  };

  // Deducts the ingredients consumed by the batches of a completed run (FR-8).
  const deductRecipeLines = (lines: RecipeIngredientLine[], batches: number) => {
    setIngredients((prev) =>
      prev.map((item) => {
        const line = lines.find((l) => l.ingredientId === item.id);
        if (!line) return item;
        return { ...item, qty: Math.max(0, item.qty - line.qty * batches) };
      })
    );
  };

  // Adds completed production yield to a menu item's stock (FR-8).
  const addMenuStock = (menuItemId: MenuItemId, amount: number) => {
    setMenuQty(menuItemId, (qty) => qty + amount);
  };

  // Applies a resolved count to system stock (FR-4.5).
  const applyCountedQty = (
    itemType: InventoryItemCategory,
    itemId: string,
    countedQty: number
  ) => {
    if (itemType === "menu") {
      setMenuQty(itemId, () => countedQty);
    } else {
      setIngredientQty(itemId, () => countedQty);
    }
  };

  // Bulk-applies pending reconciliation counts (FR-4.5).
  const applyPendingCounts = (pending: InventoryCount[]) => {
    const menuCounts = pending.filter((count) => count.itemType === "menu");
    if (menuCounts.length > 0) {
      setCatalogue((prev) =>
        prev.map((item) => {
          if (!item.trackedStock) return item;
          const count = menuCounts.find((c) => c.itemId === item.id);
          return count ? { ...item, qty: count.countedQty } : item;
        })
      );
    }

    const ingredientCounts = pending.filter((count) => count.itemType === "ingredient");
    if (ingredientCounts.length > 0) {
      setIngredients((prev) =>
        prev.map((item) => {
          const count = ingredientCounts.find((c) => c.itemId === item.id);
          return count ? { ...item, qty: count.countedQty } : item;
        })
      );
    }
  };

  const logInventoryEvent = (
    action: "inventory.ingredient_added" | "inventory.ingredient_updated" | "inventory.restocked",
    entityId: string,
    details: string
  ) => {
    if (!currentUser) return;
    recordAuditEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType: "Inventory",
      entityId,
      details,
    });
  };

  // --- RESTOCKING (FR-1.2) ---
  const openRestock = (category: RestockCategory, itemId = "") => {
    const items = category === "menu" ? stockItems : ingredients;
    const defaultId = itemId || items[0].id;
    setRestockModal({
      isOpen: true,
      category: category,
      selectedItemId: defaultId,
      amountToAdd: "",
    });
  };

  const submitRestock = () => {
    const amount = parseInt(restockModal.amountToAdd);
    if (isNaN(amount) || amount <= 0) return;

    const setQty = restockModal.category === "menu" ? setMenuQty : setIngredientQty;
    setQty(restockModal.selectedItemId, (qty) => qty + amount);
    logInventoryEvent(
      "inventory.restocked",
      restockModal.selectedItemId,
      `Restocked ${restockModal.selectedItemId} (${restockModal.category}) by ${amount}`
    );

    setRestockModal(EMPTY_RESTOCK_MODAL);
  };

  const handleRestockQuickAdd = (delta: number) => {
    setRestockModal({
      ...restockModal,
      amountToAdd: (parseInt(restockModal.amountToAdd || "0") + delta).toString(),
    });
  };

  const closeRestockModal = () => {
    setRestockModal(EMPTY_RESTOCK_MODAL);
  };

  // --- INGREDIENTS & RESTOCK REMINDERS (FR-1.2) ---
  const addIngredient = (data: IngredientFormData) => {
    const id = nextIngredientId();
    setIngredients((prev) => [...prev, { id, type: "Ingredient", ...data }]);
    logInventoryEvent("inventory.ingredient_added", id, `Added ingredient ${id} (${data.name})`);
  };

  const updateIngredient = (id: string, data: Partial<IngredientStock>) => {
    setIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    logInventoryEvent("inventory.ingredient_updated", id, `Updated ingredient ${id}`);
  };

  const addRestockReminder = (data: RestockReminderData) => {
    setRestockReminders((prev) => [
      ...prev,
      { id: nextReminderId(), done: false, ...data },
    ]);
  };

  const toggleReminderDone = (id: string) => {
    setRestockReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r))
    );
  };

  // --- DERIVED VALUES ---
  const restockItems = restockModal.category === "menu" ? stockItems : ingredients;
  const isRestockConfirmDisabled =
    !restockModal.amountToAdd || parseInt(restockModal.amountToAdd) <= 0;

  return {
    catalogue,
    stockItems,
    posProducts,
    pricingRules,
    saveRecipe,
    updatePricingRule,
    ingredients,
    restockReminders,
    restockModal,
    setRestockModal,
    addIngredient,
    updateIngredient,
    addRestockReminder,
    toggleReminderDone,
    openRestock,
    handleRestockQuickAdd,
    closeRestockModal,
    submitRestock,
    restockItems,
    isRestockConfirmDisabled,
    deductOrderLines,
    deductRecipeLines,
    addMenuStock,
    applyCountedQty,
    applyPendingCounts,
  };
}
