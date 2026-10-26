import { useState } from "react";
import { REPORT_EMAIL_RECIPIENTS } from "../data/emailSettings";
import { downloadPagePdf, emailPagePdf } from "../utils/pdfExport";

export type NavigationPage = "closeout" | "timesheet" | "food-order";

type Props = {
  activePage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  onPrint: () => void;
  printLabel: string;
  pdfTitle: string;
  saveNotice?: string;
};

const pages: Array<{ page: NavigationPage; label: string }> = [
  { page: "closeout", label: "Close-Out" },
  { page: "timesheet", label: "Time Sheet" },
  { page: "food-order", label: "Food Order" },
];

export default function AppNavigation({
  activePage,
  onNavigate,
  onPrint,
  printLabel,
  pdfTitle,
  saveNotice,
}: Props) {
  const [pdfBusy, setPdfBusy] = useState(false);

  async function runPdfAction(action: (title: string) => Promise<void>) {
    setPdfBusy(true);
    try {
      await action(pdfTitle);
    } catch {
      window.alert("Could not create the PDF. Please try again.");
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <header className="app-navigation no-print">
      <div className="app-navigation-brand">
        <strong>Don Giovanni</strong>
        {saveNotice && <span>{saveNotice}</span>}
      </div>

      <nav aria-label="Application pages">
        {pages.map(({ page, label }) => (
          <button
            key={page}
            type="button"
            className={activePage === page ? "active" : ""}
            aria-current={activePage === page ? "page" : undefined}
            onClick={() => onNavigate(page)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="app-navigation-actions">
        <button
          type="button"
          className="app-navigation-email"
          disabled={pdfBusy}
          onClick={() =>
            runPdfAction((title) =>
              emailPagePdf(activePage, title, REPORT_EMAIL_RECIPIENTS[activePage])
            )
          }
        >
          Email PDF
        </button>

        <button
          type="button"
          className="app-navigation-pdf"
          disabled={pdfBusy}
          onClick={() => {
            const confirmed = window.confirm(
              `Download the ${pdfTitle} as a PDF?`
            );
            if (!confirmed) return;

            runPdfAction((title) => downloadPagePdf(activePage, title));
          }}
        >
          {pdfBusy ? "Creating..." : "Download PDF"}
        </button>

        <button
          type="button"
          className="app-navigation-print"
          onClick={onPrint}
        >
          {printLabel}
        </button>
      </div>
    </header>
  );
}
