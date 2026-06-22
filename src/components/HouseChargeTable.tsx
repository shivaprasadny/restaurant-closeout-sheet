import type { HouseChargeRow } from "../types/closeout.types";
import { money } from "../utils/closeoutCalculations";
import SectionHeader from "./SectionHeader";

/**
 * HouseChargeTable
 * --------------------------------------------------
 * Reusable table for:
 * - AM House Charge Details
 * - PM House Charge Details
 *
 * It also shows calculated total row.
 */

type HouseChargeTotals = {
  tickets: number;
  baseTotal: number;
  tips: number;
  grandTotal: number;
};

type Props = {
  title: string;
  rows: HouseChargeRow[];
  totals: HouseChargeTotals;
  shift: "AM" | "PM";
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (
    shift: "AM" | "PM",
    index: number,
    field: keyof HouseChargeRow,
    value: string
  ) => void;
};

export default function HouseChargeTable({
  title,
  rows,
  totals,
  shift,
  onAdd,
  onRemove,
  onChange,
}: Props) {
  const shiftClass = shift === "AM" ? "shift-card-am" : "shift-card-pm";

  return (
    <div className={`box compact-section ${shiftClass}`}>
      <SectionHeader
        title={title}
        buttonText="+ Add Company"
        onAdd={onAdd}
      />

      <table>
        <thead>
          <tr>
            <th>Company Name</th>
            <th>Tickets</th>
            <th>Base $</th>
            <th>Tips $</th>
            <th>Grand $</th>
            <th className="no-print">X</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                <input
                  value={row.companyName}
                  onChange={(e) =>
                    onChange(shift, index, "companyName", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  value={row.tickets}
                  onChange={(e) =>
                    onChange(shift, index, "tickets", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  value={row.baseTotal}
                  onChange={(e) =>
                    onChange(shift, index, "baseTotal", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  value={row.tips}
                  onChange={(e) =>
                    onChange(shift, index, "tips", e.target.value)
                  }
                />
              </td>

              <td>
  <input
    value={row.grandTotal}
    onChange={(e) =>
      onChange(shift, index, "grandTotal", e.target.value)
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

          {/* Calculated total row */}
          <tr className="total-row">
            <td>Total</td>
            <td>{money(totals.tickets)}</td>
            <td>{money(totals.baseTotal)}</td>
            <td>{money(totals.tips)}</td>
            <td>{money(totals.grandTotal)}</td>
            <td className="no-print"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
