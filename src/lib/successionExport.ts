import jsPDF from "jspdf";
import type { Employee, SuccessionPlan } from "@/types";

export function exportSuccessionReport(plans: SuccessionPlan[], employees: Employee[]) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageH = doc.internal.pageSize.getHeight();
  let y = margin;
  const check = (h = 14) => { if (y + h > pageH - margin) { doc.addPage(); y = margin; } };
  const name = (id?: string) => employees.find((e) => e.id === id)?.name ?? "—";

  doc.setFont("helvetica", "bold"); doc.setFontSize(18);
  doc.text("Reporte de Planes de Sucesión", margin, y); y += 24;
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleDateString()}`, margin, y); y += 20;

  plans.forEach((p) => {
    check(60);
    doc.setFont("helvetica", "bold"); doc.setFontSize(13);
    doc.text(p.targetRoleName, margin, y); y += 16;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text(`Titular actual: ${p.currentHolderId ? name(p.currentHolderId) : "Vacante"}`, margin, y); y += 14;
    doc.text(`Candidatos: ${p.successorCandidates.length}`, margin, y); y += 14;
    if (p.notes) { doc.text(`Notas: ${p.notes}`, margin, y, { maxWidth: 500 }); y += 14; }

    p.successorCandidates.forEach((c) => {
      check(40);
      doc.setFont("helvetica", "bold"); doc.setFontSize(10);
      doc.text(`• ${name(c.employeeId)} — ${c.readinessLevel} (${c.readinessPercentage}%)`, margin + 12, y); y += 12;
      doc.setFont("helvetica", "normal");
      if (c.strengths.length) { doc.text(`Fortalezas: ${c.strengths.join(", ")}`, margin + 24, y, { maxWidth: 480 }); y += 12; }
      if (c.developmentAreas.length) { doc.text(`A desarrollar: ${c.developmentAreas.join(", ")}`, margin + 24, y, { maxWidth: 480 }); y += 12; }
      doc.text(`Plan de formación: ${c.hasDevelopmentPlan ? "Sí" : "No"}`, margin + 24, y); y += 14;
    });
    y += 8;
  });

  doc.save(`sucesion-${new Date().toISOString().slice(0, 10)}.pdf`);
}
