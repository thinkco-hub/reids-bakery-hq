import { render, screen } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import App from "../App";

/**
 * The app shell exactly as src/index.tsx mounts it. Tests move between screens
 * by clicking the sidebar, so they read the same whether navigation is React
 * state or a URL.
 */
export function renderShell() {
  return render(<App />);
}

/** Signs in as the cashier: the most restricted role that still has a POS and Orders. */
export async function signInAsCashier(user: UserEvent) {
  // The login form's labels are not associated with its fields, so the email
  // input is the only role query available; the password field is picked by type.
  const password = document.querySelector('input[type="password"]');
  if (!(password instanceof HTMLInputElement)) throw new Error("No password field");

  await user.type(screen.getByRole("textbox"), "cashier@rbc.test");
  await user.type(password, "cashier123");
  await user.click(screen.getByRole("button", { name: "Log In" }));
}
