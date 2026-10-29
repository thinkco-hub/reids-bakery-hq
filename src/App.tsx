import React from "react";
import { Outlet, Route, Routes, useNavigate } from "react-router";
import ChamsStockLedger from "./components/chams/ChamsStockLedger";
import { RequireChams, RequireTab } from "./components/RequireAccess";
import UnknownRoute from "./components/common/UnknownRoute";
import LoginPage from "./components/auth/LoginPage";
import Sidebar from "./components/layout/Sidebar";
import MobileTopBar from "./components/layout/MobileTopBar";
import OrderConfirmationModal from "./components/pos/OrderConfirmationModal";
import PosCustomerPicker from "./components/pos/PosCustomerPicker";
import TicketCustomerInput from "./components/pos/TicketCustomerInput";
import ReceiptModal from "./components/pos/ReceiptModal";
import RestockModal from "./components/inventory/RestockModal";
import ClosingCountForm from "./components/inventory/ClosingCountForm";
import ReconciliationReview from "./components/inventory/ReconciliationReview";
import ReportsDashboard from "./components/reports/ReportsDashboard";
import EndOfDayClosing from "./components/reports/EndOfDayClosing";
import ClosingInventory from "./components/reports/ClosingInventory";
import DashboardView from "./components/views/DashboardView";
import PosView from "./components/views/PosView";
import OrderDetailRoute from "./components/orders/OrderDetailRoute";
import OrdersList from "./components/orders/OrdersList";
import ClientDetailRoute from "./components/clients/ClientDetailRoute";
import ClientsList from "./components/clients/ClientsList";
import InventoryView from "./components/views/InventoryView";
import RecipeDetailRoute from "./components/recipes/RecipeDetailRoute";
import RecipeEditor from "./components/recipes/RecipeEditor";
import RecipesList from "./components/recipes/RecipesList";
import ProductionView from "./components/views/ProductionView";
import CalendarView from "./components/views/CalendarView";
import AuditLogsView from "./components/views/AuditLogsView";
import UserManagementView from "./components/views/UserManagementView";
import { initialPosProducts } from "./data/initialProducts";
import { useNavigation } from "./hooks/useNavigation";
import { useClients } from "./hooks/useClients";
import { useInventory } from "./hooks/useInventory";
import { useRecipes } from "./hooks/useRecipes";
import { useProduction } from "./hooks/useProduction";
import { useOrders } from "./hooks/useOrders";
import { useClosing } from "./hooks/useClosing";
import { usePos } from "./hooks/usePos";
import { useAuth } from "./hooks/useAuth";
import { CHAMS_PATH, PATH_BY_TAB, orderPath } from "./routes";
import {
  DEFAULT_TAB,
  canAccessIngredients,
  canAccessTab,
  canViewRecipeCosts,
} from "./utils/permissions";
import { canUseSidebarRail, isPhoneViewport } from "./utils/responsive";
import type { NavTabId, Order, RecipeInput } from "./types/domain";

export default function BakeryCommandCenter() {
  // --- AUTH (src/hooks/useAuth.ts) ---
  const { users, currentUser, login, logout, getLockedUntil, updateUserRole, setUserActive } =
    useAuth();

  // --- ROLE PERMISSIONS (src/utils/permissions.ts) ---
  const role = currentUser?.role;
  const canView = (tab: NavTabId) => !!role && canAccessTab(role, tab);
  const canViewIngredients = !!role && canAccessIngredients(role);
  const canViewIngredientCosts = !!role && canViewRecipeCosts(role);

  // --- NAVIGATION (src/hooks/useNavigation.ts) ---
  const {
    activeTab,
    backToList,
    isSidebarOpen,
    setIsSidebarOpen,
    isInventoryExpanded,
    setIsInventoryExpanded,
    isReportsExpanded,
    setIsReportsExpanded,
    windowWidth,
  } = useNavigation();
  const navigate = useNavigate();

  // Wide, mouse-driven viewports keep the pinned sidebar rail; phones and tablets
  // (including touch devices that report a desktop viewport) use the hamburger
  // drawer, so the top bar and the drawer have to be gated on the same test.
  const isDesktopRail = canUseSidebarRail(windowWidth);
  const isPosRoute = activeTab === "pos";

  // --- INVENTORY (src/hooks/useInventory.ts) ---
  const inventory = useInventory({ currentUser });
  const {
    menuInventory,
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
  } = inventory;

  // Raw-material stock reaches every screen through one projection, and its
  // default is no rows: a screen added later cannot disclose unit costs by
  // forgetting to ask. The full array stays with the admin-tier Reconciliation
  // screen and with the two tools that need an ingredient's identity to do their
  // job — production runs and the recipe editor — where the money derived from
  // unit cost is suppressed by canViewIngredientCosts instead.
  const visibleIngredients = canViewIngredients ? ingredients : [];

  // --- CLIENTS (src/hooks/useClients.ts) ---
  const {
    clients,
    addClient,
    updateClient,
  } = useClients({ currentUser });
  // --- RECIPES / BOM (src/hooks/useRecipes.ts) ---
  const {
    recipes,
    pricingRules,
    saveRecipe,
    updatePricingRule,
  } = useRecipes({ currentUser });

  // --- PRODUCTION RUNS (src/hooks/useProduction.ts) ---
  const {
    productionRuns,
    scheduleProductionRun,
    completeProductionRun,
    deleteProductionRun,
  } = useProduction({
    recipes,
    deductRecipeLines: inventory.deductRecipeLines,
    addMenuStock: inventory.addMenuStock,
    currentUser,
  });

  // --- ORDERS (src/hooks/useOrders.ts) ---
  const ordersState = useOrders({ deductOrderLines: inventory.deductOrderLines, currentUser });
  const {
    orders,
    createOrderFromSale,
    editOrder,
    recordOrderPayment,
    advanceOrderStatus,
    scheduleOrderDelivery,
    markOrderDelivered,
  } = ordersState;

  // --- INVENTORY COUNTS, EXPENSES & END-OF-DAY CLOSING (src/hooks/useClosing.ts) ---
  const {
    inventoryCounts,
    expenses,
    dayClosings,
    submitClosingCount,
    resolveInventoryCount,
    applyAllPendingCounts,
    addExpense,
    deleteExpense,
    closeDay,
  } = useClosing({
    applyCountedQty: inventory.applyCountedQty,
    applyPendingCounts: inventory.applyPendingCounts,
    currentUser,
  });

  // --- POS (src/hooks/usePos.ts) ---
  const pos = usePos({
    posProducts: initialPosProducts,
    createOrderFromSale,
    currentUser,
    deductOrderLines: inventory.deductOrderLines,
  });
  const {
    posCategory,
    setPosCategory,
    posSearch,
    setPosSearch,
    filteredPosProducts,
    addToCart,
    cart,
    adjustCartQty,
    clearTicket,
    isTicketViewOpen,
    openTicketView,
    closeTicketView,
    ticketCustomer,
    attachTicketCustomer,
    clearTicketCustomer,
    isCustomerPickerOpen,
    openCustomerPicker,
    closeCustomerPicker,
    openConfirmModal,
    cartSubtotal,
    cartTax,
    cartTotal,
    cartQty,
    confirmModal,
    updateConfirmField,
    setSaleType,
    closeConfirmModal,
    completeSale,
    editSale,
    sales,
    receipt,
    setReceipt,
    todayISO,
    isConfirmOrderDisabled,
  } = pos;

  // --- DERIVED CROSS-FEATURE VALUES (dashboard) ---
  const pendingOrdersCount = orders.filter(
    (o) => o.status === "Pending"
  ).length;
  const readyOrdersCount = orders.filter((o) => o.status === "Ready").length;
  const lowStockAlerts = [...menuInventory, ...visibleIngredients].filter(
    (item) => item.qty < item.target
  );

  // --- NAVIGATION HANDLERS ---
  // Still event-driven, because there is nothing left to unwind: opening a
  // record is a navigate() and nothing else, so no route-watching effect could
  // express more than these two calls already do.
  const handleNavClick = (tab: NavTabId) => {
    if (!canView(tab)) return;
    navigate(PATH_BY_TAB[tab]);
    // The drawer is the one thing navigation still has to close: it is shell
    // state with no URL of its own.
    setIsSidebarOpen(false);
  };

  const handleViewOrder = (order: Order) => {
    navigate(orderPath(order.id));
  };

  const goToProductionRuns = () => {
    if (!canView("production-runs")) return;
    navigate(PATH_BY_TAB["production-runs"]);
  };

  // Both editor routes save and leave for the list. The replace is load-bearing:
  // without it browser Back walks into an editor that already saved.
  const saveRecipeAndReturn = (recipe: RecipeInput) => {
    saveRecipe(recipe);
    navigate(PATH_BY_TAB.recipes, { replace: true });
  };

  // The tab survives logout because the URL does, so hand the address bar back
  // to the default tab instead of leaving the next sign-in on this one.
  const handleLogout = () => {
    logout();
    navigate(PATH_BY_TAB[DEFAULT_TAB], { replace: true });
  };

  if (!currentUser) {
    return <LoginPage onLogin={login} getLockedUntil={getLockedUntil} />;
  }

  // The shell is the layout route: it owns the overlays and every feature hook,
  // so a navigation swaps only the outlet below them and never reseeds a hook.
  const shell = (
    <>
      {/* RESTOCK MODAL (extracted to src/components/inventory/RestockModal.tsx) */}
      {restockModal.isOpen && (
        <RestockModal
          modal={restockModal}
          items={restockItems}
          onItemChange={(itemId) =>
            setRestockModal({ ...restockModal, selectedItemId: itemId })
          }
          onAmountChange={(amount) =>
            setRestockModal({ ...restockModal, amountToAdd: amount })
          }
          onQuickAdd={handleRestockQuickAdd}
          onClose={closeRestockModal}
          onConfirm={submitRestock}
          disabled={isRestockConfirmDisabled}
        />
      )}

      {/* ORDER CONFIRMATION MODAL (extracted to src/components/pos/OrderConfirmationModal.tsx) */}
      {confirmModal.isOpen && (
        <OrderConfirmationModal
          modal={confirmModal}
          cart={cart}
          cartTotal={cartTotal}
          todayISO={todayISO}
          onFieldChange={updateConfirmField}
          onSaleTypeChange={setSaleType}
          onClose={closeConfirmModal}
          onConfirm={completeSale}
          disabled={isConfirmOrderDisabled}
        />
      )}

      {/* RECEIPT MODAL (extracted to src/components/pos/ReceiptModal.tsx) */}
      {receipt && <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />}

      {/* ADD CUSTOMER TO TICKET (reached from the phone ticket bar and the ticket panel)
          RequireAccess cannot guard this one: the overlay is a sibling of the
          outlet, not inside it, so the roster is gated here on the same tab the
          sidebar uses. A role without it types the customer instead. */}
      {isCustomerPickerOpen &&
        (canView("clients") ? (
          <PosCustomerPicker
            clients={clients}
            attached={ticketCustomer}
            onClose={closeCustomerPicker}
            onAttach={attachTicketCustomer}
            onCreateClient={addClient}
          />
        ) : (
          <TicketCustomerInput
            attached={ticketCustomer}
            onClose={closeCustomerPicker}
            onAttach={attachTicketCustomer}
          />
        ))}

      {/* TOP BAR — drawer layouts only (phone and tablet) */}
      {!isDesktopRail && (
        <MobileTopBar
          onOpenMobileNav={() => setIsSidebarOpen(true)}
          pos={
            isPosRoute && isPhoneViewport(windowWidth)
              ? {
                  ticketCount: cartQty,
                  customer: ticketCustomer,
                  onAddCustomer: openCustomerPicker,
                  onClearTicket: clearTicket,
                }
              : null
          }
        />
      )}

      {/* SIDEBAR (extracted to src/components/layout/Sidebar.tsx) */}
      <Sidebar
        currentUser={currentUser}
        onLogout={handleLogout}
        windowWidth={windowWidth}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isInventoryExpanded={isInventoryExpanded}
        setIsInventoryExpanded={setIsInventoryExpanded}
        isReportsExpanded={isReportsExpanded}
        setIsReportsExpanded={setIsReportsExpanded}
        onNavSelect={() => setIsSidebarOpen(false)}
      />

      {/* MAIN CONTENT AREA */}
      <main
        className={`flex-1 relative z-10 w-full flex flex-col ${
          isPosRoute
            ? "p-0 overflow-hidden bg-gray-100"
            : "p-4 md:p-8 overflow-y-auto"
        }`}
      >
        {/* Each route guards its own tab; see src/components/RequireAccess.tsx. */}
        <Outlet />
      </main>
    </>
  );

  const inventoryViewProps = {
    menuInventory,
    ingredients: visibleIngredients,
    restockReminders,
    canViewIngredients,
    onNavClick: handleNavClick,
    onOpenRestock: openRestock,
    onScheduleRun: goToProductionRuns,
    onAddIngredient: addIngredient,
    onUpdateIngredient: updateIngredient,
    onAddReminder: addRestockReminder,
    onToggleReminderDone: toggleReminderDone,
  };

  return (
    <div
      className={`flex flex-col ${
        isDesktopRail ? "md:flex-row" : ""
      } h-screen bg-[#FDF9F3] font-sans text-[#121212] overflow-hidden relative`}
    >
      <Routes>
        <Route path="/" element={shell}>
          <Route
            index
            element={
              <RequireTab role={role} tab="dashboard">
                <DashboardView
                  orders={orders}
                  clients={clients}
                  sales={sales}
                  lowStockAlerts={lowStockAlerts}
                  pendingOrdersCount={pendingOrdersCount}
                  readyOrdersCount={readyOrdersCount}
                  onNavClick={handleNavClick}
                  onViewOrder={handleViewOrder}
                />
              </RequireTab>
            }
          />
          <Route
            path="pos"
            element={
              <RequireTab role={role} tab="pos">
                <PosView
                  posCategory={posCategory}
                  setPosCategory={setPosCategory}
                  posSearch={posSearch}
                  setPosSearch={setPosSearch}
                  filteredPosProducts={filteredPosProducts}
                  addToCart={addToCart}
                  cart={cart}
                  adjustCartQty={adjustCartQty}
                  isTicketViewOpen={isTicketViewOpen}
                  openTicketView={openTicketView}
                  closeTicketView={closeTicketView}
                  clearTicket={clearTicket}
                  cartSubtotal={cartSubtotal}
                  cartTax={cartTax}
                  cartTotal={cartTotal}
                  customer={ticketCustomer}
                  onRemoveCustomer={clearTicketCustomer}
                  onAddCustomer={openCustomerPicker}
                  openConfirmModal={openConfirmModal}
                />
              </RequireTab>
            }
          />
          <Route path="orders" element={<Outlet />}>
            <Route
              index
              element={
                <RequireTab role={role} tab="orders">
                  <OrdersList
                    orders={orders}
                    clients={clients}
                    menuInventory={menuInventory}
                    onView={(order) => navigate(orderPath(order.id))}
                  />
                </RequireTab>
              }
            />
            <Route
              path=":orderId"
              element={
                <RequireTab role={role} tab="orders">
                  <OrderDetailRoute
                    orders={orders}
                    clients={clients}
                    menuInventory={menuInventory}
                    onEditOrder={editOrder}
                    onAdvanceStatus={advanceOrderStatus}
                    onScheduleDelivery={scheduleOrderDelivery}
                    onMarkDelivered={markOrderDelivered}
                    onRecordPayment={recordOrderPayment}
                    onGoToProduction={goToProductionRuns}
                    onBack={() => backToList(PATH_BY_TAB.orders)}
                  />
                </RequireTab>
              }
            />
          </Route>
          <Route path="clients" element={<Outlet />}>
            <Route
              index
              element={
                <RequireTab role={role} tab="clients">
                  <ClientsList
                    clients={clients}
                    orders={orders}
                    onAdd={addClient}
                    onUpdate={updateClient}
                    onView={(client) => navigate(`${PATH_BY_TAB.clients}/${client.id}`)}
                  />
                </RequireTab>
              }
            />
            <Route
              path=":clientId"
              element={
                <RequireTab role={role} tab="clients">
                  <ClientDetailRoute
                    clients={clients}
                    orders={orders}
                    onBack={() => backToList(PATH_BY_TAB.clients)}
                    onViewOrder={(order) => navigate(orderPath(order.id))}
                  />
                </RequireTab>
              }
            />
          </Route>
          <Route path="inventory" element={<Outlet />}>
            <Route
              index
              element={
                <RequireTab role={role} tab="inventory">
                  <InventoryView {...inventoryViewProps} />
                </RequireTab>
              }
            />
            <Route
              path="closing-count"
              element={
                <RequireTab role={role} tab="inventory-closing-count">
                  <ClosingCountForm
                    menuInventory={menuInventory}
                    ingredients={visibleIngredients}
                    onSubmit={submitClosingCount}
                    onBack={() => handleNavClick("inventory")}
                  />
                </RequireTab>
              }
            />
            <Route
              path="reconciliation"
              element={
                <RequireTab role={role} tab="inventory-reconciliation">
                  <ReconciliationReview
                    counts={inventoryCounts}
                    menuInventory={menuInventory}
                    ingredients={ingredients}
                    onResolve={resolveInventoryCount}
                    onApplyAll={applyAllPendingCounts}
                  />
                </RequireTab>
              }
            />
          </Route>
          <Route path="recipes" element={<Outlet />}>
            <Route
              index
              element={
                <RequireTab role={role} tab="recipes">
                  <RecipesList
                    recipes={recipes}
                    ingredients={visibleIngredients}
                    canViewIngredientCosts={canViewIngredientCosts}
                    menuInventory={menuInventory}
                    pricingRules={pricingRules}
                    onEditRule={updatePricingRule}
                    onEdit={(recipe) => navigate(`${PATH_BY_TAB.recipes}/${recipe.id}`)}
                    onCreate={() => navigate(`${PATH_BY_TAB.recipes}/new`)}
                  />
                </RequireTab>
              }
            />
            <Route
              path="new"
              element={
                <RequireTab role={role} tab="recipes">
                  <RecipeEditor
                    recipe={null}
                    ingredients={ingredients}
                    canViewIngredientCosts={canViewIngredientCosts}
                    pricingRules={pricingRules}
                    onCancel={() => backToList(PATH_BY_TAB.recipes)}
                    onSave={saveRecipeAndReturn}
                  />
                </RequireTab>
              }
            />
            <Route
              path=":recipeId"
              element={
                <RequireTab role={role} tab="recipes">
                  <RecipeDetailRoute
                    recipes={recipes}
                    ingredients={ingredients}
                    canViewIngredientCosts={canViewIngredientCosts}
                    pricingRules={pricingRules}
                    onSave={saveRecipeAndReturn}
                    onCancel={() => backToList(PATH_BY_TAB.recipes)}
                    onBack={() => backToList(PATH_BY_TAB.recipes)}
                  />
                </RequireTab>
              }
            />
          </Route>
          <Route
            path="production-runs"
            element={
              <RequireTab role={role} tab="production-runs">
                <ProductionView
                  productionRuns={productionRuns}
                  recipes={recipes}
                  menuInventory={menuInventory}
                  ingredients={ingredients}
                  onSchedule={scheduleProductionRun}
                  onComplete={completeProductionRun}
                  onDelete={deleteProductionRun}
                />
              </RequireTab>
            }
          />
          <Route
            path="calendar"
            element={
              <RequireTab role={role} tab="calendar">
                <CalendarView />
              </RequireTab>
            }
          />
          <Route path="reports" element={<Outlet />}>
            <Route
              index
              element={
                <RequireTab role={role} tab="reports-dashboard">
                  <ReportsDashboard
                    sales={sales}
                    onReprintSale={setReceipt}
                    onSaveSaleEdit={editSale}
                  />
                </RequireTab>
              }
            />
            <Route
              path="closing"
              element={
                <RequireTab role={role} tab="reports-closing">
                  <EndOfDayClosing
                    sales={sales}
                    expenses={expenses}
                    dayClosings={dayClosings}
                    onAddExpense={addExpense}
                    onDeleteExpense={deleteExpense}
                    onCloseDay={closeDay}
                  />
                </RequireTab>
              }
            />
            <Route
              path="inventory"
              element={
                <RequireTab role={role} tab="reports-inventory">
                  <ClosingInventory
                    menuInventory={menuInventory}
                    ingredients={visibleIngredients}
                    inventoryCounts={inventoryCounts}
                  />
                </RequireTab>
              }
            />
          </Route>
          <Route
            path="audit-logs"
            element={
              <RequireTab role={role} tab="audit-logs">
                <AuditLogsView />
              </RequireTab>
            }
          />
          <Route
            path="roles"
            element={
              <RequireTab role={role} tab="user-management">
                <UserManagementView
                  users={users}
                  currentUser={currentUser}
                  onChangeRole={updateUserRole}
                  onSetActive={setUserActive}
                />
              </RequireTab>
            }
          />
          {/* Inside the layout so the sidebar and header survive a bad URL, and
              not behind RequireTab: no tab is involved, and a guard would bounce
              this back to the redirect this route replaces. */}
          <Route path="*" element={<UnknownRoute />} />
        </Route>
        <Route
          path={CHAMS_PATH}
          element={
            <RequireChams role={role}>
              <ChamsStockLedger onSwitchView={() => navigate(PATH_BY_TAB[DEFAULT_TAB])} />
            </RequireChams>
          }
        />
      </Routes>
    </div>
  );
}
