/**
 * A controllable window.matchMedia for jsdom. It evaluates the queries the app
 * uses against window.innerWidth plus one pointer capability, and fires change
 * listeners only when an answer flips — the browser's own contract. The app
 * listens at the 768 and 1024 thresholds, so a resize sweep only re-renders on
 * those crossings.
 */

type ChangeHandler = (event: MediaQueryListEvent) => void;

interface FakeQueryList {
  media: string;
  matches: boolean;
  onchange: ((event: MediaQueryListEvent) => unknown) | null;
  handlers: Set<ChangeHandler>;
}

const lists = new Set<FakeQueryList>();
let finePointer = true;
let installed = false;

function evaluate(query: string): boolean {
  const width = window.innerWidth;
  return query.split(" and ").every((clause) => {
    const [name, value] = clause.trim().replace(/^\(|\)$/g, "").split(":").map((s) => s.trim());
    switch (name) {
      case "min-width":
        return width >= parseFloat(value);
      case "max-width":
        return width <= parseFloat(value);
      case "hover":
        return finePointer === (value === "hover");
      case "pointer":
        return finePointer === (value === "fine");
      default:
        throw new Error(`matchMedia mock does not understand "${query}"`);
    }
  });
}

function refresh(): void {
  for (const list of lists) {
    const next = evaluate(list.media);
    if (next === list.matches) continue;
    list.matches = next;
    const event = { matches: next, media: list.media } as MediaQueryListEvent;
    list.handlers.forEach((handler) => handler(event));
    list.onchange?.(event);
  }
}

/** Installs the fake once per test environment; setup.ts calls it for every file. */
export function installMatchMedia(): void {
  if (installed) return;
  installed = true;
  window.matchMedia = ((query: string) => {
    const list: FakeQueryList = {
      media: query,
      matches: evaluate(query),
      onchange: null,
      handlers: new Set<ChangeHandler>(),
    };
    lists.add(list);
    const subscribe = (handler: ChangeHandler | null) => {
      if (handler) list.handlers.add(handler);
    };
    const unsubscribe = (handler: ChangeHandler | null) => {
      if (handler) list.handlers.delete(handler);
    };
    return Object.assign(list, {
      addEventListener: (type: string, handler: ChangeHandler | null) => {
        if (type === "change") subscribe(handler);
      },
      removeEventListener: (type: string, handler: ChangeHandler | null) => {
        if (type === "change") unsubscribe(handler);
      },
      addListener: subscribe,
      removeListener: unsubscribe,
      dispatchEvent: () => true,
    }) as unknown as MediaQueryList;
  }) as typeof window.matchMedia;
}

/** Resizes the fake viewport; listeners hear it only when a query flips. */
export function setViewportWidth(width: number): void {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
  refresh();
}

/** True = a hovering fine pointer (a mouse); false = a coarse touch pointer. */
export function setFinePointer(fine: boolean): void {
  finePointer = fine;
  refresh();
}
