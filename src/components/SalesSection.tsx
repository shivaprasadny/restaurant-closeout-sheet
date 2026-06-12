import type { SalesRow } from "../types/closeout.types";

/**
 * AM / PM Sales section.
 * --------------------------------------------------
 * Take Out:
 * - AM and PM are manual inputs.
 * - Total is calculated from AM + PM.
 *
 * Server:
 * - AM, PM, Total come from Server Checkout tables.
 *
 * House Charge:
 * - AM, PM, Total come from Page 2 House Charge Details.
 *
 * Total row:
 * - Adds Take Out + Server + House Charge.
 */

type Props = {
  salesRows: SalesRow[];
  onChange: (index: number, field: keyof SalesRow, value: string) => void;

  // Take Out calculated total
  takeOutTotal: string;

  // Server totals from AM / PM server tables
  amServerTotal: string;
  pmServerTotal: string;
  serverTotal: string;

  // House charge totals from Page 2
  amHouseChargeBase: string;
  pmHouseChargeBase: string;
  totalHouseChargeBase: string;

  // Final sales totals
  amSalesTotal: string;
  pmSalesTotal: string;
  grandSalesTotal: string;
};

export default function SalesSection({
  salesRows,
  onChange,
  takeOutTotal,
  amServerTotal,
  pmServerTotal,
  serverTotal,
  amHouseChargeBase,
  pmHouseChargeBase,
  totalHouseChargeBase,
  amSalesTotal,
  pmSalesTotal,
  grandSalesTotal,
}: Props) {
  return (
    <div className="box">
      <h2>AM / PM SALES</h2>

      <table>
        <thead>
          <tr>
            <th>Sales Type</th>
            <th>AM</th>
            <th>PM</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {salesRows.map((row, index) => {
            const isTakeOut = row.label === "Take Out";
            const isServer = row.label === "Server";
            const isHouseCharge = row.label === "House Charge";

            return (
              <tr key={row.label}>
                <td>{row.label}</td>

                {/* AM column */}
                <td>
                  <input
                    value={
                      isServer
                        ? amServerTotal
                        : isHouseCharge
                        ? amHouseChargeBase
                        : row.am
                    }
                    readOnly={isServer || isHouseCharge}
                    onChange={(e) => onChange(index, "am", e.target.value)}
                  />
                </td>

                {/* PM column */}
                <td>
                  <input
                    value={
                      isServer
                        ? pmServerTotal
                        : isHouseCharge
                        ? pmHouseChargeBase
                        : row.pm
                    }
                    readOnly={isServer || isHouseCharge}
                    onChange={(e) => onChange(index, "pm", e.target.value)}
                  />
                </td>

                {/* Total column */}
                <td>
                  <input
                    value={
                      isTakeOut
                        ? takeOutTotal
                        : isServer
                        ? serverTotal
                        : isHouseCharge
                        ? totalHouseChargeBase
                        : row.total
                    }
                    readOnly={isTakeOut || isServer || isHouseCharge}
                    onChange={(e) => onChange(index, "total", e.target.value)}
                  />
                </td>
              </tr>
            );
          })}

          {/* Final total row */}
          <tr className="total-row">
            <td>Total</td>
            <td>{amSalesTotal}</td>
            <td>{pmSalesTotal}</td>
            <td>{grandSalesTotal}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}