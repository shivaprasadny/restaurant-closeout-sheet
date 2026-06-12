/**
 * All TypeScript types for Restaurant Close-Out app.
 * Keeping types here makes components cleaner.
 */
export type HeaderData = {
  restaurantName: string;
  locationName: string;
  date: string;
  day: string;
  weather: string;
  managerAm: string;
  managerPm: string;
};

export type SalesRow = {
  label: string;
  am: string;
  pm: string;
  total: string;
};

export type ServerRow = {
  name: string;
  total: string;
  food: string;
  alcohol: string;
  tables: string;
  guests: string;
  average: string;
  ccSales: string;
  cashSales: string;
  ccTips: string;
  serverCcTips: string;
  serverCashTips: string;
  bbCcTips: string;
  bbCashTips: string;
};

export type TipRow = {
  name: string;
  houseChargeTips: string;
  ccTips: string;
  floorTips: string;
  totalTips: string;
  cashTips: string;

  floorTipsManual: string;
  cashTipsManual: string;
};

export type ExpenseRow = {
  description: string;
  amount: string;
};

export type CloseOutRow = {
  label: string;
  amount: string;
};

export type HouseChargeRow = {
  companyName: string;
  tickets: string;
  baseTotal: string;
  tips: string;
  grandTotal: string;
  lastEditedAmount: "baseTotal" | "grandTotal" | "";
};

export type CheckLogRow = {
  name: string;
  checkBegin: string;
  checkEnd: string;
};
