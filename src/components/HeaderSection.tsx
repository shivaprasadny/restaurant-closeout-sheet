import type { HeaderData } from "../types/closeout.types";

/**
 * Top header section:
 * Location, Date, Day, Weather, Manager AM, Manager PM
 */

type Props = {
  header: HeaderData;
  onChange: (field: keyof HeaderData, value: string) => void;
};

export default function HeaderSection({ header, onChange }: Props) {
  return (
    <section className="info-grid">
      <label>
        Location
        <input
          value={header.locationName}
          onChange={(e) => onChange("locationName", e.target.value)}
        />
      </label>

      <label>
        Date
        <input value={header.date} onChange={(e) => onChange("date", e.target.value)} />
      </label>

      <label>
        Day
        <input value={header.day} onChange={(e) => onChange("day", e.target.value)} />
      </label>

      <label>
        Weather
        <input value={header.weather} onChange={(e) => onChange("weather", e.target.value)} />
      </label>

      <label>
        Manager AM
        <input value={header.managerAm} onChange={(e) => onChange("managerAm", e.target.value)} />
      </label>

      <label>
        Manager PM
        <input value={header.managerPm} onChange={(e) => onChange("managerPm", e.target.value)} />
      </label>
    </section>
  );
}