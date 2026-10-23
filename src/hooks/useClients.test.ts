import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { initialClients } from "../data/initialClients";
import { initialUsers } from "../data/initialUsers";
import { useClients } from "./useClients";
import type { ClientFormData, User } from "../types/domain";

const FORM: ClientFormData = {
  name: "Walk-in Guest",
  contact: "09171234567",
  email: "",
  address: "",
  standingOrder: "",
};

function userFor(email: string): User {
  const seeded = initialUsers.find((u) => u.email === email);
  if (!seeded) throw new Error(`No seeded user ${email}`);
  return seeded;
}

/** The count after one create attempt, read from the hook the shell mounts. */
function afterAdd(currentUser: User | null): number {
  const view = renderHook(() => useClients({ currentUser }));
  act(() => view.result.current.addClient(FORM));
  return view.result.current.clients.length;
}

describe("addClient capability check", () => {
  /**
   * The POS overlay is not the guard: a cashier-role caller that reaches the
   * mutation directly still cannot append to the client collection.
   */
  it("refuses a role with no Clients tab", () => {
    expect(afterAdd(userFor("cashier@rbc.test"))).toBe(initialClients.length);
    expect(afterAdd(userFor("kitchen@rbc.test"))).toBe(initialClients.length);
  });

  it("refuses while nobody is signed in", () => {
    expect(afterAdd(null)).toBe(initialClients.length);
  });

  it("accepts a role that owns the Clients tab", () => {
    expect(afterAdd(userFor("sales@rbc.test"))).toBe(initialClients.length + 1);
  });
});
