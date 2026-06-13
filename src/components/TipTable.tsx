import type { TipRow } from "../types/closeout.types";

/**
 * TipTable
 * --------------------------------------------------
 * Reusable table for:
 * - AM Busboy
 * - PM Busboy
 * - AM Manager
 * - PM Manager
 *
 * Busboy:
 * - Has extra Cash Tips column.
 * - Floor Tips can later come from server BB CC split.
 *
 * Manager:
 * - No Cash Tips column.
 *
 * Total Tips:
 * - House Charge Tips + CC Tips + Floor Tips
 * - Cash Tips is separate and NOT included in Total Tips.
 */

type TipTableType =
  | "AM_BUSBOY"
  | "PM_BUSBOY"
  | "AM_MANAGER"
  | "PM_MANAGER";

type Props = {
  title: string;
  type: TipTableType;
  rows: TipRow[];
  percent?: string;
  floorTipPool?: number;
  cashTipPool?: number;
  autoSplit?: boolean;
onAutoSplitChange?: (value: boolean) => void;
  onPercentChange?: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (
    type: TipTableType,
    index: number,
    field: keyof TipRow,
    value: string
  ) => void;
};

export default function TipTable({
  title,
  type,
  rows,
  percent,
  floorTipPool = 0,
  cashTipPool = 0,
  onPercentChange,
  autoSplit = true,
onAutoSplitChange,
  onAdd,
  onRemove,
  onChange,
  
}: Props) {
  const isBusboy = type === "AM_BUSBOY" || type === "PM_BUSBOY";

  return (
    <div className="box compact-section">
      <div className="section-title-row">
        <h2>{title}</h2>

        {onPercentChange && (
          <label className="tip-percent-inline">
            Tip Out %
            <input
              value={percent}
              onChange={(e) => onPercentChange(e.target.value)}
            />
          </label>
        )}
        {isBusboy && onAutoSplitChange && (
 <label className="tip-percent-inline no-print">
  <input
    type="checkbox"
    checked={autoSplit}
    onChange={(e) => {
  const checked = e.target.checked;

  // When turning Auto Split OFF,
  // copy current calculated values into editable inputs.
  if (!checked && isBusboy) {
    const activeBusboyCount = rows.filter(
      (r) => r.name.trim() !== ""
    ).length;

    rows.forEach((row, rowIndex) => {
      if (row.name.trim() === "" || activeBusboyCount === 0) {
        onChange(type, rowIndex, "floorTips", "");
        onChange(type, rowIndex, "cashTips", "");
        return;
      }

      const floorAmount = floorTipPool / activeBusboyCount;
      const cashAmount = cashTipPool / activeBusboyCount;

      onChange(type, rowIndex, "floorTips", floorAmount.toFixed(2));
      onChange(type, rowIndex, "cashTips", cashAmount.toFixed(2));
    });
  }

  onAutoSplitChange?.(checked);
}}
  />
  Auto Split
</label>
)}

        <button className="small-btn no-print" onClick={onAdd}>
          + Add
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>House Chg Tips</th>
            <th>CC Tips</th>
            <th>Floor Tips</th>
            <th>Total Tips</th>

            {isBusboy && <th>Cash Tips</th>}

            <th className="no-print">X</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => {
            // Count only busboys with a name.
            const activeBusboyCount = isBusboy
              ? rows.filter((r) => r.name.trim() !== "").length
              : 0;

            // Busboy floor tips are split by active busboys.
            // Manager floor tips stay manual.
          const floorTips =
  isBusboy
    ? autoSplit
      ? row.name.trim() !== "" && activeBusboyCount > 0
        ? floorTipPool / activeBusboyCount
        : 0
      : Number(row.floorTips || 0)
    : Number(row.floorTips || 0);



              const cashTips =
  isBusboy
    ? autoSplit
      ? row.name.trim() !== "" && activeBusboyCount > 0
        ? cashTipPool / activeBusboyCount
        : 0
      : Number(row.cashTips || 0)
    : 0;

            // Cash Tips is separate, not included here.
            const totalTips =
              Number(row.houseChargeTips || 0) +
              Number(row.ccTips || 0) +
              floorTips;

            return (
              <tr key={index}>
              
  

<td>
  <input
    value={row.name}
    onChange={(e) =>
      onChange(type, index, "name", e.target.value)
    }
  />
</td>

<td>
  <input
    value={row.houseChargeTips}
    onChange={(e) =>
      onChange(type, index, "houseChargeTips", e.target.value)
    }
  />
</td>

<td>
  <input
    value={row.ccTips}
    onChange={(e) =>
      onChange(type, index, "ccTips", e.target.value)
    }
  />
</td>

<td>
  <input
    value={
  isBusboy
    ? autoSplit
      ? floorTips.toFixed(2)
      : row.floorTips
    : row.floorTips
}
  readOnly={isBusboy && autoSplit}
    onChange={(e) =>
      onChange(type, index, "floorTips", e.target.value)
    }
  />
</td>

<td>
  <input
    value={totalTips.toFixed(2)}
    readOnly
  />
</td>

{isBusboy && (
  <td>
    <input
      value={
        autoSplit
          ? cashTips.toFixed(2)
          : row.cashTips
      }
      readOnly={autoSplit}
      onChange={(e) =>
        onChange(
          type,
          index,
          "cashTips",
          e.target.value
        )
      }
    />
  </td>
)}
<td className="no-print">
  <button
    type="button"
    className="delete-btn"
    onClick={() => onRemove(index)}
  >
    ×
  </button>
</td>


              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}