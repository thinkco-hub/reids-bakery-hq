import React, { useRef } from "react";
import { Outlet } from "react-router";
import MobileTopBar from "../components/layout/MobileTopBar";
import Sidebar from "../components/layout/Sidebar";
import { usePosSlice } from "../store/slices";
import { canUseSidebarRail, isPhoneViewport } from "../utils/responsive";
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
    windowWidth,
  } = useShell();
  const { cartQty, ticketCustomer, openCustomerPicker, clearTicket } = usePosSlice();

  // The drawer hands focus back to the control that opened it, which lives in
  // the top bar rather than in the sidebar.
  const navTriggerRef = useRef<HTMLButtonElement>(null);

  // Wide, mouse-driven viewports keep the pinned sidebar rail; phones and
  // tablets (including touch devices that report a desktop viewport) use the
  // hamburger drawer, so the top bar and the drawer share one test.
  const isDesktopRail = canUseSidebarRail(windowWidth);
  const isPosRoute = activeTab === "pos";

  return (
    <>
      {!isDesktopRail && (
        <MobileTopBar
          onOpenMobileNav={() => setIsSidebarOpen(true)}
          triggerRef={navTriggerRef}
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

      <Sidebar
        currentUser={currentUser}
        onLogout={logout}
        windowWidth={windowWidth}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        triggerRef={navTriggerRef}
        isInventoryExpanded={isInventoryExpanded}
        setIsInventoryExpanded={setIsInventoryExpanded}
        isReportsExpanded={isReportsExpanded}
        setIsReportsExpanded={setIsReportsExpanded}
        onNavSelect={() => setIsSidebarOpen(false)}
      />

      <main
        className={`flex-1 relative z-10 w-full flex flex-col ${
          isPosRoute ? "p-0 overflow-hidden bg-gray-100" : "p-4 md:p-8 overflow-y-auto"
        }`}
      >
        {/* Each route guards its own tab; see src/components/RequireAccess.tsx. */}
        <Outlet />
      </main>
    </>
  );
}
