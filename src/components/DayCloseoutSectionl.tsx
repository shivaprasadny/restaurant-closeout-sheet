import type { CloseOutRow } from "../types/closeout.types";

/**
 * Day Close Out section.
 */

type Props = {
  rows: CloseOutRow[];
  totalExpenses: string;
  onChange: (index: number, value: string) => void;
};

export default function DayCloseoutSection({
  rows,
  totalExpenses,
  onChange,
}: Props) {
  return (
    <div className="box">
      <h2>DAY CLOSE OUT</h2>

      <div className="closeout-grid">
        {rows.map((row, index) => {
          const isTotalExpenses = row.label === "Total Expenses";

          return (
            <label key={row.label}>
              {row.label}
              <input
                value={isTotalExpenses ? totalExpenses : row.amount}
                readOnly={isTotalExpenses}
                onChange={(e) => onChange(index, e.target.value)}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}