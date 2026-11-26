import React, { Suspense, lazy, useEffect, useRef } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router";
import LoginPage from "./components/auth/LoginPage";
import { AnnouncerProvider, useAnnounce } from "./components/common/Announcer";
import RouteFallback from "./components/common/RouteFallback";
import UnknownRoute from "./components/common/UnknownRoute";
import { useAuth } from "./hooks/useAuth";
import { useNavigation } from "./hooks/useNavigation";
import { BakeryProvider } from "./store/BakeryProvider";
import LayoutRoute from "./routes/LayoutRoute";
import { ShellProvider } from "./routes/shell";
import type { ShellContextValue } from "./routes/shell";
import { CHAMS_PATH, PATH_BY_TAB, viewNameFromPath } from "./routes";
import { DEFAULT_TAB, canAccessTab } from "./utils/permissions";

// The shell stays eager; every screen below it arrives as its own chunk on
// first navigation. UnknownRoute stays eager too — the fallback for a bad URL
// should not itself need a round trip.
const AuditLogsRoute = lazy(() => import("./routes/AuditLogsRoute"));
const CalendarRoute = lazy(() => import("./routes/CalendarRoute"));
const ChamsRoute = lazy(() => import("./routes/ChamsRoute"));
const ClientDetailRoute = lazy(() => import("./routes/ClientDetailRoute"));
const ClientsRoute = lazy(() => import("./routes/ClientsRoute"));
const ClosingCountRoute = lazy(() => import("./routes/ClosingCountRoute"));
const DashboardRoute = lazy(() => import("./routes/DashboardRoute"));
const InventoryRoute = lazy(() => import("./routes/InventoryRoute"));
const OrderDetailRoute = lazy(() => import("./routes/OrderDetailRoute"));
const OrdersRoute = lazy(() => import("./routes/OrdersRoute"));
const PosRoute = lazy(() => import("./routes/PosRoute"));
const ProductionRoute = lazy(() => import("./routes/ProductionRoute"));
const RecipeDetailRoute = lazy(() => import("./routes/RecipeDetailRoute"));
const RecipeNewRoute = lazy(() => import("./routes/RecipeNewRoute"));
const RecipesRoute = lazy(() => import("./routes/RecipesRoute"));
const ReconciliationRoute = lazy(() => import("./routes/ReconciliationRoute"));
const ReportsClosingRoute = lazy(() => import("./routes/ReportsClosingRoute"));
const ReportsInventoryRoute = lazy(() => import("./routes/ReportsInventoryRoute"));
const ReportsRoute = lazy(() => import("./routes/ReportsRoute"));
const RolesRoute = lazy(() => import("./routes/RolesRoute"));

/**
 * A route change has to retitle the tab, move focus into the new view and say
 * its name out loud. The first mount is the landing screen, not a navigation:
 * it keeps index.html's title and whatever focus the browser started with.
 */
function ViewAnnouncement() {
  const { pathname } = useLocation();
  const announce = useAnnounce();
  // Seeded with the landing path: the first mount is not a navigation, and
  // StrictMode invoking the mount effect twice still sees the same pathname.
  const lastPathname = useRef(pathname);

  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    const viewName = viewNameFromPath(pathname);
    document.title = `${viewName} — Reid's Bakery HQ`;
    // Main carries tabIndex=-1 and is the landmark the skip link targets.
    document.getElementById("main")?.focus();
    announce(`Navigated to ${viewName}.`);
  }, [pathname, announce]);

  return null;
}

/**
 * The shell: auth, the navigation state, and the route table. Feature state
 * lives in BakeryProvider, above the outlet, so swapping routes never reseeds a
 * hook; every route element reads its own slice.
 */
export default function BakeryCommandCenter() {
  const { users, currentUser, login, logout, getLockedUntil, updateUserRole, setUserActive } =
    useAuth();
  const navigation = useNavigation();
  const navigate = useNavigate();

  if (!currentUser) {
    return <LoginPage onLogin={login} getLockedUntil={getLockedUntil} />;
  }

  const shell: ShellContextValue = {
    currentUser,
    users,
    updateUserRole,
    setUserActive,
    // The tab survives logout because the URL does, so hand the address bar back
    // to the default tab instead of leaving the next sign-in on this one.
    logout: () => {
      logout();
      navigate(PATH_BY_TAB[DEFAULT_TAB], { replace: true });
    },
    ...navigation,
    goToTab: (tab) => {
      if (!canAccessTab(currentUser.role, tab)) return;
      navigate(PATH_BY_TAB[tab]);
      navigation.setIsSidebarOpen(false);
    },
    openPath: (path, options) => navigate(path, options),
  };

  return (
    <AnnouncerProvider>
      <ViewAnnouncement />
      <ShellProvider value={shell}>
        <BakeryProvider currentUser={currentUser}>
          <div
            className={`flex flex-col ${
              navigation.canUseSidebarRail ? "md:flex-row" : ""
            } h-screen bg-[#FDF9F3] font-sans text-[#121212] overflow-hidden relative`}
          >
            <Routes>
              <Route path="/" element={<LayoutRoute />}>
                <Route index element={<DashboardRoute />} />
                <Route path="pos" element={<PosRoute />} />
                <Route path="orders">
                  <Route index element={<OrdersRoute />} />
                  <Route path=":orderId" element={<OrderDetailRoute />} />
                </Route>
                <Route path="clients">
                  <Route index element={<ClientsRoute />} />
                  <Route path=":clientId" element={<ClientDetailRoute />} />
                </Route>
                <Route path="inventory">
                  <Route index element={<InventoryRoute />} />
                  <Route path="closing-count" element={<ClosingCountRoute />} />
                  <Route path="reconciliation" element={<ReconciliationRoute />} />
                </Route>
                <Route path="recipes">
                  <Route index element={<RecipesRoute />} />
                  <Route path="new" element={<RecipeNewRoute />} />
                  <Route path=":recipeId" element={<RecipeDetailRoute />} />
                </Route>
                <Route path="production-runs" element={<ProductionRoute />} />
                <Route path="calendar" element={<CalendarRoute />} />
                <Route path="reports">
                  <Route index element={<ReportsRoute />} />
                  <Route path="closing" element={<ReportsClosingRoute />} />
                  <Route path="inventory" element={<ReportsInventoryRoute />} />
                </Route>
                <Route path="audit-logs" element={<AuditLogsRoute />} />
                <Route path="roles" element={<RolesRoute />} />
                {/* Inside the layout so the sidebar survives a bad URL, and not
                    behind a tab guard: no tab is involved. */}
                <Route path="*" element={<UnknownRoute />} />
              </Route>
              {/* The ledger renders outside the layout, so it owns this boundary. */}
              <Route
                path={CHAMS_PATH}
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <ChamsRoute />
                  </Suspense>
                }
              />
            </Routes>
          </div>
        </BakeryProvider>
      </ShellProvider>
    </AnnouncerProvider>
  );
}
