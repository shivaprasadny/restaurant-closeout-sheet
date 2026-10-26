import type { TipRow } from "../types/closeout.types";
import {
  getCompactEmployeeName,
  getEmployeesForPosition,
} from "../data/employees";
import {
  DEFAULT_BUSBOY_SHARE,
  getBusboyShareRatio,
} from "../utils/closeoutCalculations";

// Share buttons move 5% at a time, between 5% and 100%
const BUSBOY_SHARE_STEP = 5;

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
 * - Has Share column: manager decides each busboy's part of the pool.
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
  const shiftClass = type.startsWith("AM")
    ? "shift-card-am"
    : "shift-card-pm";
  const employeePosition = isBusboy ? "BB" : "Manager";
  const employeeListId = `tip-names-${type.toLowerCase()}`;
  const employeeOptions = getEmployeesForPosition(employeePosition);

  return (
    <div className={`box compact-section ${shiftClass}`}>
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
    rows.forEach((_, rowIndex) => {
      const shareRatio = getBusboyShareRatio(rows, rowIndex);

      if (shareRatio === 0) {
        onChange(type, rowIndex, "floorTips", "");
        onChange(type, rowIndex, "cashTips", "");
        return;
      }

      const floorAmount = floorTipPool * shareRatio;
      const cashAmount = cashTipPool * shareRatio;

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

      <datalist id={employeeListId}>
        {employeeOptions.map((employee) => (
          <option
            key={employee.name}
            value={getCompactEmployeeName(employee.name)}
          />
        ))}
      </datalist>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            {isBusboy && <th className="busboy-share-col no-print">Share</th>}
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
            // Busboy tips are split by each busboy's Share.
            // Manager floor tips stay manual.
            const shareRatio = isBusboy ? getBusboyShareRatio(rows, index) : 0;
            const shareValue = row.share?.trim()
              ? Number(row.share)
              : DEFAULT_BUSBOY_SHARE;

          const floorTips =
  isBusboy
    ? autoSplit
      ? floorTipPool * shareRatio
      : Number(row.floorTips || 0)
    : Number(row.floorTips || 0);



              const cashTips =
  isBusboy
    ? autoSplit
      ? cashTipPool * shareRatio
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
    list={employeeListId}
    value={row.name}
    onChange={(e) =>
      onChange(type, index, "name", e.target.value)
    }
  />
</td>

{isBusboy && (
  <td className="busboy-share-col no-print">
    <div className="busboy-share-stepper">
      <button
        type="button"
        aria-label={`Lower ${row.name || "busboy"} share`}
        disabled={shareValue <= BUSBOY_SHARE_STEP}
        onClick={() =>
          onChange(type, index, "share", String(shareValue - BUSBOY_SHARE_STEP))
        }
      >
        −
      </button>
      <span>{shareValue}%</span>
      <button
        type="button"
        aria-label={`Raise ${row.name || "busboy"} share`}
        disabled={shareValue >= DEFAULT_BUSBOY_SHARE}
        onClick={() =>
          onChange(type, index, "share", String(shareValue + BUSBOY_SHARE_STEP))
        }
      >
        +
      </button>
    </div>
  </td>
)}

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
