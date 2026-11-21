"use client";

import { useState } from "react";

/* ─────────────────────────────────────────────────────────
 * Export a saved report as a PDF.
 * ─────────────────────────────────────────────────────────
 * The report view already renders each tool's payload the way
 * that tool's own page does, so the PDF screenshots that DOM
 * rather than re-rendering the data a second time. Whatever you
 * see on screen is what lands in the file.
 *
 * Two things the single-page exporter in the free-seo-report tool
 * does not have to handle, and this one does:
 *
 * 1. The report views use `max-height` plus `overflow: auto` for
 *    long tables. html2canvas honours overflow clipping, so every
 *    row below the fold would be silently missing from the PDF.
 *    Those containers are expanded for the capture and restored
 *    afterwards, in a `finally` so a failure cannot leave the page
 *    scrolled open.
 * 2. Reports are frequently longer than one A4 page. The canvas is
 *    drawn at successive negative offsets so each page carries the
 *    next slice of it. Drawing the whole canvas at page one instead
 *    would scale it to a single sheet and drop everything past it.
 *
 * The capturing happens in the browser, so nothing is uploaded and
 * the stored report is never modified.
 * ───────────────────────────────────────────────────────── */

const CAPTURE_ROOT_ID = "report-root";

export function ExportPdfButton({ filename }: { filename: string }) {
  const [state, setState] = useState<"idle" | "working" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const exportPdf = async () => {
    const element = document.getElementById(CAPTURE_ROOT_ID);
    if (!element) {
      setState("error");
      setMessage("Could not find the report content to export.");
      return;
    }

    setState("working");
    setMessage(null);

    // Expand scroll containers so nothing is clipped out of the capture.
    const expanded: { el: HTMLElement; maxHeight: string; overflow: string }[] = [];
    element.querySelectorAll<HTMLElement>("*").forEach((el) => {
      const computed = window.getComputedStyle(el);
      const scrolls = computed.overflowY === "auto" || computed.overflowY === "scroll";
      if (scrolls || computed.maxHeight !== "none") {
        expanded.push({ el, maxHeight: el.style.maxHeight, overflow: el.style.overflow });
        el.style.maxHeight = "none";
        el.style.overflow = "visible";
      }
    });

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imageData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageHeight = (canvas.height * pageWidth) / canvas.width;

      // Draw the image at progressively negative offsets: each added page
      // reveals the next slice rather than rescaling the whole report.
      let heightLeft = imageHeight;
      let offset = 0;

      pdf.addImage(imageData, "JPEG", 0, offset, pageWidth, imageHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        offset -= pageHeight;
        pdf.addPage();
        pdf.addImage(imageData, "JPEG", 0, offset, pageWidth, imageHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
      setState("idle");
    } catch (err) {
      console.error("PDF export failed:", err);
      setState("error");
      setMessage(err instanceof Error ? err.message : "PDF export failed.");
    } finally {
      expanded.forEach(({ el, maxHeight, overflow }) => {
        el.style.maxHeight = maxHeight;
        el.style.overflow = overflow;
      });
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={exportPdf}
        disabled={state === "working"}
        className="nav-cta"
        style={{
          border: "none",
          cursor: state === "working" ? "default" : "pointer",
          opacity: state === "working" ? 0.6 : 1,
        }}
      >
        {state === "working" ? "Building PDF…" : "Export PDF"}
      </button>
      {state === "error" && message && (
        <span style={{ color: "var(--red)", fontSize: 13 }}>{message}</span>
      )}
    </div>
  );
}
