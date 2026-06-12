import type{ CheckLogRow } from "../types/closeout.types";
import SectionHeader from "./SectionHeader";

/**
 * Check Log Table
 * -----------------------------------------
 * Used for:
 * - AM Check Log
 * - PM Check Log
 */

type Props = {
  title: string;
  rows: CheckLogRow[];
  shift: "AM" | "PM";
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (
    shift: "AM" | "PM",
    index: number,
    field: keyof CheckLogRow,
    value: string
  ) => void;
};

export default function CheckLogTable({
  title,
  rows,
  shift,
  onAdd,
  onRemove,
  onChange,
}: Props) {
  return (
    <div className="box compact-section">
      <SectionHeader
        title={title}
        buttonText="+ Add Check Log"
        onAdd={onAdd}
      />

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Check Begin</th>
            <th>Check End</th>
            <th className="no-print">X</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                <input
                  value={row.name}
                  onChange={(e) =>
                    onChange(shift, index, "name", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  value={row.checkBegin}
                  onChange={(e) =>
                    onChange(shift, index, "checkBegin", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  value={row.checkEnd}
                  onChange={(e) =>
                    onChange(shift, index, "checkEnd", e.target.value)
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
        </tbody>
      </table>
    </div>
  );
}