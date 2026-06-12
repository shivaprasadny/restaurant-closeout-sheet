import type{ ExpenseRow } from "../types/closeout.types";
import { money } from "../utils/closeoutCalculations";
import SectionHeader from "./SectionHeader";

/**
 * Expense Table
 * -----------------------------------------
 * Used for:
 * - AM Expenses
 * - PM Expenses
 *
 * Shows:
 * - Description
 * - Amount
 * - Total row
 */

type Props = {
  title: string;
  rows: ExpenseRow[];
  totalAmount: number;
  shift: "AM" | "PM";
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (
    shift: "AM" | "PM",
    index: number,
    field: keyof ExpenseRow,
    value: string
  ) => void;
};

export default function ExpenseTable({
  title,
  rows,
  totalAmount,
  shift,
  onAdd,
  onRemove,
  onChange,
}: Props) {
  return (
    <div className="box compact-section">
      <SectionHeader
        title={title}
        buttonText="+ Add Expense"
        onAdd={onAdd}
      />

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
            <th className="no-print">X</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                <input
                  value={row.description}
                  onChange={(e) =>
                    onChange(shift, index, "description", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  value={row.amount}
                  onChange={(e) =>
                    onChange(shift, index, "amount", e.target.value)
                  }
                />
              </td>

              <td className="no-print">
                <button
                  className="delete-btn"
                  onClick={() => onRemove(index)}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}

          {/* Total Row */}
          <tr className="total-row">
            <td>
              <strong>Total</strong>
            </td>

            <td>
              <strong>{money(totalAmount)}</strong>
            </td>

            <td className="no-print"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}