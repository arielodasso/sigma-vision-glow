// Edge Function: generate-budget-pdf
// Genera un PDF profesional del presupuesto desde el servidor usando jsPDF.
// Públicamente accesible — el slug actúa como token (URL no enumerable).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { jsPDF } from "https://esm.sh/jspdf@2.5.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// (Logo eliminado — header tipográfico minimalista)

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  sent: "Enviado",
  accepted: "Aceptado",
  rejected: "Rechazado",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    if (!slug || !/^[a-z0-9-]{3,80}$/i.test(slug)) {
      return new Response(JSON.stringify({ error: "Invalid slug" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: budget, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !budget) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build PDF
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const M = 18; // margin
    const contentW = pageW - M * 2;

    // Colors
    const ink = [20, 22, 26] as const;
    const muted = [120, 124, 132] as const;
    const line = [225, 227, 232] as const;
    const subtle = [248, 249, 251] as const;

    let y = M;

    // ===== HEADER (tipográfico, sin logo cuadrado) =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...ink);
    doc.text("Sigma", M, y + 6);
    const sigmaW = doc.getTextWidth("Sigma");
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...muted);
    doc.text("Tecnologías", M + sigmaW + 1.8, y + 6);

    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text("sigmatecnologiasarg.com", M, y + 11);

    // Right side: presupuesto label + date
    const date = new Date(budget.created_at).toLocaleDateString("es-AR", {
      day: "2-digit", month: "long", year: "numeric",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text("PRESUPUESTO", pageW - M, y + 4, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...ink);
    doc.text(`#${budget.slug}`, pageW - M, y + 9, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(date, pageW - M, y + 13, { align: "right" });

    y += 22;
    doc.setDrawColor(...line);
    doc.setLineWidth(0.2);
    doc.line(M, y, pageW - M, y);
    y += 10;

    // ===== Status badge + Cliente =====
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text("CLIENTE", M, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...ink);
    doc.text(String(budget.client_name), M, y + 7);

    // status pill on right
    const status = budget.status || "draft";
    const label = STATUS_LABEL[status] || status;
    const pillW = doc.getTextWidth(label) + 8;
    const pillX = pageW - M - pillW;
    const pillColors: Record<string, [number, number, number]> = {
      draft: [240, 240, 242],
      sent: [219, 234, 254],
      accepted: [209, 250, 229],
      rejected: [254, 226, 226],
    };
    const pillTextColors: Record<string, [number, number, number]> = {
      draft: [82, 86, 94],
      sent: [29, 78, 216],
      accepted: [4, 120, 87],
      rejected: [185, 28, 28],
    };
    doc.setFillColor(...(pillColors[status] || pillColors.draft));
    doc.roundedRect(pillX, y - 1, pillW, 6, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...(pillTextColors[status] || pillTextColors.draft));
    doc.text(label, pillX + pillW / 2, y + 3, { align: "center" });

    y += 16;

    // Helper functions
    const ensureSpace = (needed: number) => {
      if (y + needed > pageH - M - 18) {
        addFooter();
        doc.addPage();
        y = M;
      }
    };

    const section = (label: string) => {
      ensureSpace(10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...muted);
      doc.text(label.toUpperCase(), M, y);
      y += 5;
    };

    const paragraph = (text: string) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...ink);
      const lines = doc.splitTextToSize(text, contentW);
      ensureSpace(lines.length * 5 + 4);
      doc.text(lines, M, y);
      y += lines.length * 5 + 6;
    };

    const twoCol = (
      leftLabel: string, leftVal: string,
      rightLabel: string, rightVal: string
    ) => {
      const colW = contentW / 2 - 4;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...muted);
      doc.text(leftLabel.toUpperCase(), M, y);
      doc.text(rightLabel.toUpperCase(), M + contentW / 2 + 4, y);
      y += 5;
      doc.setFontSize(10);
      doc.setTextColor(...ink);
      const lLines = doc.splitTextToSize(leftVal, colW);
      const rLines = doc.splitTextToSize(rightVal, colW);
      const h = Math.max(lLines.length, rLines.length) * 5;
      ensureSpace(h + 4);
      doc.text(lLines, M, y);
      doc.text(rLines, M + contentW / 2 + 4, y);
      y += h + 6;
    };

    // ===== Sections =====
    if (budget.scope) { section("El presupuesto contempla"); paragraph(String(budget.scope)); }
    if (budget.work_type) { section("Tipo de trabajo y metodología"); paragraph(String(budget.work_type)); }
    if (budget.observations) { section("Observaciones"); paragraph(String(budget.observations)); }

    if (budget.delivery_time && budget.payment_method) {
      twoCol("Plazo de entrega", String(budget.delivery_time), "Forma de pago", String(budget.payment_method));
    } else if (budget.delivery_time) {
      section("Plazo de entrega"); paragraph(String(budget.delivery_time));
    } else if (budget.payment_method) {
      section("Forma de pago"); paragraph(String(budget.payment_method));
    }

    if (budget.billing) { section("Facturación"); paragraph(String(budget.billing)); }

    // ===== Items table =====
    const items = Array.isArray(budget.items) ? budget.items : [];
    if (items.length > 0) {
      section("Detalle");
      ensureSpace(10);
      const priceColW = 40;
      const descX = M + 2;
      const priceX = pageW - M - 2;

      items.forEach((it: any, idx: number) => {
        const desc = String(it.description || "");
        const price = Number(it.price) || 0;
        const lines = doc.splitTextToSize(desc, contentW - priceColW - 8);
        const rowH = Math.max(lines.length * 5, 7) + 5;
        ensureSpace(rowH + 2);
        if (idx > 0) {
          doc.setDrawColor(235, 237, 240);
          doc.setLineWidth(0.2);
          doc.line(M, y - 1, pageW - M, y - 1);
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...ink);
        doc.text(lines, descX, y + 4);
        doc.setFont("helvetica", "bold");
        doc.text(fmtUSD(price), priceX, y + 4, { align: "right" });
        y += rowH;
      });
      y += 8;
    }

    // ===== Totals box (limpio, con jerarquía clara) =====
    const devTotal = Number(budget.development_cost) || items.reduce((a: number, i: any) => a + (Number(i.price) || 0), 0);
    const monthly = budget.monthly_maintenance_cost != null ? Number(budget.monthly_maintenance_cost) : null;

    const padX = 10;
    const rowH = 18;
    const totalsH = monthly != null ? rowH * 2 + 4 : rowH + 8;
    ensureSpace(totalsH + 16);

    // Outer container with subtle border, no fill (cleaner look)
    doc.setDrawColor(...line);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, y, contentW, totalsH, 4, 4, "S");

    // Row 1: Costo total de desarrollo
    const row1Y = y + (monthly != null ? rowH / 2 + 2 : totalsH / 2 + 1);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...muted);
    doc.text("Costo total de desarrollo", M + padX, row1Y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...ink);
    doc.text(fmtUSD(devTotal), pageW - M - padX, row1Y + 1, { align: "right" });

    if (monthly != null) {
      // Divider
      const divY = y + rowH + 2;
      doc.setDrawColor(235, 237, 240);
      doc.setLineWidth(0.2);
      doc.line(M + padX, divY, pageW - M - padX, divY);

      const row2Y = divY + rowH / 2 + 1;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...muted);
      doc.text("Mantenimiento mensual", M + padX, row2Y);

      const monthlyStr = fmtUSD(monthly);
      const suffix = " / mes";
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...muted);
      const suffixW = doc.getTextWidth(suffix);
      doc.text(suffix, pageW - M - padX, row2Y, { align: "right" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...ink);
      doc.text(monthlyStr, pageW - M - padX - suffixW, row2Y, { align: "right" });
    }

    y += totalsH + 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(
      "*Valor en USD. Conversión al tipo de cambio vendedor del día de pago.",
      M, y + 4
    );
    y += 10;

    // ===== Footer (every page) =====
    function addFooter() {
      const fy = pageH - M + 4;
      doc.setDrawColor(...line);
      doc.setLineWidth(0.2);
      doc.line(M, fy - 4, pageW - M, fy - 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...muted);
      doc.text("Sigma Tecnologías · sigmatecnologiasarg.com", M, fy);
      const pageNum = doc.getCurrentPageInfo().pageNumber;
      const pageCount = doc.getNumberOfPages();
      doc.text(`${pageNum} / ${pageCount}`, pageW - M, fy, { align: "right" });
    }

    // Add footer to every page
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      addFooter();
    }

    const arr = doc.output("arraybuffer");
    return new Response(arr, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="presupuesto-${budget.slug}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("PDF generation error:", e);
    return new Response(JSON.stringify({ error: "Failed to generate PDF" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
