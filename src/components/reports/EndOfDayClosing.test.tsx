import { beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EndOfDayClosing from "./EndOfDayClosing";
import { AnnouncerProvider } from "../common/Announcer";
import { todayISO } from "../../utils/dates";
import type { DayClosing, Expense } from "../../types/domain";

const today = todayISO();
const expense: Expense = {
  id: "EXP-001",
  date: today,
  description: "Flour delivery",
  amount: 1250,
};

const onDeleteExpense = vi.fn();
const onCloseDay = vi.fn();

function Harness() {
  const [expenses, setExpenses] = useState<Expense[]>([expense]);
  const [dayClosings, setDayClosings] = useState<DayClosing[]>([]);
  return (
    <AnnouncerProvider>
      <EndOfDayClosing
        sales={[]}
        expenses={expenses}
        dayClosings={dayClosings}
        onAddExpense={(data) =>
          setExpenses((prev) => [...prev, { ...data, id: `EXP-${prev.length + 1}` }])
        }
        onDeleteExpense={(id) => {
          onDeleteExpense(id);
          setExpenses((prev) => prev.filter((e) => e.id !== id));
        }}
        onCloseDay={(data) => {
          onCloseDay(data);
          setDayClosings((prev) => [
            ...prev,
            { ...data, id: `DC-${prev.length + 1}`, closedAt: new Date().toISOString() },
          ]);
        }}
      />
    </AnnouncerProvider>
  );
}

const removeButton = () => screen.getByRole("button", { name: "Remove expense Flour delivery" });
const closeButton = () => screen.getByRole("button", { name: /Lock In Net Profit/ });

beforeEach(() => {
  onDeleteExpense.mockClear();
  onCloseDay.mockClear();
});

describe("expense removal", () => {
  it("asks first and leaves the row in place until the answer is yes", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(removeButton());
    const dialog = screen.getByRole("alertdialog", { name: "Remove this expense?" });
    expect(dialog).toHaveTextContent("Flour delivery");
    expect(dialog).toHaveTextContent("₱1250.00");
    expect(onDeleteExpense).not.toHaveBeenCalled();
    expect(removeButton()).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove expense" }));
    expect(onDeleteExpense).toHaveBeenCalledWith("EXP-001");
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Remove expense Flour delivery" })).not.toBeInTheDocument();
    expect(screen.getByText("No expenses logged for this date.")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Expense Flour delivery removed.");
  });

  it("keeps the row and returns focus to it on Escape", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(removeButton());
    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(onDeleteExpense).not.toHaveBeenCalled();
    expect(removeButton()).toHaveFocus();
  });

  it("moves focus to the expenses heading once the row is gone", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(removeButton());
    await user.click(screen.getByRole("button", { name: "Remove expense" }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: `Expenses for ${today}` })).toHaveFocus()
    );
  });
});

describe("closing the day", () => {
  it("locks the register only after the confirmation", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(closeButton());
    const dialog = screen.getByRole("alertdialog", { name: `Close ${today}?` });
    expect(dialog).toHaveTextContent("₱-1250.00");
    expect(onCloseDay).not.toHaveBeenCalled();
    expect(closeButton()).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close day" }));
    expect(onCloseDay).toHaveBeenCalledWith({
      date: today,
      grossSales: 0,
      totalExpenses: 1250,
      netProfit: -1250,
    });
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(screen.getByText(/is already closed/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Lock In Net Profit/ })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(`Net profit ₱-1250.00 locked in.`);
  });

  it("leaves the day open when the confirmation is cancelled", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(closeButton());
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(onCloseDay).not.toHaveBeenCalled();
    expect(closeButton()).toHaveFocus();
    expect(screen.queryByText(/is already closed/)).not.toBeInTheDocument();
  });
});
describe("expense validation", () => {
  it("names the missing fields instead of refusing silently", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "+ Add Expense" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Expense not added — enter a description and an amount greater than zero."
    );
    const description = screen.getByLabelText("Expense description");
    expect(description).toHaveAttribute("aria-invalid", "true");
    expect(description).toHaveAttribute("aria-describedby", alert.id);
  });
});
