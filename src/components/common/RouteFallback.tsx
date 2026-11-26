/**
 * The Suspense fallback while a route chunk arrives. It fills the same flex
 * column as the view it replaces, stays on the cream floor and announces
 * politely, so a slow chunk reads as loading rather than as a broken screen.
 */
export default function RouteFallback() {
  return (
    <div
      role="status"
      className="flex-1 flex items-center justify-center gap-3 py-16 text-espresso"
    >
      <span
        className="h-6 w-6 rounded-full border-2 border-espresso/25 border-t-espresso animate-spin"
        aria-hidden="true"
      />
      <span className="font-bold">Loading…</span>
    </div>
  );
}
