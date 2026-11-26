import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { PATH_BY_TAB, isWithinPath, tabFromPath } from "../routes";
import { useCanUseSidebarRail, useIsPhoneViewport } from "../utils/responsive";

/**
 * Owns application navigation: the tab named by the URL, the off-canvas sidebar
 * drawer state and the viewport classes the responsive shell reads.
 *
 * Which record is on screen is no longer state at all: `/orders/:orderId`,
 * `/clients/:clientId` and `/recipes/:recipeId` look it up in the feature arrays.
 * `tabFromPath` answers null for those URLs and that is deliberate — its only
 * consumer here is `isPosRoute`, and POS has no detail routes. Nothing should
 * widen it back to the owning tab, because the tab is not what guards a record.
 *
 * Viewport size is not state either: two media-query listeners answer the only
 * questions the shell asks, and they fire on a crossing rather than on every
 * resize pixel.
 */
export function useNavigation() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // The URL this browser session started on. Everything behind it was pushed by
  // the app and can be popped; everything at it has nothing behind it.
  const entryPath = useRef(pathname);
  const activeTab = tabFromPath(pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // null = the group follows the route it owns; a boolean = someone clicked the
  // header, and that choice outlasts the route it was made on.
  const [inventoryGroup, setInventoryGroup] = useState<boolean | null>(null);
  const [reportsGroup, setReportsGroup] = useState<boolean | null>(null);
  const canUseSidebarRail = useCanUseSidebarRail();
  const isPhoneViewport = useIsPhoneViewport();

  const isInventoryExpanded =
    inventoryGroup ?? isWithinPath(PATH_BY_TAB.inventory, pathname);
  const isReportsExpanded =
    reportsGroup ?? isWithinPath(PATH_BY_TAB["reports-dashboard"], pathname);

  /**
   * Leaves a record URL for the list that owns it. Popping is right when the app
   * pushed the record onto history, and wrong when the record *is* the entry
   * point — a typed or bookmarked id — because popping there leaves the app.
   */
  const backToList = (listPath: string) => {
    if (pathname === entryPath.current) {
      navigate(listPath);
      return;
    }
    navigate(-1);
  };

  return {
    activeTab,
    backToList,
    isSidebarOpen,
    setIsSidebarOpen,
    isInventoryExpanded,
    setIsInventoryExpanded: setInventoryGroup,
    isReportsExpanded,
    setIsReportsExpanded: setReportsGroup,
    canUseSidebarRail,
    isPhoneViewport,
  };
}
