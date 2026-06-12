import type { Dispatch, SetStateAction } from "react";
import type { ServerRow } from "../types/closeout.types";
import { emptyServer } from "../data/defaultRows";

/**
 * ServerTable
 * --------------------------------------------------
 * Reusable table for AM and PM server checkout.
 *
 * Header includes:
 * - Tip Out % default 8
 * - Optional Bartender checkbox
 */

type ServerTableProps = {
  title: string;
  rows: ServerRow[];
  setRows: Dispatch<SetStateAction<ServerRow[]>>;

  tipOutPercent: string;
  onTipOutPercentChange: (value: string) => void;

  bartenderEnabled: boolean;
  onBartenderEnabledChange: (value: boolean) => void;
};

export default function ServerTable({
  title,
  rows,
  setRows,
  tipOutPercent,
  onTipOutPercentChange,
  bartenderEnabled,
  onBartenderEnabledChange,
}: ServerTableProps) {
  function updateServer(index: number, field: keyof ServerRow, value: string) {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );
  }

  function addServer() {
    setRows((prev) => [...prev, { ...emptyServer }]);
  }

  function removeServer(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <section className="box compact-section">
      <div className="section-title-row server-header-row">
        <h2>{title}</h2>


<div className="server-options no-print">
  <label className="tip-percent-inline">
    Tip Out %
    <input
      value={tipOutPercent}
      onChange={(e) => onTipOutPercentChange(e.target.value)}
    />
  </label>

  {/* Bartender CC tip amount - calculated later */}
  <label className="bartender-tip-inline">
    CC
    <input readOnly placeholder="0.00" />
  </label>

  {/* Bartender cash tip amount - calculated later */}
  <label className="bartender-tip-inline">
    Cash
    <input placeholder="0.00" />
  </label>

  <label className="bartender-check">
    <input
      type="checkbox"
      checked={bartenderEnabled}
      onChange={(e) => onBartenderEnabledChange(e.target.checked)}
    />
    Bartender
  </label>
</div>
       

        <button className="small-btn no-print" onClick={addServer}>
          + Add Server
        </button>
      </div>

      <table className="server-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Total</th>
            <th>Food</th>
            <th>Alc</th>
            <th>Tbl</th>
            <th>Gst</th>
            <th>Avg</th>
            <th>CC Sale</th>
            <th>Cash</th>
            <th>CC Tip</th>
            <th>Srv CC</th>
            <th>Srv Cash</th>
            <th>BB CC</th>
            <th>BB Cash</th>
            <th className="no-print">X</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {(Object.keys(row) as Array<keyof ServerRow>).map((field) => (
                <td key={field}>
                  <input
                    value={row[field]}
                    onChange={(e) =>
                      updateServer(index, field, e.target.value)
                    }
                  />
                </td>
              ))}

              <td className="no-print">
                <button
                  className="delete-btn"
                  onClick={() => removeServer(index)}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}