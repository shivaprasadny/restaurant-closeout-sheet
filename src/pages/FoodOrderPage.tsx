import { useEffect, useState } from "react";
import { managerNames } from "../data/employees";
import {
  defaultOrderItems,
  type OrderCategory,
} from "../data/orderItems";
import { capitalizeName } from "../utils/textFormatting";
import "../styles/food-order.css";

type OrderUnit = "count" | "case" | "kg" | "lb";

type OrderItem = {
  id: string;
  name: string;
  quantity: string;
  unit: OrderUnit;
  custom: boolean;
};

type OrderLocation = "" | "uptown" | "downtown";

type FoodOrderDraft = {
  location: OrderLocation;
  date: string;
  day: string;
  orderedBy: string;
  sections: Record<OrderCategory, OrderItem[]>;
};

type Props = {
  onBack: () => void;
};

const STORAGE_KEY = "restaurant-food-order-draft-v1";

const locations: Record<
  Exclude<OrderLocation, "">,
  { label: string; address: string }
> = {
  uptown: {
    label: "Don Giovanni Restaurant - Uptown",
    address: "358 W 44th St, New York, NY 10036",
  },
  downtown: {
    label: "Don Giovanni Restaurant - Downtown",
    address: "214 10th Ave, New York, NY 10011",
  },
};

const sectionDetails: Record<
  OrderCategory,
  { title: string; messageTitle: string; emoji: string }
> = {
  vegetables: {
    title: "Vegetable Order",
    messageTitle: "VEGETABLE ORDER",
    emoji: "🥬",
  },
  meat: {
    title: "Meat Order",
    messageTitle: "MEAT ORDER",
    emoji: "🥩",
  },
  seafood: {
    title: "Seafood Order",
    messageTitle: "SEAFOOD ORDER",
    emoji: "🐟",
  },
};

function makeId(category: OrderCategory, index: number): string {
  return `${category}-${index}`;
}

function makeDefaultItems(
  category: OrderCategory,
  names: string[]
): OrderItem[] {
  const countVegetables = new Set([
    "Apple",
    "Avocado",
    "Celery",
    "Cherry Tomatoes",
    "Garlic",
    "Mint",
    "Orange",
    "Parsley",
    "Pear",
  ]);

  return names.map((name, index) => ({
    id: makeId(category, index),
    name,
    quantity: "",
    unit:
      category === "meat" || category === "seafood"
        ? "lb"
        : name === "Basil"
          ? "kg"
          : countVegetables.has(name)
            ? "count"
            : "case",
    custom: false,
  }));
}

function getDay(date: string): string {
  if (!date) return "";

  return new Date(`${date}T00:00:00`)
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();
}

function createDefaultDraft(): FoodOrderDraft {
  const date = new Date().toISOString().split("T")[0];

  return {
    location: "",
    date,
    day: getDay(date),
    orderedBy: "",
    sections: {
      vegetables: makeDefaultItems(
        "vegetables",
        defaultOrderItems.vegetables
      ),
      meat: makeDefaultItems("meat", defaultOrderItems.meat),
      seafood: makeDefaultItems("seafood", defaultOrderItems.seafood),
    },
  };
}

function mergeSavedItems(
  category: OrderCategory,
  savedItems: OrderItem[] | undefined
): OrderItem[] {
  const defaultItems = makeDefaultItems(
    category,
    defaultOrderItems[category]
  );

  if (!Array.isArray(savedItems)) return defaultItems;

  const savedByName = new Map(
    savedItems.map((item) => [item.name.toLowerCase(), item])
  );
  const mergedDefaults = defaultItems.map((item) => ({
    ...item,
    ...savedByName.get(item.name.toLowerCase()),
    unit:
      savedByName.get(item.name.toLowerCase())?.quantity
        ? savedByName.get(item.name.toLowerCase())?.unit ?? item.unit
        : item.unit,
  }));
  const customItems = savedItems.filter(
    (item) =>
      item.custom &&
      !defaultItems.some(
        (defaultItem) =>
          defaultItem.name.toLowerCase() === item.name.toLowerCase()
      )
  );

  return [...mergedDefaults, ...customItems];
}

function loadDraft(): FoodOrderDraft {
  const defaultDraft = createDefaultDraft();

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultDraft;

    const parsed = JSON.parse(saved) as Partial<FoodOrderDraft>;

    return {
      location:
        parsed.location === "uptown" || parsed.location === "downtown"
          ? parsed.location
          : "",
      date: parsed.date ?? defaultDraft.date,
      day: parsed.day ?? getDay(parsed.date ?? defaultDraft.date),
      orderedBy: capitalizeName(parsed.orderedBy ?? ""),
      sections: {
        vegetables: mergeSavedItems(
          "vegetables",
          parsed.sections?.vegetables
        ),
        meat: mergeSavedItems("meat", parsed.sections?.meat),
        seafood: mergeSavedItems("seafood", parsed.sections?.seafood),
      },
    };
  } catch {
    return defaultDraft;
  }
}

function unitLabel(unit: OrderUnit, quantity: string): string {
  const plural = Number(quantity) !== 1;

  if (unit === "count") return plural ? "count" : "count";
  if (unit === "case") return plural ? "cases" : "case";
  return unit;
}

export default function FoodOrderPage({ onBack }: Props) {
  const [draft, setDraft] = useState<FoodOrderDraft>(loadDraft);
  const [copiedSection, setCopiedSection] =
    useState<OrderCategory | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  function updateHeader(
    field: "location" | "date" | "orderedBy",
    value: string
  ) {
    setDraft((current) => {
      if (field === "date") {
        return { ...current, date: value, day: getDay(value) };
      }

      if (field === "orderedBy") {
        return { ...current, [field]: capitalizeName(value) };
      }

      return { ...current, [field]: value as OrderLocation };
    });
  }

  function updateItem(
    category: OrderCategory,
    id: string,
    field: "name" | "quantity" | "unit",
    value: string
  ) {
    setDraft((current) => ({
      ...current,
      sections: {
        ...current.sections,
        [category]: current.sections[category].map((item) =>
          item.id === id
            ? {
                ...item,
                [field]:
                  field === "name"
                    ? value.replace(/\b\w/g, (letter) =>
                        letter.toUpperCase()
                      )
                    : value,
              }
            : item
        ),
      },
    }));
  }

  function addCustomItem(category: OrderCategory) {
    setDraft((current) => ({
      ...current,
      sections: {
        ...current.sections,
        [category]: [
          ...current.sections[category],
          {
            id: `${category}-custom-${Date.now()}`,
            name: "",
            quantity: "",
            unit: "count",
            custom: true,
          },
        ],
      },
    }));
  }

  function removeCustomItem(category: OrderCategory, id: string) {
    setDraft((current) => ({
      ...current,
      sections: {
        ...current.sections,
        [category]: current.sections[category].filter(
          (item) => item.id !== id
        ),
      },
    }));
  }

  function createMessage(category: OrderCategory): string {
    if (!draft.location) return "";

    const location = locations[draft.location];
    const items = draft.sections[category].filter(
      (item) => item.name.trim() && item.quantity.trim()
    );
    const orderLines =
      items.length > 0
        ? items.map(
            (item) =>
              `• ${item.name}: ${item.quantity} ${unitLabel(
                item.unit,
                item.quantity
              )}`
          )
        : ["• No items entered"];

    return [
      "🍽️ Don Giovanni Restaurant",
      `📍 ${location.label.replace("Don Giovanni Restaurant - ", "")}`,
      `🏠 ${location.address}`,
      "",
      `${sectionDetails[category].emoji} ${sectionDetails[category].messageTitle}`,
      `📅 ${draft.date} • ${draft.day}`,
      `👤 Ordered by: ${draft.orderedBy || "-"}`,
      "",
      ...orderLines,
      "",
      "Thank you! 🙏",
    ].join("\n");
  }

  async function copySection(category: OrderCategory) {
    const missingFields: string[] = [];

    if (!draft.location) missingFields.push("Location");
    if (!draft.orderedBy.trim()) missingFields.push("Ordered By");

    if (missingFields.length > 0) {
      window.alert(
        `Please complete ${missingFields.join(" and ")} before copying.`
      );

      const fieldId = !draft.location
        ? "food-order-location"
        : "food-order-ordered-by";
      document.getElementById(fieldId)?.focus();
      return;
    }

    const message = createMessage(category);

    try {
      await navigator.clipboard.writeText(message);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = message;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
    }

    setCopiedSection(category);
    window.setTimeout(() => setCopiedSection(null), 1800);
  }

  function resetOrder() {
    const confirmed = window.confirm(
      "Reset all food order quantities and custom items?"
    );
    if (!confirmed) return;

    const defaultDraft = createDefaultDraft();
    defaultDraft.orderedBy = draft.orderedBy;
    setDraft(defaultDraft);
  }

  return (
    <main className="food-order-page">
      <header className="food-order-toolbar no-print">
        <button type="button" onClick={onBack}>
          ← Back to Close-Out
        </button>
        <button type="button" onClick={() => window.print()}>
          Print Order
        </button>
      </header>

      <section className="food-order-heading">
        <div>
          <p>Don Giovanni Restaurant</p>
          <h1>Food Order</h1>
        </div>
        <span>
          {draft.location
            ? locations[draft.location].address
            : "Choose a location before creating the order"}
        </span>
      </section>

      <section className="food-order-meta">
        <label>
          Location
          <select
            id="food-order-location"
            value={draft.location}
            onChange={(event) =>
              updateHeader("location", event.target.value)
            }
          >
            <option value="">Choose Location</option>
            <option value="uptown">Uptown</option>
            <option value="downtown">Downtown</option>
          </select>
        </label>

        <label>
          Date
          <input
            type="date"
            value={draft.date}
            onChange={(event) => updateHeader("date", event.target.value)}
          />
        </label>

        <label>
          Day
          <input value={draft.day} readOnly />
        </label>

        <label>
          Ordered By
          <input
            id="food-order-ordered-by"
            list="food-order-manager-list"
            value={draft.orderedBy}
            onChange={(event) =>
              updateHeader("orderedBy", event.target.value)
            }
          />
        </label>

        <datalist id="food-order-manager-list">
          {managerNames.map((managerName) => (
            <option key={managerName} value={managerName} />
          ))}
        </datalist>
      </section>

      {(Object.keys(sectionDetails) as OrderCategory[]).map((category) => (
        <OrderSection
          key={category}
          category={category}
          items={draft.sections[category]}
          copied={copiedSection === category}
          onUpdate={updateItem}
          onAdd={addCustomItem}
          onRemove={removeCustomItem}
          onCopy={copySection}
        />
      ))}

      <div className="food-order-reset no-print">
        <button
          type="button"
          className="danger-btn"
          onClick={resetOrder}
        >
          Reset Food Order
        </button>
      </div>
    </main>
  );
}

type OrderSectionProps = {
  category: OrderCategory;
  items: OrderItem[];
  copied: boolean;
  onUpdate: (
    category: OrderCategory,
    id: string,
    field: "name" | "quantity" | "unit",
    value: string
  ) => void;
  onAdd: (category: OrderCategory) => void;
  onRemove: (category: OrderCategory, id: string) => void;
  onCopy: (category: OrderCategory) => void;
};

function OrderSection({
  category,
  items,
  copied,
  onUpdate,
  onAdd,
  onRemove,
  onCopy,
}: OrderSectionProps) {
  return (
    <section className={`order-section order-section-${category}`}>
      <header className="order-section-header">
        <h2>{sectionDetails[category].title}</h2>
        <div className="order-section-actions no-print">
          <button type="button" onClick={() => onAdd(category)}>
            + Custom Item
          </button>
          <button
            type="button"
            className="copy-order-btn"
            onClick={() => onCopy(category)}
          >
            {copied ? "Copied!" : "Copy Message"}
          </button>
        </div>
      </header>

      <div className="order-column-labels" aria-hidden="true">
        <span>Item</span>
        <span>Quantity</span>
        <span>Unit</span>
        <span className="no-print">Remove</span>
      </div>

      <div className="order-items">
        {items.map((item) => (
          <div className="order-item-row" key={item.id}>
            <label className="order-item-name">
              <span>Item</span>
              <input
                value={item.name}
                readOnly={!item.custom}
                onChange={(event) =>
                  onUpdate(category, item.id, "name", event.target.value)
                }
              />
            </label>

            <label>
              <span>Quantity</span>
              <input
                inputMode="decimal"
                value={item.quantity}
                onChange={(event) =>
                  onUpdate(
                    category,
                    item.id,
                    "quantity",
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              <span>Unit</span>
              <select
                value={item.unit}
                onChange={(event) =>
                  onUpdate(category, item.id, "unit", event.target.value)
                }
              >
                <option value="count">Count</option>
                <option value="case">Case</option>
                <option value="kg">Kg</option>
                <option value="lb">Lb</option>
              </select>
            </label>

            <div className="order-item-remove no-print">
              {item.custom && (
                <button
                  type="button"
                  aria-label={`Remove ${item.name || "custom item"}`}
                  onClick={() => onRemove(category, item.id)}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
