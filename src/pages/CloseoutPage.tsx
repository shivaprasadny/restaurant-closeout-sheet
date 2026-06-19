import { useState,useEffect } from "react";
import "../index.css";

/**
 * Main page for the Restaurant Close-Out app.
 *
 * This page owns the state.
 * Table UI is moved to components.
 * Types are moved to types/closeout.types.ts.
 * Default rows are moved to data/defaultRows.ts.
 * Calculations are moved to utils/closeoutCalculations.ts.
 */
import SalesSection from "../components/SalesSection";
import type {
  HeaderData,
  SalesRow,
  TipRow,
  ExpenseRow,
  CloseOutRow,
  HouseChargeRow,
  CheckLogRow,
} from "../types/closeout.types";

import {
  defaultSalesRows,
  defaultCloseOutRows,
  defaultHouseChargeNames,
  emptyHouseCharge,
  emptyCheckLog,
  emptyExpense,
  emptyServer,
  emptyTipRow,
  makeRows,
  emptyManagerTipRow,
} from "../data/defaultRows";

import {
  money,
  getExpenseTotal,
  getHouseChargeTotals,
  getServerTotal,
  calculateServerRow,
  num,
} from "../utils/closeoutCalculations";
import { capitalizeName } from "../utils/textFormatting";


import ServerTable from "../components/ServerTable";
import TipTable from "../components/TipTable";
import ExpenseTable from "../components/ExpenseTable";
import HouseChargeTable from "../components/HouseChargeTable";
import CheckLogTable from "../components/CheckLogTable";
import HeaderSection from "../components/HeaderSection";
import TimeSheet from "./TimeSheet";

type AppPage = "closeout" | "timesheet";

export default function CloseoutPage() {
  const [page, setPage] = useState<AppPage>(() =>
    window.location.hash === "#timesheet" ? "timesheet" : "closeout"
  );

    const STORAGE_KEY = "restaurant-closeout-draft-v1";
    const today = new Date().toISOString().split("T")[0];
  /* =========================
     HEADER STATE
  ========================= */
const [header, setHeader] = useState<HeaderData>({
  restaurantName: "",
  locationName: "",
  date: today,
  day: new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase(),
  weather: "",
  managerAm: "",
  managerPm: "",
});

  /* =========================
     PAGE 1 STATE
  ========================= */

  const [salesRows, setSalesRows] =
    useState<SalesRow[]>(defaultSalesRows);

  const [closeOutRows, setCloseOutRows] =
    useState<CloseOutRow[]>(defaultCloseOutRows);

  const [amServers, setAmServers] = useState(
    makeRows(2, emptyServer)
  );

  const [pmServers, setPmServers] = useState(
    makeRows(2, emptyServer)
  );


const [loadedFromStorage, setLoadedFromStorage] = useState(false);
// Server tip out percent for bar/bartender.
// Default is 8%, user can change it.
const [amServerTipOutPercent, setAmServerTipOutPercent] = useState("8");
const [pmServerTipOutPercent, setPmServerTipOutPercent] = useState("8");

const [amAutoSplitServerTips, setAmAutoSplitServerTips] = useState(true);
const [pmAutoSplitServerTips, setPmAutoSplitServerTips] = useState(true);


const [amEnabled, setAmEnabled] = useState(true);
const [pmEnabled, setPmEnabled] = useState(true);

// Bartender is optional.
// If checked, manager knows bartender/bar tip-out applies.
const [amBartenderEnabled, setAmBartenderEnabled] = useState(false);
const [pmBartenderEnabled, setPmBartenderEnabled] = useState(false);

  
 const [amBusboyPercent, setAmBusboyPercent] = useState("23");
const [pmBusboyPercent, setPmBusboyPercent] = useState("23");
  const [amBusboys, setAmBusboys] = useState(
    makeRows(2, emptyTipRow)
  );

  const [pmBusboys, setPmBusboys] = useState(
    makeRows(2, emptyTipRow)
  );
const [amManagers, setAmManagers] = useState(
  makeRows(1, emptyManagerTipRow)
);

const [pmManagers, setPmManagers] = useState(
  makeRows(1, emptyManagerTipRow)
);
  /* =========================
     PAGE 2 STATE
  ========================= */

  const [amExpenses, setAmExpenses] = useState(
    makeRows(4, emptyExpense)
  );

  const [pmExpenses, setPmExpenses] = useState(
    makeRows(4, emptyExpense)
  );

  const [amAutoSplitBusboy, setAmAutoSplitBusboy] = useState(true);
const [pmAutoSplitBusboy, setPmAutoSplitBusboy] = useState(true);

  const [amHouseCharges, setAmHouseCharges] = useState<HouseChargeRow[]>(
    defaultHouseChargeNames.map((name) => ({
      ...emptyHouseCharge,
      companyName: name,
    }))
  );

  const [pmHouseCharges, setPmHouseCharges] = useState<HouseChargeRow[]>(
    defaultHouseChargeNames.map((name) => ({
      ...emptyHouseCharge,
      companyName: name,
    }))
  );

  const [amCheckLogs, setAmCheckLogs] = useState(
    makeRows(4, emptyCheckLog)
  );

  const [pmCheckLogs, setPmCheckLogs] = useState(
    makeRows(4, emptyCheckLog)
  );

useEffect(() => {
  const handleHashChange = () => {
    setPage(
      window.location.hash === "#timesheet" ? "timesheet" : "closeout"
    );
  };

  window.addEventListener("hashchange", handleHashChange);
  return () => window.removeEventListener("hashchange", handleHashChange);
}, []);

useEffect(() => {
  const nextHash = page === "timesheet" ? "#timesheet" : "";

  if (window.location.hash !== nextHash) {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}${nextHash}`
    );
  }
}, [page]);



useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    setLoadedFromStorage(true);
    return;
  }

  const data = JSON.parse(saved);

  setHeader(data.header ?? header);
  setSalesRows(data.salesRows ?? defaultSalesRows);
  setCloseOutRows(data.closeOutRows ?? defaultCloseOutRows);

  setAmServers(data.amServers ?? makeRows(2, emptyServer));
  setPmServers(data.pmServers ?? makeRows(2, emptyServer));

  setAmBusboys(data.amBusboys ?? makeRows(2, emptyTipRow));
  setPmBusboys(data.pmBusboys ?? makeRows(2, emptyTipRow));

  setAmManagers(data.amManagers ?? makeRows(1, emptyManagerTipRow));
  setPmManagers(data.pmManagers ?? makeRows(1, emptyManagerTipRow));

  setAmExpenses(data.amExpenses ?? makeRows(4, emptyExpense));
  setPmExpenses(data.pmExpenses ?? makeRows(4, emptyExpense));

  setAmHouseCharges(data.amHouseCharges ?? amHouseCharges);
  setPmHouseCharges(data.pmHouseCharges ?? pmHouseCharges);

  setAmCheckLogs(data.amCheckLogs ?? makeRows(4, emptyCheckLog));
  setPmCheckLogs(data.pmCheckLogs ?? makeRows(4, emptyCheckLog));

  setAmBusboyPercent(data.amBusboyPercent ?? "23");
  setPmBusboyPercent(data.pmBusboyPercent ?? "23");

  setAmServerTipOutPercent(data.amServerTipOutPercent ?? "8");
  setPmServerTipOutPercent(data.pmServerTipOutPercent ?? "8");

  setAmBartenderEnabled(data.amBartenderEnabled ?? false);
  setPmBartenderEnabled(data.pmBartenderEnabled ?? false);

  setAmAutoSplitBusboy(data.amAutoSplitBusboy ?? true);
  setPmAutoSplitBusboy(data.pmAutoSplitBusboy ?? true);

  setLoadedFromStorage(true);
}, []);



useEffect(() => {
  if (!loadedFromStorage) return;

  const data = {
    header,
    salesRows,
    closeOutRows,
    amServers,
    pmServers,
    amBusboys,
    pmBusboys,
    amManagers,
    pmManagers,
    amExpenses,
    pmExpenses,
    amHouseCharges,
    pmHouseCharges,
    amCheckLogs,
    pmCheckLogs,
    amBusboyPercent,
    pmBusboyPercent,
    amServerTipOutPercent,
    pmServerTipOutPercent,
    amBartenderEnabled,
    pmBartenderEnabled,
    amAutoSplitBusboy,
    pmAutoSplitBusboy,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}, [
  loadedFromStorage,
  header,
  salesRows,
  closeOutRows,
  amServers,
  pmServers,
  amBusboys,
  pmBusboys,
  amManagers,
  pmManagers,
  amExpenses,
  pmExpenses,
  amHouseCharges,
  pmHouseCharges,
  amCheckLogs,
  pmCheckLogs,
  amBusboyPercent,
  pmBusboyPercent,
  amServerTipOutPercent,
  pmServerTipOutPercent,
  amBartenderEnabled,
  pmBartenderEnabled,
  amAutoSplitBusboy,
  pmAutoSplitBusboy,
]);



  /* =========================
     CALCULATED TOTALS
  ========================= */

  const amExpenseTotal = getExpenseTotal(amExpenses);
  const pmExpenseTotal = getExpenseTotal(pmExpenses);
  const allExpenseTotal = amExpenseTotal + pmExpenseTotal;

  const amHouseChargeTotals = getHouseChargeTotals(amHouseCharges);
  const pmHouseChargeTotals = getHouseChargeTotals(pmHouseCharges);
  const totalHouseChargeBase =
    amHouseChargeTotals.baseTotal + pmHouseChargeTotals.baseTotal;

   

/* =========================
   SALES TOTALS
========================= */

// Take Out is manually entered in Sales section.
const takeOutRow = salesRows.find((row) => row.label === "Take Out");

const takeOutAM = Number(takeOutRow?.am || 0);
const takeOutPM = Number(takeOutRow?.pm || 0);
const takeOutTotal = takeOutAM + takeOutPM;

// Server total comes from AM / PM Server Checkout table.
const amServerTotal = getServerTotal(amServers);
const pmServerTotal = getServerTotal(pmServers);
const serverTotal = amServerTotal + pmServerTotal;

// House Charge base total comes from Page 2 House Charge Details.
const amHouseChargeBase = amHouseChargeTotals.baseTotal;
const pmHouseChargeBase = pmHouseChargeTotals.baseTotal;
const houseChargeTotal = totalHouseChargeBase;



// Final AM / PM Sales totals.
const salesTotals = {
  am: takeOutAM + amServerTotal + amHouseChargeBase,
  pm: takeOutPM + pmServerTotal + pmHouseChargeBase,
  total: takeOutTotal + serverTotal + houseChargeTotal,
};


const amHasBusboy =
  amBusboys.some((b) => b.name.trim() !== "");

const pmHasBusboy =
  pmBusboys.some((b) => b.name.trim() !== "");
/* =========================
   BUSBOY POOLS FROM SERVER SECTION
========================= */

const amBusboyPools = amServers.reduce(
  (totals, row) => {
    const calculated = calculateServerRow(
      row,
      amBartenderEnabled,
      num(amServerTipOutPercent),
      num(amBusboyPercent)
    );

    return {
      cc: totals.cc + calculated.bbCc,
      cash: totals.cash + calculated.bbCash,
    };
  },
  { cc: 0, cash: 0 }
);

const pmBusboyPools = pmServers.reduce(
  (totals, row) => {
    const calculated = calculateServerRow(
      row,
      pmBartenderEnabled,
      num(pmServerTipOutPercent),
      num(pmBusboyPercent)
    );

    return {
      cc: totals.cc + calculated.bbCc,
      cash: totals.cash + calculated.bbCash,
    };
  },
  { cc: 0, cash: 0 }
);



/* =========================
   DAY CLOSE OUT TOTALS
========================= */

// Credit Card Sales is entered manually.
const creditCardRow = closeOutRows.find(
  (row) => row.label === "Credit Card Sales"
);

const creditCardSales = Number(creditCardRow?.amount || 0);

// Register Cash is entered manually.
// Example: if register has 600 and cash to office is 100,
// final cash should be 500.


// Net = Grand Total - Credit Card Sales
const netAmount = salesTotals.total - creditCardSales;

// Cash To Office = Net - Expenses - House Charges
const cashToOffice =
  netAmount -
  allExpenseTotal -
  totalHouseChargeBase;


  /* =========================
     UPDATE FUNCTIONS
  ========================= */

  function updateHeader(field: keyof HeaderData, value: string) {
    const cleanValue =
      field === "managerAm" || field === "managerPm"
        ? capitalizeName(value)
        : value;

    setHeader((prev) => ({ ...prev, [field]: cleanValue }));
  }

  function updateSales(index: number, field: keyof SalesRow, value: string) {
    setSalesRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );
  }

  function updateCloseOut(index: number, value: string) {
    setCloseOutRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, amount: value } : row
      )
    );
  }

  function updateTipRow(
    type: "AM_BUSBOY" | "PM_BUSBOY" | "AM_MANAGER" | "PM_MANAGER",
    index: number,
    field: keyof TipRow,
    value: string
  ) {
    const setterMap = {
      AM_BUSBOY: setAmBusboys,
      PM_BUSBOY: setPmBusboys,
      AM_MANAGER: setAmManagers,
      PM_MANAGER: setPmManagers,
    };

    setterMap[type]((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              [field]: field === "name" ? capitalizeName(value) : value,
            }
          : row
      )
    );
  }

 function addTipRow(
  type: "AM_BUSBOY" | "PM_BUSBOY" | "AM_MANAGER" | "PM_MANAGER"
) {
  const setterMap = {
    AM_BUSBOY: setAmBusboys,
    PM_BUSBOY: setPmBusboys,
    AM_MANAGER: setAmManagers,
    PM_MANAGER: setPmManagers,
  };

  const newRow =
    type === "AM_MANAGER" || type === "PM_MANAGER"
      ? emptyManagerTipRow
      : emptyTipRow;

  setterMap[type]((prev) => [...prev, { ...newRow }]);
}



  function removeTipRow(
    type: "AM_BUSBOY" | "PM_BUSBOY" | "AM_MANAGER" | "PM_MANAGER",
    index: number
  ) {
    const setterMap = {
      AM_BUSBOY: setAmBusboys,
      PM_BUSBOY: setPmBusboys,
      AM_MANAGER: setAmManagers,
      PM_MANAGER: setPmManagers,
    };

    setterMap[type]((prev) => prev.filter((_, i) => i !== index));
  }

  function updateExpense(
    shift: "AM" | "PM",
    index: number,
    field: keyof ExpenseRow,
    value: string
  ) {
    const setter = shift === "AM" ? setAmExpenses : setPmExpenses;

    setter((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );
  }

  function addExpense(shift: "AM" | "PM") {
    const setter = shift === "AM" ? setAmExpenses : setPmExpenses;
    setter((prev) => [...prev, { ...emptyExpense }]);
  }

  function removeExpense(shift: "AM" | "PM", index: number) {
    const setter = shift === "AM" ? setAmExpenses : setPmExpenses;
    setter((prev) => prev.filter((_, i) => i !== index));
  }

function updateHouseCharge(
  shift: "AM" | "PM",
  index: number,
  field: keyof HouseChargeRow,
  value: string
) {
  const setter = shift === "AM" ? setAmHouseCharges : setPmHouseCharges;

  setter((prev) =>
    prev.map((row, i) => {
      if (i !== index) return row;

      const updated: HouseChargeRow = {
        ...row,
        [field]: value,
      };

      if (field === "baseTotal" || field === "grandTotal") {
        updated.lastEditedAmount = field;
      }

      const base = Number(updated.baseTotal || 0);
      const tips = Number(updated.tips || 0);
      const grand = Number(updated.grandTotal || 0);

      if (updated.lastEditedAmount === "baseTotal") {
        updated.grandTotal = (base + tips).toFixed(2);
      }

      if (updated.lastEditedAmount === "grandTotal") {
        updated.baseTotal = Math.max(0, grand - tips).toFixed(2);
      }

      return updated;
    })
  );
}

  function addHouseCharge(shift: "AM" | "PM") {
    const setter = shift === "AM" ? setAmHouseCharges : setPmHouseCharges;
    setter((prev) => [...prev, { ...emptyHouseCharge }]);
  }

  function removeHouseCharge(shift: "AM" | "PM", index: number) {
    const setter = shift === "AM" ? setAmHouseCharges : setPmHouseCharges;
    setter((prev) => prev.filter((_, i) => i !== index));
  }

  function updateCheckLog(
    shift: "AM" | "PM",
    index: number,
    field: keyof CheckLogRow,
    value: string
  ) {
    const setter = shift === "AM" ? setAmCheckLogs : setPmCheckLogs;

    setter((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              [field]: field === "name" ? capitalizeName(value) : value,
            }
          : row
      )
    );
  }

  function addCheckLog(shift: "AM" | "PM") {
    const setter = shift === "AM" ? setAmCheckLogs : setPmCheckLogs;
    setter((prev) => [...prev, { ...emptyCheckLog }]);
  }

  function removeCheckLog(shift: "AM" | "PM", index: number) {
    const setter = shift === "AM" ? setAmCheckLogs : setPmCheckLogs;
    setter((prev) => prev.filter((_, i) => i !== index));
  }


  if (page === "timesheet") {
  return (
    <TimeSheet
      onBack={() => setPage("closeout")}
    />
  );
}


  /* =========================
     JSX
  ========================= */

  return (
    <div>
     <div className="no-print app-header">
  <h1>Restaurant Close-Out Sheet</h1>

  <div className="app-actions">
    <button
      type="button"
      className="no-print"
      onClick={() => setPage("timesheet")}
    >
      Open Time Sheet
    </button>
    <button type="button" onClick={() => window.print()}>
      Print Close-Out Sheet
    </button>
  </div>
</div>

      {/* PAGE 1 */}
      <main className="sheet">



<div className="top-title title-with-restaurant">
  <div className="restaurant-title-field no-print">
    <input
      list="restaurant-list"
      value={header.restaurantName}
      placeholder="Restaurant Name"
      onChange={(e) =>
        updateHeader("restaurantName", e.target.value)
      }
    />

    <datalist id="restaurant-list">
      <option value="DON GIOVANNI" />
    </datalist>
  </div>

  <div className="print-restaurant-name">
    {header.restaurantName}
  </div>

  <div>DAILY CLOSE OUT SHEET</div>
</div>

<div className="shift-toggle-row no-print">
  <label>
    <input
      type="checkbox"
      checked={amEnabled}
      onChange={(e) => setAmEnabled(e.target.checked)}
    />
    AM Shift
  </label>

  <label>
    <input
      type="checkbox"
      checked={pmEnabled}
      onChange={(e) => setPmEnabled(e.target.checked)}
    />
    PM Shift
  </label>
</div>


  
        

<HeaderSection
  header={header}
  onChange={updateHeader}
/>


        <section className="top-section-grid">
         <SalesSection
  salesRows={salesRows}
  onChange={updateSales}
  takeOutTotal={money(takeOutTotal)}
  amServerTotal={money(amServerTotal)}
  pmServerTotal={money(pmServerTotal)}
  serverTotal={money(serverTotal)}
  amHouseChargeBase={money(amHouseChargeBase)}
  pmHouseChargeBase={money(pmHouseChargeBase)}
  totalHouseChargeBase={money(houseChargeTotal)}
  amSalesTotal={money(salesTotals.am)}
  pmSalesTotal={money(salesTotals.pm)}
  grandSalesTotal={money(salesTotals.total)}
/>

          <div className="box">
  <h2>DAY CLOSE OUT</h2>

  <div className="closeout-grid">
    {closeOutRows.map((row, index) => (
      <label
  key={row.label}
  className={
    row.label === "Notes" && !row.amount?.trim()
      ? "print-hide-empty-notes"
      : ""
  }
>
        {row.label}

        {row.label === "Notes" ? (
          <textarea
            className="closeout-notes"
            value={row.amount}
            placeholder="Over/short, issue, or manager note..."
            onChange={(e) => updateCloseOut(index, e.target.value)}
          />
        ) : (
          <input
            value={
              row.label === "Grand Total"
                ? money(salesTotals.total)
                : row.label === "Total Expenses"
                ? money(allExpenseTotal)
                : row.label === "House Charges"
                ? money(totalHouseChargeBase)
                : row.label === "Net"
                ? money(netAmount)
                : row.label === "Cash To Office"
                ? money(cashToOffice)
                : row.amount
            }
            readOnly={
              row.label === "Grand Total" ||
              row.label === "Total Expenses" ||
              row.label === "House Charges" ||
              row.label === "Net" ||
              row.label === "Cash To Office"
            }
            onChange={(e) => updateCloseOut(index, e.target.value)}
          />
        )}
      </label>
    ))}
  </div>
</div>
        </section>
        {amEnabled && (
<ServerTable
  title="AM SERVER / WAITER CHECKOUT"
  rows={amServers}
  setRows={setAmServers}
  tipOutPercent={amServerTipOutPercent}
  onTipOutPercentChange={setAmServerTipOutPercent}
  bartenderEnabled={amBartenderEnabled}
  autoSplitTips={amAutoSplitServerTips}
onAutoSplitTipsChange={setAmAutoSplitServerTips}
  hasBusboy={amHasBusboy}
  onBartenderEnabledChange={setAmBartenderEnabled}
  busboyPercent={amBusboyPercent}
/>   )}
{pmEnabled && (

<ServerTable
  title="PM SERVER / WAITER CHECKOUT"
  rows={pmServers}
  setRows={setPmServers}
  tipOutPercent={pmServerTipOutPercent}
  onTipOutPercentChange={setPmServerTipOutPercent}
  autoSplitTips={pmAutoSplitServerTips}
onAutoSplitTipsChange={setPmAutoSplitServerTips}
  bartenderEnabled={pmBartenderEnabled}
  onBartenderEnabledChange={setPmBartenderEnabled}
  hasBusboy={pmHasBusboy}
  busboyPercent={pmBusboyPercent}
/>
)}

        <section className="two-column-grid">
            {amEnabled && (
          <TipTable
  title="AM BUSBOY"
  type="AM_BUSBOY"
  rows={amBusboys}
  percent={amBusboyPercent}
  floorTipPool={amBusboyPools.cc}
  cashTipPool={amBusboyPools.cash}
  autoSplit={amAutoSplitBusboy}
  onAutoSplitChange={setAmAutoSplitBusboy}
  onPercentChange={setAmBusboyPercent}
  onAdd={() => addTipRow("AM_BUSBOY")}
  onRemove={(index) => removeTipRow("AM_BUSBOY", index)}
  onChange={updateTipRow}
/>
            )}

            {pmEnabled && (

<TipTable
  title="PM BUSBOY"
  type="PM_BUSBOY"
  rows={pmBusboys}
  percent={pmBusboyPercent}
  floorTipPool={pmBusboyPools.cc}
  cashTipPool={pmBusboyPools.cash}
  autoSplit={pmAutoSplitBusboy}
  onAutoSplitChange={setPmAutoSplitBusboy}
  onPercentChange={setPmBusboyPercent}
  onAdd={() => addTipRow("PM_BUSBOY")}
  onRemove={(index) => removeTipRow("PM_BUSBOY", index)}
  onChange={updateTipRow}
/>

            )}
        </section>

        <section className="two-column-grid">
            {amEnabled && (
          <TipTable
            title="AM MANAGER"
            type="AM_MANAGER"
            rows={amManagers}
            onAdd={() => addTipRow("AM_MANAGER")}
            onRemove={(index) => removeTipRow("AM_MANAGER", index)}
            onChange={updateTipRow}
          />
            )}

            {pmEnabled && (

          <TipTable
            title="PM MANAGER"
            type="PM_MANAGER"
            rows={pmManagers}
            onAdd={() => addTipRow("PM_MANAGER")}
            onRemove={(index) => removeTipRow("PM_MANAGER", index)}
            onChange={updateTipRow}
          />

            )}
        </section>
      </main>

      <div className="page-break"></div>

      {/* PAGE 2 */}
      <main className="sheet">
        <div className="top-title">HOUSE CHARGE DETAILS / CHECK LOG</div>

        <section className="two-column-grid">
            {amEnabled && (
          <HouseChargeTable
            title="AM HOUSE CHARGE DETAILS"
            rows={amHouseCharges}
            totals={amHouseChargeTotals}
            shift="AM"
            onAdd={() => addHouseCharge("AM")}
            onRemove={(index) => removeHouseCharge("AM", index)}
            onChange={updateHouseCharge}
          />)}


{pmEnabled && (

          <HouseChargeTable
            title="PM HOUSE CHARGE DETAILS"
            rows={pmHouseCharges}
            totals={pmHouseChargeTotals}
            shift="PM"
            onAdd={() => addHouseCharge("PM")}
            onRemove={(index) => removeHouseCharge("PM", index)}
            onChange={updateHouseCharge}
          />
)}
        </section>

        <section className="two-column-grid">
            {amEnabled && (
          <CheckLogTable
            title="AM CHECK LOG"
            rows={amCheckLogs}
            shift="AM"
            onAdd={() => addCheckLog("AM")}
            onRemove={(index) => removeCheckLog("AM", index)}
            onChange={updateCheckLog}
          />)}
{pmEnabled && (

          <CheckLogTable
            title="PM CHECK LOG"
            rows={pmCheckLogs}
            shift="PM"
            onAdd={() => addCheckLog("PM")}
            onRemove={(index) => removeCheckLog("PM", index)}
            onChange={updateCheckLog}
          />)}
        </section>

        <section className="two-column-grid">
            {amEnabled && (
          <ExpenseTable
            title="AM EXPENSES"
            rows={amExpenses}
            totalAmount={amExpenseTotal}
            shift="AM"
            onAdd={() => addExpense("AM")}
            onRemove={(index) => removeExpense("AM", index)}
            onChange={updateExpense}
          />
            )}

            {pmEnabled && (

          <ExpenseTable
            title="PM EXPENSES"
            rows={pmExpenses}
            totalAmount={pmExpenseTotal}
            shift="PM"
            onAdd={() => addExpense("PM")}
            onRemove={(index) => removeExpense("PM", index)}
            onChange={updateExpense}
          />)}
        </section>

        <div className="no-print reset-section">
  <button
    className="danger-btn"
    onClick={() => {
      const confirmed = window.confirm(
        "Are you sure you want to reset the entire close-out sheet? This cannot be undone."
      );

      if (confirmed) {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
      }
    }}
  >
    Reset Close-Out Sheet
  </button>
</div>
      </main>
    </div>
  );
}
