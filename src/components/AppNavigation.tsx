export type NavigationPage = "closeout" | "timesheet" | "food-order";

type Props = {
  activePage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  onPrint: () => void;
  printLabel: string;
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
  saveNotice,
}: Props) {
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

      <button
        type="button"
        className="app-navigation-print"
        onClick={onPrint}
      >
        {printLabel}
      </button>
    </header>
  );
}
