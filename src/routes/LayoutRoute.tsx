import React, { Suspense, useCallback, useMemo, useRef } from "react";
import { Outlet } from "react-router";
import MobileTopBar from "../components/layout/MobileTopBar";
import RouteFallback from "../components/common/RouteFallback";
import Sidebar from "../components/layout/Sidebar";
import { usePosSlice } from "../store/slices";
import { useShell } from "./shell";

/**
 * The layout route: it stays mounted while its outlet swaps, so it owns the
 * chrome and the ticket header the mobile bar reads. Feature overlays belong
 * to the route that opens them, not here.
 */
export default function LayoutRoute() {
  const {
    currentUser,
    logout,
    activeTab,
    isSidebarOpen,
    setIsSidebarOpen,
    isInventoryExpanded,
    setIsInventoryExpanded,
    isReportsExpanded,
    setIsReportsExpanded,
    canUseSidebarRail: isDesktopRail,
    isPhoneViewport,
  } = useShell();
  const { cartQty, ticketCustomer, openCustomerPicker, clearTicket } = usePosSlice();

  // The drawer hands focus back to the control that opened it, which lives in
  // the top bar rather than in the sidebar.
  const navTriggerRef = useRef<HTMLButtonElement>(null);

  // The shell's predicate is the one test both the top bar and the drawer use:
  // wide mouse viewports keep the pinned rail; phones and tablets, including
  // touch devices reporting a desktop viewport, get the hamburger drawer.
  const isPosRoute = activeTab === "pos";

  // The chrome is memoized, so its props have to keep their identity across a
  // route re-render; an inline arrow here would re-commit the whole sidebar.
  const openMobileNav = useCallback(() => setIsSidebarOpen(true), [setIsSidebarOpen]);
  const closeMobileNav = useCallback(() => setIsSidebarOpen(false), [setIsSidebarOpen]);
  const ticket = useMemo(
    () =>
      isPosRoute && isPhoneViewport
        ? {
            ticketCount: cartQty,
            customer: ticketCustomer,
            onAddCustomer: openCustomerPicker,
            onClearTicket: clearTicket,
          }
        : null,
    [isPosRoute, isPhoneViewport, cartQty, ticketCustomer, openCustomerPicker, clearTicket]
  );

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-[#562D07] focus:px-4 focus:py-2 focus:font-bold focus:text-white"
      >
        Skip to main content
      </a>

      {!isDesktopRail && (
        <MobileTopBar onOpenMobileNav={openMobileNav} triggerRef={navTriggerRef} pos={ticket} />
      )}

      <Sidebar
        currentUser={currentUser}
        onLogout={logout}
        isDesktopRail={isDesktopRail}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        triggerRef={navTriggerRef}
        isInventoryExpanded={isInventoryExpanded}
        setIsInventoryExpanded={setIsInventoryExpanded}
        isReportsExpanded={isReportsExpanded}
        setIsReportsExpanded={setIsReportsExpanded}
        onNavSelect={closeMobileNav}
      />

      <main
        id="main"
        tabIndex={-1}
        className={`flex-1 relative z-10 w-full flex flex-col ${
          isPosRoute ? "p-0 overflow-hidden bg-gray-100" : "p-4 md:p-8 overflow-y-auto"
        }`}
      >
        {/* The view titles are h2s; this is the one page heading, and it sits in
            the landmark the skip link targets. */}
        <h1 className="sr-only">Reid's Bakery HQ</h1>
        {/* Each route guards its own tab; see src/components/RequireAccess.tsx.
            The boundary sits inside the shell so the chrome never unmounts
            while a screen's chunk arrives. */}
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
    </>
  );
}
