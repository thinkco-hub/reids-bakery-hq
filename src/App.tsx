import React, { useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router";
import ChamsStockLedger from "./components/chams/ChamsStockLedger";
import LoginPage from "./components/auth/LoginPage";
import Sidebar from "./components/layout/Sidebar";
import MobileTopBar from "./components/layout/MobileTopBar";
import OrderConfirmationModal from "./components/pos/OrderConfirmationModal";
import PosCustomerPicker from "./components/pos/PosCustomerPicker";
import ReceiptModal from "./components/pos/ReceiptModal";
import RestockModal from "./components/inventory/RestockModal";
import ClosingCountForm from "./components/inventory/ClosingCountForm";
import ReconciliationReview from "./components/inventory/ReconciliationReview";
import ReportsDashboard from "./components/reports/ReportsDashboard";
import EndOfDayClosing from "./components/reports/EndOfDayClosing";
import ClosingInventory from "./components/reports/ClosingInventory";
import DashboardView from "./components/views/DashboardView";
import PosView from "./components/views/PosView";
import OrdersView from "./components/views/OrdersView";
import ClientsView from "./components/views/ClientsView";
import InventoryView from "./components/views/InventoryView";
import RecipesView from "./components/views/RecipesView";
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
import { CHAMS_PATH, PATH_BY_TAB, isChamsPath } from "./routes";
import {
  DEFAULT_TAB,
  canAccessChams,
  canAccessIngredients,
  canAccessTab,
} from "./utils/permissions";
import { canUseSidebarRail, isPhoneViewport } from "./utils/responsive";
import type { NavTabId, Order } from "./types/domain";

export default function BakeryCommandCenter() {
  // --- AUTH (src/hooks/useAuth.ts) ---
  const { users, currentUser, login, logout, getLockedUntil, updateUserRole } = useAuth();

  // --- ROLE PERMISSIONS (src/utils/permissions.ts) ---
  const role = currentUser?.role;
  const canView = (tab: NavTabId) => !!role && canAccessTab(role, tab);
  const canViewChams = !!role && canAccessChams(role);

  // --- NAVIGATION (src/hooks/useNavigation.ts) ---
  const {
    activeTab,
    isSidebarOpen,
    setIsSidebarOpen,
    isInventoryExpanded,
    setIsInventoryExpanded,
    isReportsExpanded,
    setIsReportsExpanded,
    windowWidth,
  } = useNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const isOnChams = isChamsPath(location.pathname);

  // Wide, mouse-driven viewports keep the pinned sidebar rail; phones and tablets
  // (including touch devices that report a desktop viewport) use the hamburger
  // drawer, so the top bar and the drawer have to be gated on the same test.
  const isDesktopRail = canUseSidebarRail(windowWidth);
  const isPosRoute = activeTab === "pos";

  // Send the user somewhere they can access when their role no longer allows the
  // route they are on (role changed live, or a different user signed in on a stale tab).
  useEffect(() => {
    if (!role) return;
    const forbidden = isOnChams
      ? !canAccessChams(role)
      : activeTab !== null && !canAccessTab(role, activeTab);
    if (forbidden) navigate(PATH_BY_TAB[DEFAULT_TAB], { replace: true });
  }, [role, isOnChams, activeTab, navigate]);

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

  // --- CLIENTS (src/hooks/useClients.ts) ---
  const {
    clients,
    viewingClient,
    setViewingClient,
    addClient,
    updateClient,
    clearViewingClient,
  } = useClients({ currentUser });
  // --- RECIPES / BOM (src/hooks/useRecipes.ts) ---
  const {
    recipes,
    pricingRules,
    viewingRecipe,
    setViewingRecipe,
    isCreatingRecipe,
    setIsCreatingRecipe,
    saveRecipe,
    cancelRecipeEdit,
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
    viewingOrder,
    setViewingOrder,
    createOrderFromSale,
    editOrder,
    recordOrderPayment,
    advanceOrderStatus,
    scheduleOrderDelivery,
    markOrderDelivered,
    clearViewingOrder,
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
  const lowStockAlerts = [...menuInventory, ...ingredients].filter(
    (item) => item.qty < item.target
  );

  // --- NAVIGATION HANDLERS (compose navigation + feature-owned resets) ---
  // Event-driven on purpose: the three navigation paths clear different things,
  // so a single route-watching effect could only ever express one of them.
  const resetForNavigation = () => {
    clearViewingOrder();
    clearViewingClient();
    setViewingRecipe(null);
    setIsCreatingRecipe(false);
    setIsSidebarOpen(false);
  };

  const handleNavClick = (tab: NavTabId) => {
    if (!canView(tab)) return;
    navigate(PATH_BY_TAB[tab]);
    resetForNavigation();
  };

  const handleViewOrder = (order: Order) => {
    navigate(PATH_BY_TAB.orders);
    setViewingOrder(order);
  };

  const goToProductionRuns = () => {
    if (!canView("production-runs")) return;
    navigate(PATH_BY_TAB["production-runs"]);
    clearViewingOrder();
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

      {/* ADD CUSTOMER TO TICKET (reached from the phone ticket bar and the ticket panel) */}
      {isCustomerPickerOpen && (
        <PosCustomerPicker
          clients={clients}
          attached={ticketCustomer}
          onClose={closeCustomerPicker}
          onAttach={attachTicketCustomer}
          onCreateClient={addClient}
        />
      )}

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
        onNavSelect={resetForNavigation}
      />

      {/* MAIN CONTENT AREA */}
      <main
        className={`flex-1 relative z-10 w-full flex flex-col ${
          isPosRoute
            ? "p-0 overflow-hidden bg-gray-100"
            : "p-4 md:p-8 overflow-y-auto"
        }`}
      >
        {/* Routes render only when the signed-in role may open the tab named by the URL. */}
        {activeTab && canView(activeTab) && <Outlet />}
      </main>
    </>
  );

  const inventoryViewProps = {
    menuInventory,
    ingredients,
    restockReminders,
    canViewIngredients: !!role && canAccessIngredients(role),
    onNavClick: handleNavClick,
    onRestockToProduction: goToProductionRuns,
    onOpenRestock: openRestock,
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
              <DashboardView
                orders={orders}
                clients={clients}
                lowStockAlerts={lowStockAlerts}
                pendingOrdersCount={pendingOrdersCount}
                readyOrdersCount={readyOrdersCount}
                onNavClick={handleNavClick}
                onViewOrder={handleViewOrder}
              />
            }
          />
          <Route
            path="pos"
            element={
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
            }
          />
          <Route
            path="orders"
            element={
              <OrdersView
                orders={orders}
                clients={clients}
                menuInventory={menuInventory}
                viewingOrder={viewingOrder}
                onViewOrder={setViewingOrder}
                onEditOrder={editOrder}
                onAdvanceStatus={advanceOrderStatus}
                onScheduleDelivery={scheduleOrderDelivery}
                onMarkDelivered={markOrderDelivered}
                onRecordPayment={recordOrderPayment}
                onGoToProduction={goToProductionRuns}
              />
            }
          />
          <Route
            path="clients"
            element={
              <ClientsView
                clients={clients}
                orders={orders}
                viewingClient={viewingClient}
                onView={setViewingClient}
                onAdd={addClient}
                onUpdate={updateClient}
                onViewOrder={(order) => {
                  navigate(PATH_BY_TAB.orders);
                  setViewingClient(null);
                  setViewingOrder(order);
                }}
              />
            }
          />
          <Route path="inventory" element={<Outlet />}>
            <Route index element={<InventoryView {...inventoryViewProps} />} />
            <Route
              path="closing-count"
              element={
                <ClosingCountForm
                  menuInventory={menuInventory}
                  ingredients={ingredients}
                  onSubmit={submitClosingCount}
                  onBack={() => handleNavClick("inventory")}
                />
              }
            />
            <Route
              path="reconciliation"
              element={
                <ReconciliationReview
                  counts={inventoryCounts}
                  menuInventory={menuInventory}
                  ingredients={ingredients}
                  onResolve={resolveInventoryCount}
                  onApplyAll={applyAllPendingCounts}
                />
              }
            />
          </Route>
          <Route
            path="recipes"
            element={
              <RecipesView
                recipes={recipes}
                ingredients={ingredients}
                menuInventory={menuInventory}
                pricingRules={pricingRules}
                viewingRecipe={viewingRecipe}
                isCreatingRecipe={isCreatingRecipe}
                onViewRecipe={setViewingRecipe}
                onCreateRecipe={() => setIsCreatingRecipe(true)}
                onEditRule={updatePricingRule}
                onCancelEdit={cancelRecipeEdit}
                onSave={saveRecipe}
              />
            }
          />
          <Route
            path="production-runs"
            element={
              <ProductionView
                productionRuns={productionRuns}
                recipes={recipes}
                menuInventory={menuInventory}
                ingredients={ingredients}
                onSchedule={scheduleProductionRun}
                onComplete={completeProductionRun}
                onDelete={deleteProductionRun}
              />
            }
          />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="reports" element={<Outlet />}>
            <Route
              index
              element={
                <ReportsDashboard
                  sales={sales}
                  onReprintSale={setReceipt}
                  onSaveSaleEdit={editSale}
                />
              }
            />
            <Route
              path="closing"
              element={
                <EndOfDayClosing
                  sales={sales}
                  expenses={expenses}
                  dayClosings={dayClosings}
                  onAddExpense={addExpense}
                  onDeleteExpense={deleteExpense}
                  onCloseDay={closeDay}
                />
              }
            />
            <Route
              path="inventory"
              element={
                <ClosingInventory
                  menuInventory={menuInventory}
                  ingredients={ingredients}
                  inventoryCounts={inventoryCounts}
                />
              }
            />
          </Route>
          <Route path="audit-logs" element={<AuditLogsView />} />
          <Route
            path="roles"
            element={
              <UserManagementView
                users={users}
                currentUser={currentUser}
                onChangeRole={updateUserRole}
              />
            }
          />
        </Route>
        <Route
          path={CHAMS_PATH}
          element={
            canViewChams ? (
              <ChamsStockLedger onSwitchView={() => navigate(PATH_BY_TAB[DEFAULT_TAB])} />
            ) : null
          }
        />
        <Route path="*" element={<Navigate to={PATH_BY_TAB[DEFAULT_TAB]} replace />} />
      </Routes>
    </div>
  );
}
