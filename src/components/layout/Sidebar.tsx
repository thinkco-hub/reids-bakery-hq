import { memo, useId, useRef, useState } from "react";
import {
  Analytics01Icon,
  Audit01Icon,
  BoxIcon,
  Calendar03Icon,
  CalendarAdd01Icon,
  Cancel01Icon,
  Cashier02Icon,
  ChevronDownIcon,
  ContactIcon,
  CookBookIcon,
  DashboardCircleIcon,
  LogOutIcon,
  ShoppingBasket03Icon,
  UserShield01Icon,
} from "../icons";
import { NavLink, useLocation, useNavigate } from "react-router";
import type { User } from "../../types/domain";
import type { Dispatch, RefObject, SetStateAction } from "react";
import {
  canAccessChams,
  canAccessReconciliation,
  canAccessTab,
} from "../../utils/permissions";
import { useDrawerA11y } from "../../hooks/useDrawerA11y";
import { CHAMS_PATH, PATH_BY_TAB, isWithinPath } from "../../routes";

interface SidebarProps {
  currentUser: User;
  onLogout: () => void;
  /** The shell's drawer/rail predicate; the rail waits for a wide fine pointer. */
  isDesktopRail: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  /** The hamburger in the top bar; focus returns to it when the drawer closes. */
  triggerRef: RefObject<HTMLButtonElement>;
  isInventoryExpanded: boolean;
  /** null hands the group back to the route it owns. */
  setIsInventoryExpanded: Dispatch<SetStateAction<boolean | null>>;
  isReportsExpanded: boolean;
  /** null hands the group back to the route it owns. */
  setIsReportsExpanded: Dispatch<SetStateAction<boolean | null>>;
  /** Closes the phone drawer once a link is chosen; the URL is the state. */
  onNavSelect: () => void;
}

/** A top-level item; `extra` carries the group headers' justify-between. */
function itemCls(active: boolean, extra = "") {
  return `w-full flex items-center ${extra} p-3 rounded-lg font-bold transition-colors whitespace-nowrap overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-espresso ${
    active
      ? "bg-caramel/20 text-white shadow-md border-l-4 border-brand"
      : "text-cream/60 hover:bg-caramel/10 hover:text-white border-l-4 border-transparent"
  }`;
}

function subItemCls(active: boolean) {
  // block: these are router links now, and an inline anchor ignores w-full/py.
  return `w-full block text-left pl-14 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-espresso ${
    active
      ? "text-brand bg-espresso-deep border-l-2 border-brand"
      : "text-cream/70 hover:text-white hover:bg-espresso-deep border-l-2 border-transparent"
  }`;
}

function Sidebar({
  currentUser,
  onLogout,
  isDesktopRail,
  isSidebarOpen,
  setIsSidebarOpen,
  triggerRef,
  isInventoryExpanded,
  setIsInventoryExpanded,
  isReportsExpanded,
  setIsReportsExpanded,
  onNavSelect,
}: SidebarProps) {
  // --- ROLE-BASED VISIBILITY (src/utils/permissions.ts) ---
  const role = currentUser.role;
  const canReconcile = canAccessReconciliation(role);
  const canSwitchToChams = canAccessChams(role);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  // Neither group header is a link that could ask NavLink for isActive: Reports
  // only expands, and the Inventory row is a link beside a separate toggle.
  const isReportsActive = isWithinPath(PATH_BY_TAB["reports-dashboard"], pathname);
  const isInventoryActive = isWithinPath(PATH_BY_TAB.inventory, pathname);
  const inventorySubmenuId = useId();
  const reportsSubmenuId = useId();

  // --- SIDEBAR RESPONSIVE HELPERS ---
  // Drawer or rail is the shell's call (useCanUseSidebarRail): only a wide,
  // mouse-driven viewport gets the pinned rail, because the rail relies on
  // hover to reveal its labels.

  // Desktop rail: expanded while the pointer is anywhere inside the panel or
  // focus is inside it, collapsed once both leave. Testing clientX against the
  // collapsed width instead collapses the rail under its own labels and
  // chevrons, putting the right half of the open rail out of mouse reach.
  const [isRailPointerInside, setIsRailPointerInside] = useState(false);
  const [isRailFocusInside, setIsRailFocusInside] = useState(false);
  // Focus pins the rail open only for keyboard users: a mouse click leaves
  // focus on the row too, and pinning that would keep the overlay covering
  // content after the cursor has left.
  const railInputModality = useRef<"pointer" | "keyboard">("keyboard");
  const desktopRailExpanded =
    isDesktopRail && (isRailPointerInside || isRailFocusInside);
  const collapseRail = () => {
    setIsRailPointerInside(false);
    setIsRailFocusInside(false);
  };

  // Shared class for sidebar labels/chevrons: always shown in the drawer, hidden
  // on the collapsed desktop rail until hover expands it.
  const sidebarLabelCls =
    !isDesktopRail || desktopRailExpanded ? "opacity-100" : "opacity-0";

  // Sub-menus stay mounted so their toggle's aria-controls always resolves, and
  // `hidden` is what takes a collapsed one out of the tab order. The collapsed
  // desktop rail has no room for a sub-menu at all.
  const submenuHidden = isDesktopRail && !desktopRailExpanded;

  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerA11y = useDrawerA11y({
    containerRef: drawerRef,
    triggerRef,
    closeRef,
    isOpen: isSidebarOpen,
    isDrawerLayout: !isDesktopRail,
    onClose: () => setIsSidebarOpen(false),
  });

  return (
    <>
      {/* DRAWER OVERLAY — tap outside the open sidebar to dismiss it */}
      {isSidebarOpen && !isDesktopRail && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Fixed gutter: the rail grows over it as an overlay, so the content
          beside it never moves while the rail opens or closes. */}
      {isDesktopRail && <div className="w-20 flex-shrink-0" aria-hidden="true" />}

      {/* RAIL SCRIM — the drawer's dismiss veil, for the open rail */}
      {isDesktopRail && desktopRailExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={collapseRail}
        />
      )}

      {/* SIDEBAR */}
      <div
        ref={drawerRef}
        {...drawerA11y}
        onMouseDown={() => {
          railInputModality.current = "pointer";
        }}
        onMouseEnter={() => {
          if (isDesktopRail) setIsRailPointerInside(true);
        }}
        onMouseLeave={() => {
          if (isDesktopRail) setIsRailPointerInside(false);
        }}
        onKeyDown={(e) => {
          railInputModality.current = "keyboard";
          drawerA11y.onKeyDown?.(e);
        }}
        onFocus={() => {
          if (isDesktopRail && railInputModality.current === "keyboard") {
            setIsRailFocusInside(true);
          }
        }}
        onBlur={(e) => {
          if (isDesktopRail && !e.currentTarget.contains(e.relatedTarget)) {
            setIsRailFocusInside(false);
          }
        }}
        className={`
        inset-y-0 left-0 z-50 transform transition-[translate,width] duration-300 ease-in-out flex flex-col
        bg-espresso text-cream shadow-2xl
        ${
          isDesktopRail
            ? // Same 300ms ease-in-out growth as the Chams rail, but absolute
              // over the gutter so only the sidebar moves.
              `absolute ${desktopRailExpanded ? "w-64" : "w-20"}`
            : // Drawer = fixed, so the page keeps its full width underneath it
              `fixed w-64 ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`
        }
      `}
      >
        {/* Brand Area */}
        <div
          className={`p-5 border-b border-caramel/20 flex justify-between items-center whitespace-nowrap overflow-hidden ${
            isDesktopRail ? "h-[76px]" : ""
          }`}
        >
          <button
            onClick={() => navigate(CHAMS_PATH)}
            disabled={!canSwitchToChams}
            className={`flex items-center ${canSwitchToChams ? "" : "cursor-default"}`}
            title={canSwitchToChams ? "Switch to Chams Branch Stock Ledger" : undefined}
          >
            <div className="w-10 h-10 bg-white rounded-full flex flex-shrink-0 items-center justify-center mr-4 p-1 shadow-inner">
              <span className="text-espresso font-bold text-xs text-center leading-tight">
                RBC
                <br />
                <span className="text-[0.375rem]">BAKERY</span>
              </span>
            </div>
            <span
              className={`text-xl font-bold ${sidebarLabelCls} transition-opacity duration-300 ease-in-out`}
            >
              Bakery HQ
            </span>
          </button>
          {!isDesktopRail && (
            <button
              ref={closeRef}
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close navigation"
              // 44px target; the negative margins keep the 24px icon where it was.
              className="p-2.5 -my-0.5 -mr-1.5 text-cream/60 hover:text-white"
            >
              <Cancel01Icon className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-3 mt-4 overflow-y-auto hide-scrollbar">
          {canAccessTab(role, "dashboard") && (
            <NavLink
              to={PATH_BY_TAB.dashboard}
              end
              onClick={onNavSelect}
              className={({ isActive }) => itemCls(isActive)}
            >
              <div className="flex items-center justify-center w-8 flex-shrink-0">
                <DashboardCircleIcon className="w-6 h-6" />
              </div>
              <span className={`ml-3 ${sidebarLabelCls} transition-opacity duration-300`}>
                Dashboard
              </span>
            </NavLink>
          )}

          {canAccessTab(role, "pos") && (
            <NavLink
              to={PATH_BY_TAB.pos}
              end
              onClick={onNavSelect}
              className={({ isActive }) => itemCls(isActive)}
            >
              <div className="flex items-center justify-center w-8 flex-shrink-0">
                <Cashier02Icon className="w-6 h-6" />
              </div>
              <span className={`ml-3 ${sidebarLabelCls} transition-opacity duration-300`}>
                Point of Sale
              </span>
            </NavLink>
          )}

          {canAccessTab(role, "orders") && (
            <NavLink
              to={PATH_BY_TAB.orders}
              onClick={onNavSelect}
              className={({ isActive }) => itemCls(isActive)}
            >
              <div className="flex items-center justify-center w-8 flex-shrink-0">
                <ShoppingBasket03Icon className="w-6 h-6" />
              </div>
              <span className={`ml-3 ${sidebarLabelCls} transition-opacity duration-300`}>
                Orders
              </span>
            </NavLink>
          )}

          {canAccessTab(role, "clients") && (
            <NavLink
              to={PATH_BY_TAB.clients}
              onClick={onNavSelect}
              className={({ isActive }) => itemCls(isActive)}
            >
              <div className="flex items-center justify-center w-8 flex-shrink-0">
                <ContactIcon className="w-6 h-6" />
              </div>
              <span className={`ml-3 ${sidebarLabelCls} transition-opacity duration-300`}>
                Clients
              </span>
            </NavLink>
          )}

          {canAccessTab(role, "inventory") && (
            <div className="flex flex-col">
              {/* The link carries the row padding so the whole row is one 48px
                  target; the row itself keeps the chrome and the chevron. */}
              <div
                className={`flex items-center rounded-lg font-bold transition-colors whitespace-nowrap overflow-hidden ${
                  isInventoryActive
                    ? "bg-caramel/20 text-white shadow-md"
                    : "text-cream/60 hover:bg-caramel/10 hover:text-white"
                }`}
              >
                <NavLink
                  to={PATH_BY_TAB.inventory}
                  onClick={onNavSelect}
                  className={`flex items-center min-w-0 flex-1 p-3 border-l-4 ${
                    isInventoryActive ? "border-brand" : "border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-center w-8 flex-shrink-0">
                    <BoxIcon className="w-6 h-6" />
                  </div>
                  <span className={`ml-3 ${sidebarLabelCls} transition-opacity duration-300`}>
                    Inventory
                  </span>
                </NavLink>
                {/* No toggle on the collapsed rail: its labels are invisible there. */}
                {canReconcile && !submenuHidden && (
                  <button
                    onClick={() => setIsInventoryExpanded(!isInventoryExpanded)}
                    aria-label="Toggle inventory submenu"
                    aria-expanded={isInventoryExpanded}
                    aria-controls={inventorySubmenuId}
                    // 44px target inside the 48px row; pl-4/pr-3 keeps the icon
                    // 12px from the row edge, where the old 40px padding put it.
                    className="ml-2 py-3.5 pl-4 pr-3 flex-shrink-0"
                  >
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isInventoryExpanded ? "rotate-180" : ""
                      } ${sidebarLabelCls}`}
                    />
                  </button>
                )}
              </div>

              {canReconcile && (
                <div
                  id={inventorySubmenuId}
                  hidden={submenuHidden || !isInventoryExpanded}
                  className="mt-1 space-y-1 bg-espresso-well rounded-lg overflow-hidden transition-all shadow-inner"
                >
                  <NavLink
                    to={PATH_BY_TAB["inventory-reconciliation"]}
                    end
                    onClick={onNavSelect}
                    className={({ isActive }) => subItemCls(isActive)}
                  >
                    Reconciliation
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {canAccessTab(role, "recipes") && (
            <NavLink
              to={PATH_BY_TAB.recipes}
              onClick={onNavSelect}
              className={({ isActive }) => itemCls(isActive)}
            >
              <div className="flex items-center justify-center w-8 flex-shrink-0">
                <CookBookIcon className="w-6 h-6" />
              </div>
              <span className={`ml-3 ${sidebarLabelCls} transition-opacity duration-300`}>
                Recipes
              </span>
            </NavLink>
          )}

          {canAccessTab(role, "production-runs") && (
            <NavLink
              to={PATH_BY_TAB["production-runs"]}
              end
              onClick={onNavSelect}
              className={({ isActive }) => itemCls(isActive)}
            >
              <div className="flex items-center justify-center w-8 flex-shrink-0">
                <CalendarAdd01Icon className="w-6 h-6" />
              </div>
              <span className={`ml-3 ${sidebarLabelCls} transition-opacity duration-300`}>
                Production Runs
              </span>
            </NavLink>
          )}

          {canAccessTab(role, "calendar") && (
            <NavLink
              to={PATH_BY_TAB.calendar}
              end
              onClick={onNavSelect}
              className={({ isActive }) => itemCls(isActive)}
            >
              <div className="flex items-center justify-center w-8 flex-shrink-0">
                <Calendar03Icon className="w-6 h-6" />
              </div>
              <span className={`ml-3 ${sidebarLabelCls} transition-opacity duration-300`}>
                Calendar
              </span>
            </NavLink>
          )}

          {canAccessTab(role, "reports-dashboard") && (
            <div className="flex flex-col">
              <button
                onClick={() => setIsReportsExpanded(!isReportsExpanded)}
                aria-expanded={isReportsExpanded}
                aria-controls={reportsSubmenuId}
                className={itemCls(isReportsActive, "justify-between")}
              >
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 flex-shrink-0">
                    <Analytics01Icon className="w-6 h-6" />
                  </div>
                  <span className={`ml-3 ${sidebarLabelCls} transition-opacity duration-300`}>
                    Reports
                  </span>
                </div>
                <ChevronDownIcon
                  className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                    isReportsExpanded ? "rotate-180" : ""
                  } ${sidebarLabelCls}`}
                />
              </button>

              <div
                id={reportsSubmenuId}
                hidden={submenuHidden || !isReportsExpanded}
                className="mt-1 space-y-1 bg-espresso-well rounded-lg overflow-hidden transition-all shadow-inner"
              >
                <NavLink
                  to={PATH_BY_TAB["reports-dashboard"]}
                  end
                  onClick={onNavSelect}
                  className={({ isActive }) => subItemCls(isActive)}
                >
                  Sales Dashboard
                </NavLink>
                <NavLink
                  to={PATH_BY_TAB["reports-closing"]}
                  end
                  onClick={onNavSelect}
                  className={({ isActive }) => subItemCls(isActive)}
                >
                  End-of-Day Closing
                </NavLink>
                <NavLink
                  to={PATH_BY_TAB["reports-inventory"]}
                  end
                  onClick={onNavSelect}
                  className={({ isActive }) => subItemCls(isActive)}
                >
                  Closing Inventory
                </NavLink>
              </div>
            </div>
          )}

          {canAccessTab(role, "audit-logs") && (
            <NavLink
              to={PATH_BY_TAB["audit-logs"]}
              end
              onClick={onNavSelect}
              className={({ isActive }) => itemCls(isActive)}
            >
              <div className="flex items-center justify-center w-8 flex-shrink-0">
                <Audit01Icon className="w-6 h-6" />
              </div>
              <span className={`ml-3 ${sidebarLabelCls} transition-opacity duration-300`}>
                Audit Logs
              </span>
            </NavLink>
          )}

          {canAccessTab(role, "user-management") && (
            <NavLink
              to={PATH_BY_TAB["user-management"]}
              end
              onClick={onNavSelect}
              className={({ isActive }) => itemCls(isActive)}
            >
              <div className="flex items-center justify-center w-8 flex-shrink-0">
                <UserShield01Icon className="w-6 h-6" />
              </div>
              <span className={`ml-3 ${sidebarLabelCls} transition-opacity duration-300`}>
                Roles
              </span>
            </NavLink>
          )}
        </nav>

        {/* Bottom Logout Area */}
        <div className="p-3 mb-4 mt-auto border-t border-caramel/20 pt-4">
          <div
            className={`px-3 mb-2 overflow-hidden whitespace-nowrap ${sidebarLabelCls} transition-opacity duration-300`}
          >
            <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
            <p className="text-xs text-cream/70 truncate">{currentUser.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center p-3 rounded-lg font-bold text-cream/60 hover:text-white hover:bg-caramel/10 transition-colors whitespace-nowrap overflow-hidden"
          >
            <div className="flex items-center justify-center w-8 flex-shrink-0">
              <LogOutIcon className="w-6 h-6" />
            </div>
            <span className={`ml-3 ${sidebarLabelCls} transition-opacity duration-300`}>
              Log Out
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

// A POS search keystroke re-renders LayoutRoute; the chrome behind a stable
// prop set does not commit with it.
export default memo(Sidebar);
