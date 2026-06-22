import { useEffect, useState } from "react";
import HeaderSection from "../components/HeaderSection";
import type { HeaderData } from "../types/closeout.types";
import { capitalizeName } from "../utils/textFormatting";
import { getEmployeesForPosition } from "../data/employees";
import "../styles/timesheet.css";
import AppNavigation, {
  type NavigationPage,
} from "../components/AppNavigation";

/* One row in the time sheet table */
type TimeSheetRow = {
  name: string;
  position: string;
  start: string;
  breakTime: string;
  end: string;
  note: string;
};

type LegacyTimeSheetRow = Partial<TimeSheetRow> & {
  timeOut?: string;
  signOut?: string;
};

/* Default AM positions */
const amDefaultPositions = [
  "Manager",
  "Salad",
  "Porter",
  "Dish",
  "Cook",
  "Pizza",
  "BB",
  "BB",
  "Waiter",
  "Waiter",
];

/* Default PM positions */
const pmDefaultPositions = [
  "Manager",
  "Salad",
  "Helper",
  "Dish",
  "Cook",
  "Pizza",
  "BB",
  "BB",
  "Waiter",
  "Waiter",
  "Waiter",
];

/* Converts position names into blank rows */
const makeRows = (positions: string[]): TimeSheetRow[] =>
  positions.map((position) => ({
    name: "",
    position,
    start: "",
    breakTime: "",
    end: "",
    note: "",
  }));

type TimeSheetDraft = {
  header: HeaderData;
  amEnabled: boolean;
  pmEnabled: boolean;
  amRows: TimeSheetRow[];
  pmRows: TimeSheetRow[];
};

const STORAGE_KEY = "restaurant-timesheet-draft-v1";

function formatTime(value: string): string {
  const cleaned = value.trim().toLowerCase().replace(/\s+/g, "");
  const match = cleaned.match(/^(\d{1,2}):?(\d{2})?(am|pm)$/);

  if (!match) return value.trim();

  const hour = Number(match[1]);
  const minutes = Number(match[2] ?? "00");

  if (hour < 1 || hour > 12 || minutes > 59) {
    return value.trim();
  }

  return `${hour}:${String(minutes).padStart(2, "0")}${match[3].toUpperCase()}`;
}

function formatBreak(value: string): string {
  const cleaned = value.trim().toLowerCase();
  const match = cleaned.match(/^(\d+)\s*(?:m|min|mins|minute|minutes)?$/);

  return match ? `${Number(match[1])} min` : value.trim();
}

function migrateRow(row: LegacyTimeSheetRow): TimeSheetRow {
  return {
    name: capitalizeName(row.name ?? ""),
    position:
      row.position === "Dish AM"
        ? "Dish"
        : row.position === "Waiter AM"
          ? "Waiter"
          : row.position ?? "",
    start: row.start ?? "",
    breakTime: row.breakTime ?? "",
    end: row.end ?? row.signOut ?? row.timeOut ?? "",
    note: row.note ?? "",
  };
}

function createDefaultDraft(): TimeSheetDraft {
  const today = new Date().toISOString().split("T")[0];

  return {
    header: {
      restaurantName: "",
      locationName: "",
      date: today,
      day: new Date()
        .toLocaleDateString("en-US", { weekday: "long" })
        .toUpperCase(),
      weather: "",
      managerAm: "",
      managerPm: "",
    },
    amEnabled: true,
    pmEnabled: true,
    amRows: makeRows(amDefaultPositions),
    pmRows: makeRows(pmDefaultPositions),
  };
}

function loadDraft(): TimeSheetDraft {
  const defaultDraft = createDefaultDraft();

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultDraft;

    const parsed = JSON.parse(saved) as Partial<TimeSheetDraft> & {
      amRows?: LegacyTimeSheetRow[];
      pmRows?: LegacyTimeSheetRow[];
    };

    const savedHeader = { ...defaultDraft.header, ...parsed.header };

    return {
      header: {
        ...savedHeader,
        managerAm: capitalizeName(savedHeader.managerAm),
        managerPm: capitalizeName(savedHeader.managerPm),
      },
      amEnabled: parsed.amEnabled ?? defaultDraft.amEnabled,
      pmEnabled: parsed.pmEnabled ?? defaultDraft.pmEnabled,
      amRows: Array.isArray(parsed.amRows)
        ? parsed.amRows.map(migrateRow)
        : defaultDraft.amRows,
      pmRows: Array.isArray(parsed.pmRows)
        ? parsed.pmRows.map(migrateRow)
        : defaultDraft.pmRows,
    };
  } catch {
    return defaultDraft;
  }
}

type Props = {
  onNavigate: (page: NavigationPage) => void;
};

export default function TimeSheet({
  onNavigate,
}: Props) {
  const [initialDraft] = useState(loadDraft);
  const [saveNotice, setSaveNotice] = useState("");

  /* Header uses the same HeaderSection as Closeout page */
  const [header, setHeader] = useState<HeaderData>(initialDraft.header);

  /* Show/hide AM and PM sections */
  const [amEnabled, setAmEnabled] = useState(initialDraft.amEnabled);
  const [pmEnabled, setPmEnabled] = useState(initialDraft.pmEnabled);

  /* AM and PM row data */
  const [amRows, setAmRows] =
    useState<TimeSheetRow[]>(initialDraft.amRows);

  const [pmRows, setPmRows] =
    useState<TimeSheetRow[]>(initialDraft.pmRows);

  useEffect(() => {
    const draft: TimeSheetDraft = {
      header,
      amEnabled,
      pmEnabled,
      amRows,
      pmRows,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setSaveNotice("Draft saved");

    const noticeTimer = window.setTimeout(
      () => setSaveNotice("Saved automatically"),
      1500
    );

    return () => window.clearTimeout(noticeTimer);
  }, [header, amEnabled, pmEnabled, amRows, pmRows]);

  /* Update header fields */
  function updateHeader(field: keyof HeaderData, value: string) {
    const cleanValue =
      field === "managerAm" || field === "managerPm"
        ? capitalizeName(value)
        : value;

    setHeader((prev) => ({
      ...prev,
      [field]: cleanValue,
    }));
  }

  /* Update a row field */
  function updateRow(
    shift: "AM" | "PM",
    index: number,
    field: keyof TimeSheetRow,
    value: string
  ) {
    const setter = shift === "AM" ? setAmRows : setPmRows;

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

  /* Plus button: duplicate same position at bottom */
  function duplicateRow(shift: "AM" | "PM", index: number) {
  const setter = shift === "AM" ? setAmRows : setPmRows;

  setter((prev) => {
    const rowToCopy = prev[index];

    const newRow = {
      ...rowToCopy,
      name: "",
      start: "",
      breakTime: "",
      end: "",
      note: "",
    };

    return [
      ...prev.slice(0, index + 1),
      newRow,
      ...prev.slice(index + 1),
    ];
  });
}

  /* Remove one row */
  function removeRow(shift: "AM" | "PM", index: number) {
    const setter = shift === "AM" ? setAmRows : setPmRows;

    setter((prev) => prev.filter((_, i) => i !== index));
  }

  function resetTimeSheet() {
    const confirmed = window.confirm(
      "Are you sure you want to reset the entire time sheet? This cannot be undone."
    );

    if (!confirmed) return;

    const defaultDraft = createDefaultDraft();

    localStorage.removeItem(STORAGE_KEY);
    setHeader(defaultDraft.header);
    setAmEnabled(defaultDraft.amEnabled);
    setPmEnabled(defaultDraft.pmEnabled);
    setAmRows(defaultDraft.amRows);
    setPmRows(defaultDraft.pmRows);
  }

  return (
    <div className="timesheet-page">
      <AppNavigation
        activePage="timesheet"
        onNavigate={onNavigate}
        onPrint={() => window.print()}
        printLabel="Print Time Sheet"
        saveNotice={saveNotice}
      />

      <div className="no-print timesheet-toolbar">
        <div className="shift-inline-toggle">
          <label>
            <input
              type="checkbox"
              checked={amEnabled}
              onChange={(e) => setAmEnabled(e.target.checked)}
            />
            AM
          </label>

          <label>
            <input
              type="checkbox"
              checked={pmEnabled}
              onChange={(e) => setPmEnabled(e.target.checked)}
            />
            PM
          </label>
        </div>
      </div>


      <div className="timesheet-title-row">
        <h1 className="sheet-title">
          DON GIOVANNI RESTAURANT — EMPLOYEE TIME SHEET
        </h1>
      </div>

      <HeaderSection
        header={header}
        onChange={updateHeader}
        amEnabled={amEnabled}
        pmEnabled={pmEnabled}
      />

      {amEnabled && (
        <TimeSheetTable
          title="AM TIME SHEET"
          shift="AM"
          rows={amRows}
          onChange={updateRow}
          onDuplicate={duplicateRow}
          onRemove={removeRow}
        />
      )}

      {pmEnabled && (
        <TimeSheetTable
          title="PM TIME SHEET"
          shift="PM"
          rows={pmRows}
          onChange={updateRow}
          onDuplicate={duplicateRow}
          onRemove={removeRow}
        />
      )}

      <div className="no-print reset-section">
        <button
          type="button"
          className="danger-btn"
          onClick={resetTimeSheet}
        >
          Reset Time Sheet
        </button>
      </div>
    </div>
  );
}

/* Props for table component */
type TimeSheetTableProps = {
  title: string;
  shift: "AM" | "PM";
  rows: TimeSheetRow[];
  onChange: (
    shift: "AM" | "PM",
    index: number,
    field: keyof TimeSheetRow,
    value: string
  ) => void;
  onDuplicate: (shift: "AM" | "PM", index: number) => void;
  onRemove: (shift: "AM" | "PM", index: number) => void;
};

/* Table for AM or PM section */
function TimeSheetTable({
  title,
  shift,
  rows,
  onChange,
  onDuplicate,
  onRemove,
}: TimeSheetTableProps) {
  function focusNextInput(event: React.KeyboardEvent<HTMLTableElement>) {
    if (event.key !== "Enter") return;

    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    const currentCell = target.closest("td");
    const currentRow = target.closest("tr");
    const nextRow = currentRow?.nextElementSibling;

    if (
      !currentCell ||
      !(nextRow instanceof HTMLTableRowElement)
    ) {
      return;
    }

    const columnIndex = currentCell.cellIndex;
    const nextInput =
      nextRow.cells[columnIndex]?.querySelector<HTMLInputElement>(
        "input:not([readonly])"
      );

    if (nextInput) {
      event.preventDefault();
      nextInput.focus();
      nextInput.select();
    }
  }

  return (
    <section
      className={`timesheet-section timesheet-section-${shift.toLowerCase()}`}
    >
      <h2>{title}</h2>

      <table className="timesheet-table" onKeyDown={focusNextInput}>
        <thead>
          <tr>
            <th className="no-print">+</th>
            <th>Name</th>
            <th>Position</th>
            <th>Start</th>
            <th>Break</th>
            <th>End</th>
            <th>Note</th>
            <th className="no-print">X</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${shift}-${index}`}
              className={row.name.trim() ? "timesheet-row-entered" : ""}
            >
              <td className="no-print">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => onDuplicate(shift, index)}
                >
                  +
                </button>
              </td>

              <td>
                <datalist id={`employee-${shift}-${index}`}>
                  {getEmployeesForPosition(row.position).map((employee) => (
                    <option key={employee.name} value={employee.name} />
                  ))}
                </datalist>
                <input
                  list={`employee-${shift}-${index}`}
                  value={row.name}
                  onChange={(e) =>
                    onChange(shift, index, "name", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  value={row.position}
                  onChange={(e) =>
                    onChange(shift, index, "position", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  value={row.start}
                  onChange={(e) =>
                    onChange(shift, index, "start", e.target.value)
                  }
                  onBlur={(e) =>
                    onChange(shift, index, "start", formatTime(e.target.value))
                  }
                />
              </td>

              <td>
                <input
                  inputMode="numeric"
                  value={row.breakTime}
                  onChange={(e) =>
                    onChange(shift, index, "breakTime", e.target.value)
                  }
                  onBlur={(e) =>
                    onChange(
                      shift,
                      index,
                      "breakTime",
                      formatBreak(e.target.value)
                    )
                  }
                />
              </td>

              <td>
                <input
                  value={row.end}
                  onChange={(e) =>
                    onChange(shift, index, "end", e.target.value)
                  }
                  onBlur={(e) =>
                    onChange(shift, index, "end", formatTime(e.target.value))
                  }
                />
              </td>

              <td>
                <input
                  value={row.note}
                  onChange={(e) =>
                    onChange(shift, index, "note", e.target.value)
                  }
                />
              </td>

              <td className="no-print">
                <button
                  type="button"
                  className="icon-btn danger"
                  onClick={() => onRemove(shift, index)}
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
