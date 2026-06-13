import type { Dispatch, SetStateAction } from "react";
import type { ServerRow } from "../types/closeout.types";
import { emptyServer } from "../data/defaultRows";
import {
  calculateServerRow,
  money,
  num,
} from "../utils/closeoutCalculations";

/**
 * ServerTable
 * --------------------------------------------------
 * Reusable table for:
 * - AM Server / Waiter Checkout
 * - PM Server / Waiter Checkout
 *
 * Manual fields:
 * - Name
 * - Total
 * - Food
 * - Alcohol
 * - Tables
 * - Guests
 * - Average
 * - CC Sale
 * - Cash Sale
 * - CC Tip
 *
 * Auto fields:
 * - Server CC Tip
 * - Server Cash Tip
 * - BB CC Tip
 * - BB Cash Tip
 *
 * Bartender controls:
 * - Hidden in print
 * - Tip Out % default comes from CloseoutPage
 * - CC and Cash totals are calculated from all server rows
 */

type ServerTableProps = {
  title: string;
  rows: ServerRow[];
  setRows: Dispatch<SetStateAction<ServerRow[]>>;

  /**
   * Bartender tip-out percentage.
   * Default should be 8 from CloseoutPage.
   */
  tipOutPercent: string;
  onTipOutPercentChange: (value: string) => void;

  /**
   * If false, bartender calculation becomes 0.
   */
  bartenderEnabled: boolean;
  onBartenderEnabledChange: (value: boolean) => void;

  /**
   * Busboy percentage comes from Busboy section.
   * Default should be 23 from CloseoutPage.
   */
  busboyPercent: string;
  hasBusboy: boolean;
  autoSplitTips: boolean;
onAutoSplitTipsChange: (value: boolean) => void;
};

export default function ServerTable({
  title,
  rows,
  setRows,
  tipOutPercent,
  onTipOutPercentChange,
  hasBusboy,
  bartenderEnabled,
  autoSplitTips,
  onAutoSplitTipsChange,
  onBartenderEnabledChange,
  busboyPercent,
}: ServerTableProps) {
  /**
   * Convert percent strings to numbers.
   */
  const bartenderPercentNumber = num(tipOutPercent);
  const busboyPercentNumber = num(busboyPercent);

  /**
   * Calculate bartender totals for the header.
   */
  const bartenderTotals = rows.reduce(
    (totals, row) => {
    const calculated = calculateServerRow(
  row,
  bartenderEnabled,
  bartenderPercentNumber,
  hasBusboy ? busboyPercentNumber : 0
);

      return {
        cc: totals.cc + calculated.bartenderCc,
        cash: totals.cash + calculated.bartenderCash,
      };
    },
    {
      cc: 0,
      cash: 0,
    }
  );




function getPooledServerTips(index: number) {
  const currentRow = rows[index];

  const currentPool = currentRow.poolGroup?.trim().toUpperCase();

  const currentCalculated = calculateServerRow(
    currentRow,
    bartenderEnabled,
    bartenderPercentNumber,
    hasBusboy ? busboyPercentNumber : 0
  );

  // No pool means server keeps own tips.
  if (!currentPool) {
    return {
      serverCc: currentCalculated.serverCc,
      serverCash: currentCalculated.serverCash,
    };
  }

  const pooledRows = rows.filter(
    (row) =>
      row.poolGroup?.trim().toUpperCase() === currentPool
  );

  if (pooledRows.length === 0) {
    return {
      serverCc: currentCalculated.serverCc,
      serverCash: currentCalculated.serverCash,
    };
  }

  const poolTotals = pooledRows.reduce(
    (totals, row) => {
      const calculated = calculateServerRow(
        row,
        bartenderEnabled,
        bartenderPercentNumber,
        hasBusboy ? busboyPercentNumber : 0
      );

      return {
        serverCc: totals.serverCc + calculated.serverCc,
        serverCash: totals.serverCash + calculated.serverCash,
      };
    },
    {
      serverCc: 0,
      serverCash: 0,
    }
  );

  return {
    serverCc: poolTotals.serverCc / pooledRows.length,
    serverCash: poolTotals.serverCash / pooledRows.length,
  };
}



  /**
   * Update only manual fields in a server row.
   */
  function updateServer(index: number, field: keyof ServerRow, value: string) {
  setRows((prev) =>
    prev.map((row, i) => {
      if (i !== index) return row;

const cleanValue =
  field === "poolGroup" ? value.toUpperCase() : value;

const updatedRow = {
  ...row,
  [field]: cleanValue,
};

      const total = Number(updatedRow.total || 0);
      const food = Number(updatedRow.food || 0);
      const alcohol = Number(updatedRow.alcohol || 0);
      const ccSale = Number(updatedRow.ccSales || 0);
      const cashSale = Number(updatedRow.cashSales || 0);
      const guests = Number(updatedRow.guests || 0);

      // Food + Alcohol = Total
      if (field === "food" && total > 0) {
        updatedRow.alcohol = Math.max(0, total - food).toFixed(2);
      }

      if (field === "alcohol" && total > 0) {
        updatedRow.food = Math.max(0, total - alcohol).toFixed(2);
      }

      // CC Sale + Cash Sale = Total
      if (field === "ccSales" && total > 0) {
        updatedRow.cashSales = Math.max(0, total - ccSale).toFixed(2);
      }

      if (field === "cashSales" && total > 0) {
        updatedRow.ccSales = Math.max(0, total - cashSale).toFixed(2);
      }

      // Average = Total / Guests
      if ((field === "total" || field === "guests") && guests > 0) {
        updatedRow.average = (total / guests).toFixed(2);
      }

      return updatedRow;
    })
  );
}

  /**
   * Add one blank server row.
   */
  function addServer() {
    setRows((prev) => [...prev, { ...emptyServer }]);
  }

  /**
   * Delete one server row.
   */
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

          <label className="bartender-tip-inline">
            CC
            <input value={money(bartenderTotals.cc)} readOnly />
          </label>

          <label className="bartender-tip-inline">
            Cash
            <input value={money(bartenderTotals.cash)} readOnly />
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

<label className="bartender-check no-print">
  <input
    type="checkbox"
    checked={autoSplitTips}
    onChange={(e) =>
      onAutoSplitTipsChange(e.target.checked)
    }
  />
  Auto Tips
</label>
        

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
            <th className="no-print">Pool</th>
            <th className="no-print">X</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => {
            const calculated = calculateServerRow(
  row,
  bartenderEnabled,
  bartenderPercentNumber,
  hasBusboy ? busboyPercentNumber : 0
);
const pooledTips = getPooledServerTips(index);

            return (
              <tr key={index}>
                <td>
                  <input
                    value={row.name}
                    onChange={(e) =>
                      updateServer(index, "name", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    value={row.total}
                    onChange={(e) =>
                      updateServer(index, "total", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    value={row.food}
                    onChange={(e) =>
                      updateServer(index, "food", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    value={row.alcohol}
                    onChange={(e) =>
                      updateServer(index, "alcohol", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    value={row.tables}
                    onChange={(e) =>
                      updateServer(index, "tables", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    value={row.guests}
                    onChange={(e) =>
                      updateServer(index, "guests", e.target.value)
                    }
                  />
                </td>

                <td>
  <input
    className="avg-input"
    value={row.average}
    onChange={(e) =>
      updateServer(index, "average", e.target.value)
    }
  />
</td>

                <td>
                  <input
                    value={row.ccSales}
                    onChange={(e) =>
                      updateServer(index, "ccSales", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    value={row.cashSales}
                    onChange={(e) =>
                      updateServer(index, "cashSales", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    value={row.ccTips}
                    onChange={(e) =>
                      updateServer(index, "ccTips", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
  value={
    autoSplitTips
      ? money(pooledTips.serverCc)
      : row.serverCcTips
  }
  readOnly={autoSplitTips}
  onChange={(e) =>
    updateServer(
      index,
      "serverCcTips",
      e.target.value
    )
  }
/>
                </td>

                <td>
                 <input
  value={
    autoSplitTips
      ? money(pooledTips.serverCash)
      : row.serverCashTips
  }
  readOnly={autoSplitTips}
  onChange={(e) =>
    updateServer(
      index,
      "serverCashTips",
      e.target.value
    )
  }
/>
                </td>

                <td>
                  <input
  value={
    autoSplitTips
      ? money(calculated.bbCc)
      : row.bbCcTips
  }
  readOnly={autoSplitTips}
  onChange={(e) =>
    updateServer(index, "bbCcTips", e.target.value)
  }
/>
                </td>

                <td>
                  <input
  value={
    autoSplitTips
      ? money(calculated.bbCash)
      : row.bbCashTips
  }
  readOnly={autoSplitTips}
  onChange={(e) =>
    updateServer(index, "bbCashTips", e.target.value)
  }
/>
                </td>

                <td className="no-print">
  <input
    className="pool-input"
    value={row.poolGroup}
    onChange={(e) =>
      updateServer(
        index,
        "poolGroup",
        e.target.value.toUpperCase()
      )
    }
  />
</td>

                <td className="no-print">
                  <button
                    className="delete-btn"
                    onClick={() => removeServer(index)}
                  >
                    ×
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}