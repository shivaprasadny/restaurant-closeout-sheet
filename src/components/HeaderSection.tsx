import type { HeaderData } from "../types/closeout.types";

/**
 * Top header section:
 * Location, Date, Day, Weather, Manager AM, Manager PM
 *
 * Location and Weather use datalist:
 * - User can type anything
 * - User also gets suggested options
 *
 * Date uses date picker.
 * Day auto-updates when date changes.
 */

type Props = {
  header: HeaderData;
  onChange: (field: keyof HeaderData, value: string) => void;
};

export default function HeaderSection({ header, onChange }: Props) {
  function updateDate(value: string) {
    const selectedDate = new Date(value + "T00:00:00");

    const day = selectedDate
      .toLocaleDateString("en-US", {
        weekday: "long",
      })
      .toUpperCase();

    onChange("date", value);
    onChange("day", day);
  }

  return (
    <section className="info-grid">
      <label>
        Location
        <input
          list="location-list"
          value={header.locationName}
          onChange={(e) => onChange("locationName", e.target.value)}
        />

        <datalist id="location-list">
          <option value="UPTOWN" />
          <option value="DOWNTOWN" />
        </datalist>
      </label>

      <label>
        Date
        <input
          type="date"
          value={header.date}
          onChange={(e) => updateDate(e.target.value)}
        />
      </label>

      <label>
        Day
        <select
          value={header.day}
          onChange={(e) => onChange("day", e.target.value)}
        >
          <option value="">SELECT</option>
          <option value="MONDAY">MONDAY</option>
          <option value="TUESDAY">TUESDAY</option>
          <option value="WEDNESDAY">WEDNESDAY</option>
          <option value="THURSDAY">THURSDAY</option>
          <option value="FRIDAY">FRIDAY</option>
          <option value="SATURDAY">SATURDAY</option>
          <option value="SUNDAY">SUNDAY</option>
        </select>
      </label>

      <label>
        Weather
        <input
          list="weather-list"
          value={header.weather}
          onChange={(e) => onChange("weather", e.target.value)}
        />

        <datalist id="weather-list">
          <option value="SUNNY" />
          <option value="PARTLY CLOUDY" />
          <option value="CLOUDY" />
          <option value="RAINY" />
          <option value="THUNDERSTORM" />
          <option value="SNOW" />
          <option value="WINDY" />
          <option value="FOGGY" />
          <option value="HOT" />
          <option value="COLD" />
        </datalist>
      </label>

      <label>
        Manager AM
        <input
          value={header.managerAm}
          onChange={(e) => onChange("managerAm", e.target.value)}
        />
      </label>

      <label>
        Manager PM
        <input
          value={header.managerPm}
          onChange={(e) => onChange("managerPm", e.target.value)}
        />
      </label>
    </section>
  );
}