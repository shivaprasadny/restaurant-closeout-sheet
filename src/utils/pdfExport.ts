function todayStamp() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function createPdfFileName(title: string) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${slug}-${todayStamp()}.pdf`;
}

export type PdfPage = "closeout" | "timesheet" | "food-order";

/**
 * "print": black and white, same as the Print button (not used right now)
 * "color": colorful screen look, a little bigger (Email PDF and Download PDF)
 */
export type PdfStyle = "print" | "color";

/**
 * Paper settings matching each page's @page print rule (margins in inches).
 * The color PDF is always portrait. colorWidth is its layout width (px);
 * a layout narrower than the screen, stretched to the page, looks bigger.
 */
const pdfLayouts: Record<
  PdfPage,
  { orientation: "portrait" | "landscape"; margin: number; colorWidth: number }
> = {
  closeout: { orientation: "landscape", margin: 0.15, colorWidth: 960 },
  timesheet: { orientation: "portrait", margin: 0, colorWidth: 800 },
  "food-order": { orientation: "portrait", margin: 0.35, colorWidth: 650 },
};

const COLOR_PDF_MARGIN = 0.2;
const LETTER_SHORT_SIDE = 8.5;
const LETTER_LONG_SIDE = 11;

const PDF_STYLE_ID = "pdf-export-styles";
const PDF_COVER_ID = "pdf-creating-cover";

/* The renderer clips text in short inputs; give the % box room */
const INPUT_FIX_CSS = `
  .tip-percent-inline input {
    height: 20px !important;
    padding: 0 2px !important;
    line-height: 18px;
  }
`;

/* Small fixes the PDF renderer needs on top of the page styles */
const PDF_EXTRA_CSS: Record<PdfStyle, string> = {
  print: `
    /* Keep each sheet a little under the page height so no extra page is added */
    .sheet {
      height: 8.1in !important;
      min-height: 8.1in !important;
    }
    ${INPUT_FIX_CSS}
  `,
  color: `
    .no-print {
      display: none !important;
    }

    /* Let the sheet fill the PDF page instead of its fixed screen width */
    .sheet {
      width: auto !important;
      min-height: 0 !important;
      margin: 0 !important;
    }

    /* Keep Day Close Out columns equal; the wide Notes box squeezes them otherwise */
    .closeout-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    }

    /* Notes takes two columns without running past the box edge */
    .closeout-grid > :has(.closeout-notes) {
      grid-column: span 2;
    }

    .closeout-notes {
      width: 100% !important;
    }
    ${INPUT_FIX_CSS}
  `,
};

/**
 * Rewrites a media query list for the PDF:
 * - print style: "print" becomes "all", screen-only queries are dropped
 * - color style: print and small-screen (max-width) queries are dropped,
 *   so the PDF always gets the full desktop look
 */
function toPdfMediaText(mediaText: string, style: PdfStyle): string | null {
  const queries = mediaText
    .split(",")
    .map((query) => query.trim())
    .filter((query) => {
      if (!query) return false;
      if (style === "print") return !/\bscreen\b/i.test(query);
      return !/\bprint\b/i.test(query) && !/max-width/i.test(query);
    })
    .map((query) => query.replace(/\b(print|screen)\b/gi, "all"));

  return queries.length > 0 ? queries.join(", ") : null;
}

function toPdfCss(rules: CSSRuleList, style: PdfStyle): string {
  return Array.from(rules)
    .map((rule) => {
      if (rule instanceof CSSPageRule) return "";

      if (rule instanceof CSSMediaRule) {
        const mediaText = toPdfMediaText(rule.media.mediaText, style);
        return mediaText
          ? `@media ${mediaText} { ${toPdfCss(rule.cssRules, style)} }`
          : "";
      }

      return rule.cssText;
    })
    .join("\n");
}

/**
 * Swaps the page's styles for the PDF styles while the PDF is made.
 * Returns a function that puts the screen styles back.
 */
function applyPdfStyles(style: PdfStyle): () => void {
  const scrollY = window.scrollY;
  const convertedSheets: CSSStyleSheet[] = [];
  let pdfCss = "";

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      pdfCss += toPdfCss(sheet.cssRules, style) + "\n";
      convertedSheets.push(sheet);
    } catch {
      // Cross-origin stylesheet: can't read it, leave it as is
    }
  }

  const pdfStyle = document.createElement("style");
  pdfStyle.id = PDF_STYLE_ID;
  pdfStyle.textContent = pdfCss + PDF_EXTRA_CSS[style];

  // Hides the layout switch from the user while the PDF is created
  const cover = document.createElement("div");
  cover.id = PDF_COVER_ID;
  cover.textContent = "Creating PDF...";
  Object.assign(cover.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2000",
    display: "grid",
    placeItems: "center",
    background: "#e8edf3",
    color: "#172033",
    font: "600 18px system-ui, sans-serif",
  });

  convertedSheets.forEach((sheet) => (sheet.disabled = true));
  document.head.appendChild(pdfStyle);
  document.body.appendChild(cover);

  return () => {
    pdfStyle.remove();
    cover.remove();
    convertedSheets.forEach((sheet) => (sheet.disabled = false));
    window.scrollTo(0, scrollY);
  };
}

/**
 * Print PDFs use real letter paper. Color PDFs use a portrait letter-shaped
 * page sized to their layout width, so the content fills it a little bigger.
 */
function getPdfPageSettings(page: PdfPage, style: PdfStyle) {
  const layout = pdfLayouts[page];

  if (style === "print") {
    return {
      margin: layout.margin,
      format: "letter" as string | [number, number],
      orientation: layout.orientation,
    };
  }

  const width = layout.colorWidth / 96 + COLOR_PDF_MARGIN * 2;

  return {
    margin: COLOR_PDF_MARGIN,
    format: [width, (width * LETTER_LONG_SIDE) / LETTER_SHORT_SIDE] as
      | string
      | [number, number],
    orientation: "portrait" as const,
  };
}

/* Renders the current page into a PDF blob, in the print or color style */
async function createPdfBlob(page: PdfPage, style: PdfStyle): Promise<Blob> {
  // Loaded on demand so the PDF library doesn't slow down the first page load
  const { default: html2pdf } = await import("html2pdf.js");
  const root = document.getElementById("root")!;
  const { margin, format, orientation } = getPdfPageSettings(page, style);

  const pdfOptions = {
    margin,
    image: { type: "jpeg" as const, quality: 0.95 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      // .no-print is hidden by the PDF styles; removing it here would
      // shift nth-child column widths
      ignoreElements: (element: Element) => element.id === PDF_COVER_ID,
      // The canvas renderer copies the document, so keep only PDF styles there too
      onclone: (clonedDocument: Document) => {
        clonedDocument
          .querySelectorAll('style, link[rel="stylesheet"]')
          .forEach((element) => {
            const isCrossOrigin =
              element instanceof HTMLLinkElement &&
              new URL(element.href).origin !== window.location.origin;

            if (element.id !== PDF_STYLE_ID && !isCrossOrigin) {
              element.remove();
            }
          });
      },
    },
    jsPDF: {
      unit: "in",
      format,
      orientation,
    },
  };

  const restoreScreenStyles = applyPdfStyles(style);

  try {
    return await html2pdf()
      .set(pdfOptions)
      .from(root)
      .outputPdf("blob");
  } finally {
    restoreScreenStyles();
  }
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadPagePdf(page: PdfPage, title: string) {
  const blob = await createPdfBlob(page, "color");
  downloadBlob(blob, createPdfFileName(title));
}

export async function emailPagePdf(
  page: PdfPage,
  title: string,
  recipient: string
) {
  const fileName = createPdfFileName(title);
  const blob = await createPdfBlob(page, "color");
  const subject = `${title} - ${todayStamp()}`;

  /* Phones/tablets: share sheet attaches the PDF straight into Mail */
  const file = new File([blob], fileName, { type: "application/pdf" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: subject,
        text: `${subject}\nSend to: ${recipient}`,
      });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      // Any other share failure falls through to download + mail app
    }
  }

  /* Desktop: mail links can't carry attachments, so download the PDF first */
  downloadBlob(blob, fileName);

  const body = `Hi,\n\nPlease find the ${title} attached (${fileName}).\n`;
  window.location.href =
    `mailto:${recipient}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;

  window.alert(
    `${fileName} was downloaded. Attach it to the email that just opened.`
  );
}
