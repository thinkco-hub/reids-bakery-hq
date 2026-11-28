import React, { useRef, useState } from "react";
import LedgerView from "./LedgerView";
import BeginningInventoryForm from "./BeginningInventoryForm";
import MovementLogForm from "./MovementLogForm";
import RemainingCountForm from "./RemainingCountForm";
import LedgerHistory from "./LedgerHistory";
import { useCanUseSidebarRail } from "../../utils/responsive";
import { useDrawerA11y } from "../../hooks/useDrawerA11y";
import {
  AlertCircleIcon,
  ArrowLeft02Icon,
  BookOpenTextIcon,
  Cancel01Icon,
  ClipboardCheckIcon,
  HistoryIcon,
  MenuIcon,
  PlusIcon,
} from "../icons";
import { INITIAL_BRANCHES, SIOPAO_PRODUCTS } from "../../data/initialChams";
import { useChamsLedger } from "../../hooks/useChamsLedger";

const NAV_ITEMS: Array<{ key: ChamsTabId; label: string; icon: React.ReactNode }> = [
  {
    key: "ledger",
    label: "Ledger",
    icon: <BookOpenTextIcon className="w-6 h-6" />,
  },
  {
    key: "beginning",
    label: "Beginning Inventory",
    icon: <PlusIcon className="w-6 h-6" />,
  },
  {
    key: "movement-entry",
    label: "Spoilage / Sold Logging",
    icon: <AlertCircleIcon className="w-6 h-6" />,
  },
  {
    key: "count-entry",
    label: "Remaining Count Entry",
    icon: <ClipboardCheckIcon className="w-6 h-6" />,
  },
  {
    key: "history",
    label: "Ledger History",
    icon: <HistoryIcon className="w-6 h-6" />,
  },
];

type ChamsTabId = "ledger" | "beginning" | "movement-entry" | "count-entry" | "history";

interface ChamsStockLedgerProps {
  onSwitchView: () => void;
}

export default function ChamsStockLedger({ onSwitchView }: ChamsStockLedgerProps) {
  const [activeChamsTab, setActiveChamsTab] = useState<ChamsTabId>("ledger");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { month, setMonth, beginnings, movements, counts, upsertBeginning, upsertMovement, upsertCount } =
    useChamsLedger();

  // Same rule as the Bakery HQ shell: only a mouse-driven viewport gets the
  // pinned hover rail, everything else uses the hamburger drawer.
  const isDesktopRail = useCanUseSidebarRail();
  // Same expansion model as the bakery rail: pointer inside or keyboard focus
  // inside, collapsed once both leave; the scrim dismisses it on click.
  const [isRailPointerInside, setIsRailPointerInside] = useState(false);
  const [isRailFocusInside, setIsRailFocusInside] = useState(false);
  const railInputModality = useRef<"pointer" | "keyboard">("keyboard");
  const railExpanded = isDesktopRail && (isRailPointerInside || isRailFocusInside);
  const collapseRail = () => {
    setIsRailPointerInside(false);
    setIsRailFocusInside(false);
  };
  const sidebarLabelCls = !isDesktopRail || railExpanded ? "opacity-100" : "opacity-0";

  // The ledger keeps its own chrome, so it mirrors the bakery shell's drawer
  // contract rather than sharing its state.
  const navTriggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerA11y = useDrawerA11y({
    containerRef: drawerRef,
    triggerRef: navTriggerRef,
    closeRef,
    isOpen: isSidebarOpen,
    isDrawerLayout: !isDesktopRail,
    onClose: () => setIsSidebarOpen(false),
  });

  const handleNavClick = (tab: ChamsTabId) => {
    setActiveChamsTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-chams-navy focus:px-4 focus:py-2 focus:font-bold focus:text-white"
      >
        Skip to main content
      </a>

      {/* TOP BAR — drawer layouts only (phone and tablet) */}
      {!isDesktopRail && (
        <div className="bg-chams-navy text-chams-blue-wash p-4 flex justify-between items-center shadow-md z-30 w-full">
          <button
            ref={navTriggerRef}
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation"
            className="p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-chams-navy bg-chams-blue/20 rounded-md"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <button onClick={onSwitchView} className="flex items-center" title="Switch to Reid's Bakery HQ">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-2 p-1">
              <span className="text-chams-navy font-bold text-xs">CH</span>
            </div>
            <span className="text-lg font-bold">Chams Ledger</span>
          </button>
        </div>
      )}

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
      {isDesktopRail && railExpanded && (
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
        inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out
        flex flex-col shadow-2xl
        ${
          isDesktopRail
            ? `absolute ${railExpanded ? "w-72" : "w-20"}`
            : `fixed w-72 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`
        }
        bg-chams-navy text-chams-blue-wash
      `}
      >
        <div
          className={`p-5 border-b border-chams-blue/20 flex justify-between items-center whitespace-nowrap ${
            isDesktopRail ? "h-[76px]" : ""
          }`}
        >
          <button
            onClick={onSwitchView}
            className="flex items-center"
            title="Switch to Reid's Bakery HQ"
          >
            <div className="w-10 h-10 bg-white rounded-full flex flex-shrink-0 items-center justify-center mr-4 p-1 shadow-inner">
              <span className="text-chams-navy font-bold text-xs text-center leading-tight">
                CH
                <br />
                <span className="text-[0.375rem]">CHAMS</span>
              </span>
            </div>
            <span
              className={`text-xl font-bold truncate ${sidebarLabelCls} transition-opacity duration-300 ease-in-out`}
            >
              Chams Ledger
            </span>
          </button>
          {!isDesktopRail && (
            <button
              ref={closeRef}
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close navigation"
              className="p-1 text-chams-blue-wash/60 hover:text-white"
            >
              <Cancel01Icon className="w-6 h-6" />
            </button>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-3 mt-4 overflow-y-auto hide-scrollbar">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              className={`w-full flex items-center p-3 rounded-lg font-bold transition-colors whitespace-nowrap overflow-hidden ${
                activeChamsTab === item.key
                  ? "bg-chams-blue/20 text-white shadow-md border-l-4 border-chams-blue-soft"
                  : "text-chams-blue-wash/60 hover:bg-chams-blue/10 hover:text-white border-l-4 border-transparent"
              }`}
            >
              <div className="flex items-center justify-center w-8 flex-shrink-0">
                {item.icon}
              </div>
              <span
                className={`ml-3 truncate ${sidebarLabelCls} transition-opacity duration-300 text-left`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-chams-blue/20">
          <button
            onClick={onSwitchView}
            className="w-full flex items-center p-3 rounded-lg font-bold text-chams-blue-wash/60 hover:bg-chams-blue/10 hover:text-white transition-colors whitespace-nowrap overflow-hidden"
          >
            <div className="flex items-center justify-center w-8 flex-shrink-0">
              <ArrowLeft02Icon className="w-6 h-6" />
            </div>
            <span className={`ml-3 truncate ${sidebarLabelCls} transition-opacity duration-300`}>
              Back to Bakery HQ
            </span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main
        id="main"
        tabIndex={-1}
        className="flex-1 relative z-10 w-full flex flex-col p-4 md:p-8 overflow-y-auto"
      >
        <h1 className="sr-only">Chams Ledger</h1>
        {activeChamsTab === "ledger" && (
          <LedgerView
            branches={INITIAL_BRANCHES}
            products={SIOPAO_PRODUCTS}
            beginnings={beginnings}
            movements={movements}
            counts={counts}
            month={month}
            onMonthChange={setMonth}
          />
        )}
        {activeChamsTab === "beginning" && (
          <BeginningInventoryForm
            branches={INITIAL_BRANCHES}
            products={SIOPAO_PRODUCTS}
            beginnings={beginnings}
            onSubmit={upsertBeginning}
          />
        )}
        {activeChamsTab === "movement-entry" && (
          <MovementLogForm branches={INITIAL_BRANCHES} products={SIOPAO_PRODUCTS} movements={movements} onSubmit={upsertMovement} />
        )}
        {activeChamsTab === "count-entry" && (
          <RemainingCountForm branches={INITIAL_BRANCHES} products={SIOPAO_PRODUCTS} counts={counts} onSubmit={upsertCount} />
        )}
        {activeChamsTab === "history" && (
          <LedgerHistory
            branches={INITIAL_BRANCHES}
            products={SIOPAO_PRODUCTS}
            beginnings={beginnings}
            movements={movements}
            counts={counts}
          />
        )}
      </main>
    </>
  );
}
