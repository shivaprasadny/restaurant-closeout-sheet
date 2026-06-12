import { useState } from "react";
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
  getBusboyFloorTipTotal,
} from "../utils/closeoutCalculations";


import ServerTable from "../components/ServerTable";
import TipTable from "../components/TipTable";
import ExpenseTable from "../components/ExpenseTable";
import HouseChargeTable from "../components/HouseChargeTable";
import CheckLogTable from "../components/CheckLogTable";

export default function CloseoutPage() {
  /* =========================
     HEADER STATE
  ========================= */

  const [header, setHeader] = useState<HeaderData>({
    locationName: "",
    date: "",
    day: "",
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

// Server tip out percent for bar/bartender.
// Default is 8%, user can change it.
const [amServerTipOutPercent, setAmServerTipOutPercent] = useState("8");
const [pmServerTipOutPercent, setPmServerTipOutPercent] = useState("8");

// Bartender is optional.
// If checked, manager knows bartender/bar tip-out applies.
const [amBartenderEnabled, setAmBartenderEnabled] = useState(false);
const [pmBartenderEnabled, setPmBartenderEnabled] = useState(false);

  
  const [amBusboyPercent, setAmBusboyPercent] = useState("");
  const [pmBusboyPercent, setPmBusboyPercent] = useState("");

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


const amBusboyFloorTotal =
  getBusboyFloorTipTotal(amServers);

const pmBusboyFloorTotal =
  getBusboyFloorTipTotal(pmServers);

// Final AM / PM Sales totals.
const salesTotals = {
  am: takeOutAM + amServerTotal + amHouseChargeBase,
  pm: takeOutPM + pmServerTotal + pmHouseChargeBase,
  total: takeOutTotal + serverTotal + houseChargeTotal,
};

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
    setHeader((prev) => ({ ...prev, [field]: value }));
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
        i === index ? { ...row, [field]: value } : row
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
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
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
        i === index ? { ...row, [field]: value } : row
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

  /* =========================
     JSX
  ========================= */

  return (
    <div>
      <div className="no-print app-header">
        <h1>Restaurant Close-Out Sheet</h1>
        <button onClick={() => window.print()}>Print Close-Out Sheet</button>
      </div>

      {/* PAGE 1 */}
      <main className="sheet">
        <div className="top-title">DAILY CLOSE OUT SHEET</div>

        <section className="info-grid">
          <label>
            Location
            <input
              value={header.locationName}
              onChange={(e) => updateHeader("locationName", e.target.value)}
            />
          </label>

          <label>
            Date
            <input
              value={header.date}
              onChange={(e) => updateHeader("date", e.target.value)}
            />
          </label>

          <label>
            Day
            <input
              value={header.day}
              onChange={(e) => updateHeader("day", e.target.value)}
            />
          </label>

          <label>
            Weather
            <input
              value={header.weather}
              onChange={(e) => updateHeader("weather", e.target.value)}
            />
          </label>

          <label>
            Manager AM
            <input
              value={header.managerAm}
              onChange={(e) => updateHeader("managerAm", e.target.value)}
            />
          </label>

          <label>
            Manager PM
            <input
              value={header.managerPm}
              onChange={(e) => updateHeader("managerPm", e.target.value)}
            />
          </label>
        </section>

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
      <label key={row.label}>
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
<ServerTable
  title="AM SERVER / WAITER CHECKOUT"
  rows={amServers}
  setRows={setAmServers}
  tipOutPercent={amServerTipOutPercent}
  onTipOutPercentChange={setAmServerTipOutPercent}
  bartenderEnabled={amBartenderEnabled}
  onBartenderEnabledChange={setAmBartenderEnabled}
/>

<ServerTable
  title="PM SERVER / WAITER CHECKOUT"
  rows={pmServers}
  setRows={setPmServers}
  tipOutPercent={pmServerTipOutPercent}
  onTipOutPercentChange={setPmServerTipOutPercent}
  bartenderEnabled={pmBartenderEnabled}
  onBartenderEnabledChange={setPmBartenderEnabled}
/>

        <section className="two-column-grid">
          <TipTable
            title="AM BUSBOY"
            type="AM_BUSBOY"
            rows={amBusboys}
            percent={amBusboyPercent}
            onPercentChange={setAmBusboyPercent}
            onAdd={() => addTipRow("AM_BUSBOY")}
            onRemove={(index) => removeTipRow("AM_BUSBOY", index)}
            onChange={updateTipRow}
          />

          <TipTable
            title="PM BUSBOY"
            type="PM_BUSBOY"
            rows={pmBusboys}
            percent={pmBusboyPercent}
            onPercentChange={setPmBusboyPercent}
            onAdd={() => addTipRow("PM_BUSBOY")}
            onRemove={(index) => removeTipRow("PM_BUSBOY", index)}
            onChange={updateTipRow}
          />
        </section>

        <section className="two-column-grid">
          <TipTable
            title="AM MANAGER"
            type="AM_MANAGER"
            rows={amManagers}
            onAdd={() => addTipRow("AM_MANAGER")}
            onRemove={(index) => removeTipRow("AM_MANAGER", index)}
            onChange={updateTipRow}
          />

          <TipTable
            title="PM MANAGER"
            type="PM_MANAGER"
            rows={pmManagers}
            onAdd={() => addTipRow("PM_MANAGER")}
            onRemove={(index) => removeTipRow("PM_MANAGER", index)}
            onChange={updateTipRow}
          />
        </section>
      </main>

      <div className="page-break"></div>

      {/* PAGE 2 */}
      <main className="sheet">
        <div className="top-title">HOUSE CHARGE DETAILS / CHECK LOG</div>

        <section className="two-column-grid">
          <HouseChargeTable
            title="AM HOUSE CHARGE DETAILS"
            rows={amHouseCharges}
            totals={amHouseChargeTotals}
            shift="AM"
            onAdd={() => addHouseCharge("AM")}
            onRemove={(index) => removeHouseCharge("AM", index)}
            onChange={updateHouseCharge}
          />

          <HouseChargeTable
            title="PM HOUSE CHARGE DETAILS"
            rows={pmHouseCharges}
            totals={pmHouseChargeTotals}
            shift="PM"
            onAdd={() => addHouseCharge("PM")}
            onRemove={(index) => removeHouseCharge("PM", index)}
            onChange={updateHouseCharge}
          />
        </section>

        <section className="two-column-grid">
          <CheckLogTable
            title="AM CHECK LOG"
            rows={amCheckLogs}
            shift="AM"
            onAdd={() => addCheckLog("AM")}
            onRemove={(index) => removeCheckLog("AM", index)}
            onChange={updateCheckLog}
          />

          <CheckLogTable
            title="PM CHECK LOG"
            rows={pmCheckLogs}
            shift="PM"
            onAdd={() => addCheckLog("PM")}
            onRemove={(index) => removeCheckLog("PM", index)}
            onChange={updateCheckLog}
          />
        </section>

        <section className="two-column-grid">
          <ExpenseTable
            title="AM EXPENSES"
            rows={amExpenses}
            totalAmount={amExpenseTotal}
            shift="AM"
            onAdd={() => addExpense("AM")}
            onRemove={(index) => removeExpense("AM", index)}
            onChange={updateExpense}
          />

          <ExpenseTable
            title="PM EXPENSES"
            rows={pmExpenses}
            totalAmount={pmExpenseTotal}
            shift="PM"
            onAdd={() => addExpense("PM")}
            onRemove={(index) => removeExpense("PM", index)}
            onChange={updateExpense}
          />
        </section>
      </main>
    </div>
  );
}