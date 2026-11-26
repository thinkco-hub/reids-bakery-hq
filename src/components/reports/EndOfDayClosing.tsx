import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { useAnnounce } from "../common/Announcer";
import DeleteConfirmDialog from "../common/DeleteConfirmDialog";
import EmptyState from "../common/EmptyState";
import StatCard from "../common/StatCard";
import Button from "../common/Button";
import Table, { TableHead } from "../common/Table";
import { CheckIcon, XIcon } from "../icons";
import { TONE_TEXT } from "../../utils/status";
import { computeDailyClosing } from "../../utils/closing";
import { formatTime, todayISO } from "../../utils/dates";
import { formatMoney } from "../../utils/money";
import { getRevenueByPaymentMethod } from "../../utils/sales";
import type { FormEvent } from "react";
import type { DayClosing, Expense, ExpenseData, ExpenseId, Sale, DayClosingData } from "../../types/domain";

interface EndOfDayClosingProps {
  sales: Sale[];
  expenses: Expense[];
  dayClosings: DayClosing[];
  onAddExpense: (data: ExpenseData) => void;
  onDeleteExpense: (id: ExpenseId) => void;
  onCloseDay: (data: DayClosingData) => void;
}

export default function EndOfDayClosing({
  sales,
  expenses,
  dayClosings,
  onAddExpense,
  onDeleteExpense,
  onCloseDay,
}: EndOfDayClosingProps) {
  const [date, setDate] = useState(todayISO());
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseError, setExpenseError] = useState<string | null>(null);
  const expenseErrorId = useId();
  const [pendingExpense, setPendingExpense] = useState<Expense | null>(null);
  const closingHistoryHeadingId = useId();
  const [confirmingClose, setConfirmingClose] = useState(false);
  const expensesHeadingRef = useRef<HTMLHeadingElement>(null);
  // Confirming either action destroys its own trigger, so the dialog has nothing to return focus to.
  const focusHeadingOnConfirm = useRef(false);
  const announce = useAnnounce();

  useEffect(() => {
    if (!focusHeadingOnConfirm.current) return;
    focusHeadingOnConfirm.current = false;
    expensesHeadingRef.current?.focus();
  }, [pendingExpense, confirmingClose]);

  const closing = useMemo(() => computeDailyClosing(date, sales, expenses), [date, sales, expenses]);
  const alreadyClosed = dayClosings.find((c) => c.date === date);
  const paymentBreakdown = useMemo(() => getRevenueByPaymentMethod(closing.daySales), [closing.daySales]);

  const handleAddExpense = (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    const missing: string[] = [];
    if (!description.trim()) missing.push("a description");
    if (isNaN(parsed) || parsed <= 0) missing.push("an amount greater than zero");
    if (missing.length > 0) {
      setExpenseError(`Expense not added — enter ${missing.join(" and ")}.`);
      return;
    }
    setExpenseError(null);
    onAddExpense({ date, description: description.trim(), amount: parsed });
    setDescription("");
    setAmount("");
  };

  const confirmRemoveExpense = () => {
    if (!pendingExpense) return;
    focusHeadingOnConfirm.current = true;
    onDeleteExpense(pendingExpense.id);
    announce(`Expense ${pendingExpense.description} removed.`);
    setPendingExpense(null);
  };

  const confirmCloseDay = () => {
    focusHeadingOnConfirm.current = true;
    setConfirmingClose(false);
    onCloseDay({
      date,
      grossSales: closing.grossSales,
      totalExpenses: closing.totalExpenses,
      netProfit: closing.netProfit,
    });
    announce(`${date} closed. Net profit ${formatMoney(closing.netProfit)} locked in.`);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn pb-10 w-full">
      <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-ink">End-of-Day Closing</h2>
          <p className="text-gray-500 mt-1">Log expenses and close out the day's register.</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Closing date"
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-brand-strong focus:border-brand-strong outline-none bg-white shadow-sm"
        />
      </header>

      {alreadyClosed && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <CheckIcon className="w-5 h-5 text-green-700 shrink-0" />
          <p className="text-sm font-semibold text-green-700">
            {date} is already closed — net profit {formatMoney(alreadyClosed.netProfit)}, closed at{" "}
            {formatTime(alreadyClosed.closedAt)}.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Gross Sales"
          value={formatMoney(closing.grossSales)}
          sub={`${closing.daySales.length} transaction(s)`}
        />
        <StatCard
          label="Total Expenses"
          value={formatMoney(closing.totalExpenses)}
          accent={TONE_TEXT.danger}
          sub={`${closing.dayExpenses.length} entr${closing.dayExpenses.length === 1 ? "y" : "ies"}`}
        />
        <StatCard
          label="Net Profit"
          value={formatMoney(closing.netProfit)}
          accent={closing.netProfit >= 0 ? TONE_TEXT.success : TONE_TEXT.danger}
        />
      </div>

      {paymentBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <h3 className="text-base font-bold text-ink mb-4">Sales by Payment Method</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {paymentBreakdown.map((m) => (
              <div key={m.method} className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-medium text-gray-500 mb-1">{m.method}</p>
                <p className="text-lg font-bold text-ink tabular-nums">{formatMoney(m.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h3 ref={expensesHeadingRef} tabIndex={-1} className="text-base font-bold text-ink mb-4">Expenses for {date}</h3>

        {!alreadyClosed && (
          <form onSubmit={handleAddExpense} noValidate className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              placeholder="Description (e.g. flour delivery)"
              aria-label="Expense description"
              aria-invalid={expenseError && !description.trim() ? true : undefined}
              aria-describedby={expenseError ? expenseErrorId : undefined}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-strong focus:border-brand-strong outline-none"
            />
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Amount"
              aria-label="Expense amount"
              aria-invalid={
                expenseError && !(parseFloat(amount) > 0) ? true : undefined
              }
              aria-describedby={expenseError ? expenseErrorId : undefined}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="sm:w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-strong focus:border-brand-strong outline-none"
            />
            <Button type="submit" size="md">
              + Add Expense
            </Button>
          </form>
        )}
        {expenseError && (
          <p id={expenseErrorId} role="alert" className="text-sm font-semibold text-red-700 mb-4">
            {expenseError}
          </p>
        )}

        {closing.dayExpenses.length === 0 ? (
          <EmptyState title="No expenses logged for this date." hint="Expenses added above appear here until the day is closed." />
        ) : (
          <ul className="divide-y divide-gray-100">
            {closing.dayExpenses.map((exp) => (
              <li key={exp.id} className="py-3 flex justify-between items-center text-sm">
                <span className="text-gray-700">{exp.description}</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-ink tabular-nums">{formatMoney(Number(exp.amount))}</span>
                  {!alreadyClosed && (
                    <button
                      onClick={() => setPendingExpense(exp)}
                      className="flex items-center justify-center min-h-[2.75rem] min-w-[2.75rem] rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove expense"
                      aria-label={`Remove expense ${exp.description}`}
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!alreadyClosed && (
        <Button variant="cta" size="lg" className="w-full shadow-lg" onClick={() => setConfirmingClose(true)}>
          {/* The shared Button never wraps labels; this one must at 320px. */}
          <span className="whitespace-normal">
            Close {date} — Lock In Net Profit of {formatMoney(closing.netProfit)}
          </span>
        </Button>
      )}

      {dayClosings.length > 0 && (
        <div className="mt-8">
          <Table
            label="Closing history"
            labelledBy={closingHistoryHeadingId}
            minWidth="min-w-[560px]"
            header={
              <div className="p-5 border-b border-gray-100">
                <h3 id={closingHistoryHeadingId} className="text-base font-bold text-ink">Closing History</h3>
              </div>
            }
          >
            <TableHead>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3 text-right">Gross Sales</th>
              <th scope="col" className="px-6 py-3 text-right">Expenses</th>
              <th scope="col" className="px-6 py-3 text-right">Net Profit</th>
            </TableHead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {dayClosings
                .slice()
                .sort((a, b) => (a.date < b.date ? 1 : -1))
                .map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <th scope="row" className="px-6 py-3 text-left font-medium text-ink">{c.date}</th>
                    <td className="px-6 py-3 text-right text-gray-700 tabular-nums">{formatMoney(c.grossSales)}</td>
                    <td className="px-6 py-3 text-right text-red-700 tabular-nums">{formatMoney(c.totalExpenses)}</td>
                    <td className={`px-6 py-3 text-right font-semibold tabular-nums ${c.netProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
                      {formatMoney(c.netProfit)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
      )}

      {pendingExpense && (
        <DeleteConfirmDialog
          title="Remove this expense?"
          message={`Removing "${pendingExpense.description}" (${formatMoney(Number(pendingExpense.amount))}) from ${date} cannot be undone.`}
          confirmLabel="Remove expense"
          onConfirm={confirmRemoveExpense}
          onCancel={() => setPendingExpense(null)}
        />
      )}

      {confirmingClose && (
        <DeleteConfirmDialog
          title={`Close ${date}?`}
          message={`Gross sales ${formatMoney(closing.grossSales)} minus expenses ${formatMoney(closing.totalExpenses)} locks in a net profit of ${formatMoney(closing.netProfit)}. Once closed, expenses for this date can no longer be added or removed.`}
          confirmLabel="Close day"
          onConfirm={confirmCloseDay}
          onCancel={() => setConfirmingClose(false)}
        />
      )}
    </div>
  );
}
