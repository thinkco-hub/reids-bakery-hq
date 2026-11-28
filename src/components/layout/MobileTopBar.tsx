import React, { memo, useState } from "react";
import type { RefObject } from "react";
import DeleteConfirmDialog from "../common/DeleteConfirmDialog";
import { useAnnounce } from "../common/Announcer";
import { CheckIcon, MenuIcon, TrashIcon, UserAdd01Icon } from "../icons";
import type { TicketCustomer } from "../../types/domain";

/** Ticket header shown in place of the app title while the POS tab is open. */
export interface MobileTicketBar {
  /** Units on the ticket, counting a product added three times as three. */
  ticketCount: number;
  customer: TicketCustomer | null;
  onAddCustomer: () => void;
  onClearTicket: () => void;
}

interface MobileTopBarProps {
  onOpenMobileNav: () => void;
  /** The hamburger itself, so the drawer can hand focus back to it on close. */
  triggerRef: RefObject<HTMLButtonElement>;
  /** Pass the ticket details on the POS tab, and null on every other tab. */
  pos: MobileTicketBar | null;
}

/**
 * Header for the drawer layouts (phone and tablet); the shell only renders it
 * while the sidebar is off-canvas. The Chams ledger switch lives in the
 * navigation drawer rather than here, which frees the phone row up for the
 * ticket controls the POS needs within thumb reach at all times.
 */
function MobileTopBar({ onOpenMobileNav, triggerRef, pos }: MobileTopBarProps) {
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const announce = useAnnounce();

  const confirmClear = () => {
    pos?.onClearTicket();
    setIsClearConfirmOpen(false);
    announce("Ticket cleared.");
  };

  return (
    <header className="bg-espresso text-cream p-4 flex items-center gap-3 shadow-md z-30">
      <button
        ref={triggerRef}
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        // 44px target; the negative margins keep the 24px icon in place.
        className="p-2.5 -m-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-espresso bg-caramel/20 rounded-md flex-shrink-0"
      >
        <MenuIcon className="w-6 h-6" />
      </button>

      {pos ? (
        <>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-lg font-bold">Ticket</span>
            <span className="min-w-[1.75rem] px-1 py-0.5 rounded border border-cream/40 text-center font-mono text-sm">
              {pos.ticketCount}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={pos.onAddCustomer}
              aria-label={
                pos.customer
                  ? `Change the ticket customer, currently ${pos.customer.name}`
                  : "Add customer to ticket"
              }
              className={`max-w-[9rem] min-h-[2.75rem] px-2 rounded-md flex items-center gap-1.5 transition-colors ${
                pos.customer
                  ? "bg-caramel/40 hover:bg-caramel/60"
                  : "bg-caramel/20 hover:bg-caramel/40"
              }`}
            >
              {pos.customer ? (
                <>
                  <span className="truncate text-sm font-bold">
                    {pos.customer.name}
                  </span>
                  <CheckIcon className="w-4 h-4 flex-shrink-0" />
                </>
              ) : (
                <UserAdd01Icon className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={() => setIsClearConfirmOpen(true)}
              disabled={pos.ticketCount === 0}
              aria-label="Clear Ticket"
              title="Clear Ticket"
              className={`min-h-[2.75rem] min-w-[2.75rem] px-2 rounded-md flex items-center justify-center transition-colors ${
                pos.ticketCount === 0
                  ? "text-cream/30 cursor-not-allowed"
                  : "bg-caramel/20 hover:bg-red-500/60"
              }`}
            >
              <TrashIcon className="w-6 h-6" />
            </button>
          </div>

          {isClearConfirmOpen && (
            <DeleteConfirmDialog
              title="Clear ticket?"
              message="Removes every item and the customer from the current ticket."
              confirmLabel="Clear Ticket"
              onConfirm={confirmClear}
              onCancel={() => setIsClearConfirmOpen(false)}
            />
          )}
        </>
      ) : (
        <span className="text-lg font-bold">Bakery HQ</span>
      )}
    </header>
  );
}

// Same contract as the rail: it re-commits when its own props change, not
// because a screen below the shell re-rendered.
export default memo(MobileTopBar);
