import type {
  ExpenseRow,
  HouseChargeRow,
} from "../types/closeout.types";

import type { SalesRow } from "../types/closeout.types";
import type { ServerRow } from "../types/closeout.types";
/**
 * Convert string to number safely
 */
export function toNumber(value: string): number {
  return Number(value || 0);
}

/**
 * Format money
 */
export function money(value: number): string {
  return value.toFixed(2);
}

/**
 * Expense total
 */
export function getExpenseTotal(
  rows: ExpenseRow[]
): number {
  return rows.reduce(
    (sum, row) => sum + toNumber(row.amount),
    0
  );
}

/**
 * House charge totals
 */
export function getHouseChargeTotals(
  rows: HouseChargeRow[]
) {
  return rows.reduce(
    (totals, row) => ({
      tickets: totals.tickets + toNumber(row.tickets),
      baseTotal:
        totals.baseTotal + toNumber(row.baseTotal),
      tips:
        totals.tips + toNumber(row.tips),
      grandTotal:
  totals.grandTotal +
  toNumber(row.baseTotal) +
  toNumber(row.tips),
    }),
    {
      tickets: 0,
      baseTotal: 0,
      tips: 0,
      grandTotal: 0,
    }
  );
}



/**
 * Get totals for AM / PM Sales section.
 * House Charge values are passed separately because they come from Page 2.
 */
export function getSalesTotals(
  salesRows: SalesRow[],
  amServerTotal: number,
  pmServerTotal: number,
  amHouseChargeTotal: number,
  pmHouseChargeTotal: number
) {
  const takeOutAM = Number(salesRows[0]?.am || 0);
  const takeOutPM = Number(salesRows[0]?.pm || 0);

  const am =
    takeOutAM +
    amServerTotal +
    amHouseChargeTotal;

  const pm =
    takeOutPM +
    pmServerTotal +
    pmHouseChargeTotal;

  return {
    am,
    pm,
    total: am + pm,
  };
}

export function getServerTotal(rows: ServerRow[]): number {
  return rows.reduce(
    (sum, row) => sum + Number(row.total || 0),
    0
  );
}



/**
 * Total BB CC from server checkout.
 */
export function getBusboyFloorTipTotal(
  servers: ServerRow[]
): number {
  return servers.reduce(
    (sum, row) => sum + Number(row.bbCcTips || 0),
    0
  );
}