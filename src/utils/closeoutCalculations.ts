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

/**
 * Remove NY sales tax.
 */
export function removeTax(amount: number): number {
  return amount / 1.08875;
}

/**
 * Estimate customer tip at 18%.
 */
export function estimateTip(amount: number): number {
  return removeTax(amount) * 0.18;
}

/**
 * Safe number.
 */
export function num(value: string): number {
  return Number(value || 0);
}


/**
 * Calculate all server tip fields.
 */
export function calculateServerRow(
  row: ServerRow,
  bartenderEnabled: boolean,
  bartenderPercent: number,
  busboyPercent: number
) {
  const ccSales = num(row.ccSales);
  const cashSales = num(row.cashSales);
  const ccTipEntered = num(row.ccTips);

  const ccEstimatedTip = estimateTip(ccSales);
  const cashEstimatedTip = estimateTip(cashSales);

  const bartenderRate = bartenderEnabled
    ? bartenderPercent / 100
    : 0;

  const busboyRate = busboyPercent / 100;

  const bartenderCc =
    ccEstimatedTip * bartenderRate;

  const bartenderCash =
    cashEstimatedTip * bartenderRate;

  let bbCc =
    ccEstimatedTip * busboyRate;

  let bbCash =
    cashEstimatedTip * busboyRate;

  /**
   * If BB CC exceeds entered CC tips,
   * move difference to cash.
   */
  if (bbCc > ccTipEntered) {
    const shortage = bbCc - ccTipEntered;

    bbCc = ccTipEntered;
    bbCash += shortage;
  }

  const serverCc =
    Math.max(0, ccTipEntered - bbCc);

  const totalEstimatedTip =
    estimateTip(ccSales + cashSales);

  const serverCash =
    Math.max(
      0,
      totalEstimatedTip -
        serverCc -
        bbCc -
        bbCash -
        bartenderCc -
        bartenderCash
    );

  return {
    bartenderCc,
    bartenderCash,
    bbCc,
    bbCash,
    serverCc,
    serverCash,
  };
}