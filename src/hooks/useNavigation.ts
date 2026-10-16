import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { PATH_BY_TAB, isWithinPath, tabFromPath } from "../routes";

/**
 * Owns application navigation: the tab named by the URL, the off-canvas sidebar
 * drawer state and the window width used by the responsive sidebar and POS ticket.
 *
 * Detail-panel state (viewing an order / client / recipe) is owned by its
 * feature hook and cleared by the app shell when a navigation link is clicked.
 */
export function useNavigation() {
  const { pathname } = useLocation();
  const activeTab = tabFromPath(pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // null = the group follows the route it owns; a boolean = someone clicked the
  // header, and that choice outlasts the route it was made on.
  const [inventoryGroup, setInventoryGroup] = useState<boolean | null>(null);
  const [reportsGroup, setReportsGroup] = useState<boolean | null>(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  const isInventoryExpanded =
    inventoryGroup ?? isWithinPath(PATH_BY_TAB.inventory, pathname);
  const isReportsExpanded =
    reportsGroup ?? isWithinPath(PATH_BY_TAB["reports-dashboard"], pathname);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    activeTab,
    isSidebarOpen,
    setIsSidebarOpen,
    isInventoryExpanded,
    setIsInventoryExpanded: setInventoryGroup,
    isReportsExpanded,
    setIsReportsExpanded: setReportsGroup,
    windowWidth,
  };
}
