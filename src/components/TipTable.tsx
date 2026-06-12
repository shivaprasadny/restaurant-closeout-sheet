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
 * - Floor Tips are auto-calculated from server BB CC total.
 * - Formula: Floor Tips = Server BB CC Total / Number of Busboys
 *
 * Manager:
 * - Floor Tips stay manual.
 *
 * Total Tips:
 * - House Charge Tips + CC Tips + Floor Tips
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
  onPercentChange,
  onAdd,
  onRemove,
  onChange,
}: Props) {
  const isBusboy = type === "AM_BUSBOY" || type === "PM_BUSBOY";

  /**
   * If this is busboy table, divide the server BB CC pool
   * by number of busboys.
   */
  const busboyFloorTipPerPerson =
    isBusboy && rows.length > 0 ? floorTipPool / rows.length : 0;

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
            <th className="no-print">X</th>
          </tr>
        </thead>

       <tbody>
  {rows.map((row, index) => {

    const activeBusboyCount = isBusboy
      ? rows.filter((r) => r.name.trim() !== "").length
      : 0;

    const floorTips =
      isBusboy && activeBusboyCount > 0
        ? floorTipPool / activeBusboyCount
        : Number(row.floorTips || 0);

    const totalTips =
      Number(row.houseChargeTips || 0) +
      Number(row.ccTips || 0) +
      floorTips;

            return (
              <tr key={index}>
                {(Object.keys(row) as Array<keyof TipRow>).map((field) => (
                  <td key={field}>
                    <input
                      value={
                        field === "floorTips" && isBusboy
                          ? floorTips.toFixed(2)
                          : field === "totalTips"
                          ? totalTips.toFixed(2)
                          : row[field]
                      }
                      readOnly={
                        field === "totalTips" ||
                        (field === "floorTips" && isBusboy)
                      }
                      onChange={(e) =>
                        onChange(type, index, field, e.target.value)
                      }
                    />
                  </td>
                ))}

                <td className="no-print">
                  <button
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