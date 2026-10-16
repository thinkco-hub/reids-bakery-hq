import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { tabFromPath } from "../routes";

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
  const [isInventoryExpanded, setIsInventoryExpanded] = useState(false);
  const [isReportsExpanded, setIsReportsExpanded] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

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
    setIsInventoryExpanded,
    isReportsExpanded,
    setIsReportsExpanded,
    windowWidth,
  };
}
