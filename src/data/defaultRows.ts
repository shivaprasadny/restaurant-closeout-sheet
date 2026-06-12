/**
 * Default empty rows and starter data for Restaurant Close-Out app.
 * Keeping defaults here makes CloseoutPage cleaner.
 */

import type {
  ServerRow,
  TipRow,
  ExpenseRow,
  HouseChargeRow,
  CheckLogRow,
  SalesRow,
  CloseOutRow,
} from "../types/closeout.types";

/**
 * Helper to create multiple blank rows.
 */
export function makeRows<T>(count: number, row: T): T[] {
  return Array.from({ length: count }, () => ({ ...row }));
}

/**
 * Empty server row.
 */
export const emptyServer: ServerRow = {
  name: "",
  total: "",
  food: "",
  alcohol: "",
  tables: "",
  guests: "",
  average: "",
  ccSales: "",
  cashSales: "",
  ccTips: "",
  serverCcTips: "",
  serverCashTips: "",
  bbCcTips: "",
  bbCashTips: "",
};

/**
 * Empty busboy / manager row.
 */
export const emptyTipRow: TipRow = {
  name: "",
  houseChargeTips: "",
  ccTips: "",
  floorTips: "",
  totalTips: "",
  cashTips: "",
};

/**
 * Empty expense row.
 */
export const emptyExpense: ExpenseRow = {
  description: "",
  amount: "",
};

/**
 * Empty house charge row.
 */
export const emptyHouseCharge: HouseChargeRow = {
  companyName: "",
  tickets: "",
  baseTotal: "",
  tips: "",
  grandTotal: "",
};

/**
 * Empty check log row.
 */
export const emptyCheckLog: CheckLogRow = {
  name: "",
  checkBegin: "",
  checkEnd: "",
};

/**
 * Default AM / PM sales rows.
 */
export const defaultSalesRows: SalesRow[] = [
  { label: "Take Out", am: "", pm: "", total: "" },
  { label: "Server", am: "", pm: "", total: "" },
  { label: "House Charge", am: "", pm: "", total: "" },
];

/**
 * Default Day Close Out rows.
 */
export const defaultCloseOutRows: CloseOutRow[] = [
  { label: "Grand Total", amount: "" },
  { label: "Credit Card Sales", amount: "" },
  { label: "Net", amount: "" },
  { label: "Total Expenses", amount: "" },
  { label: "House Charges", amount: "" },
  { label: "Cash To Office", amount: "" },
  { label: "Notes", amount: "" },
];

/**
 * Default house charge companies.
 */
export const defaultHouseChargeNames = [
  "GrubHub",
  "Seamless",
  "Delivery.com",
  "Slice",
  "247 Waiter",
  "DoorDash",
  "Uber Eats",
  "Sharebite",
];

/**
 * Empty manager row.
 * Floor Tips default to 0 for managers.
 */
export const emptyManagerTipRow: TipRow = {
  name: "",
  houseChargeTips: "",
  ccTips: "",
  floorTips: "0",
  totalTips: "",
  cashTips:"",
};