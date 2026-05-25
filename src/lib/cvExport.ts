import jsPDF from "jspdf";
import { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import type { Employee, EmployeeCV, TrainingPlan, Competency } from "@/types";

export interface CVExportData {
  emp: Employee;
  cv: EmployeeCV;
  plan?: TrainingPlan;
  competencies: Competency[];
}

const displayName = (d: CVExportData) => d.cv.anonymous ? "Colaborador" : d.emp.name;
const englishLine = (cv: CVExportData["cv"]) => `${cv.englishGeneral ?? cv.englishLevel} · CEFR ${cv.englishCEFR ?? "—"}`;

export function exportCVtoPDF(d: CVExportData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  let y = margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const writable = pageWidth - margin * 2;

  const checkPage = (h = 14) => {
    if (y + h > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  doc.setFont("helvetica", "bold"); doc.setFontSize(20);
  doc.text(displayName(d), margin, y); y += 22;

  doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(90);
  doc.text(`${d.emp.role} · ${d.emp.seniority} · Inglés ${d.cv.englishLevel}`, margin, y);
  y += 18;
  doc.setDrawColor(200); doc.line(margin, y, pageWidth - margin, y); y += 16;
  doc.setTextColor(20);

  const section = (title: string) => {
    checkPage(28);
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(40, 80, 160);
    doc.text(title.toUpperCase(), margin, y); y += 14;
    doc.setTextColor(20); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  };

  const text = (s: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(s, writable);
    lines.forEach((ln: string) => { checkPage(); doc.text(ln, margin, y); y += 13; });
  };

  section("Experiencia");
  d.cv.experience.filter((x) => x.includeInCV).forEach((x) => {
    text(`${x.role} · ${x.company}`, true);
    doc.setTextColor(120); text(`${x.from} — ${x.to ?? "Actualidad"}`); doc.setTextColor(20);
    text(x.description); y += 4;
  });

  section("Educación");
  d.cv.education.filter((x) => x.includeInCV).forEach((x) => {
    text(`${x.degree} · ${x.institution} (${x.year})`);
  });

  section("Certificaciones");
  d.cv.certifications.filter((x) => x.includeInCV).forEach((x) => {
    text(`${x.name} · ${x.issuer} (${x.year})`);
  });

  if (d.cv.includeCompetencies) {
    section("Competencias");
    text(d.competencies.map((c) => c.name).slice(0, 24).join(" · "));
  }

  if (d.cv.includeTrainings && d.plan) {
    const done = d.plan.items.filter((i) => i.status === "completado");
    if (done.length) {
      section("Formaciones completadas");
      done.forEach((i) => text(`• ${i.title} (${i.platform})`));
    }
  }

  doc.save(`CV_${displayName(d).replace(/\s+/g, "_")}.pdf`);
}

export async function exportCVtoDOCX(d: CVExportData) {
  const para = (text: string, opts: { bold?: boolean; size?: number; color?: string } = {}) =>
    new Paragraph({ children: [new TextRun({ text, bold: opts.bold, size: opts.size ?? 22, color: opts.color })] });

  const section = (t: string) =>
    new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 },
      children: [new TextRun({ text: t.toUpperCase(), bold: true, color: "2850A0", size: 24 })] });

  const children: Paragraph[] = [
    new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: displayName(d), bold: true, size: 40 })] }),
    new Paragraph({ children: [new TextRun({ text: `${d.emp.role} · ${d.emp.seniority} · Inglés ${d.cv.englishLevel}`, color: "555555", size: 22 })], spacing: { after: 200 } }),
  ];

  children.push(section("Experiencia"));
  d.cv.experience.filter((x) => x.includeInCV).forEach((x) => {
    children.push(para(`${x.role} · ${x.company}`, { bold: true }));
    children.push(para(`${x.from} — ${x.to ?? "Actualidad"}`, { color: "777777", size: 20 }));
    children.push(para(x.description));
  });

  children.push(section("Educación"));
  d.cv.education.filter((x) => x.includeInCV).forEach((x) =>
    children.push(para(`${x.degree} · ${x.institution} (${x.year})`)));

  children.push(section("Certificaciones"));
  d.cv.certifications.filter((x) => x.includeInCV).forEach((x) =>
    children.push(para(`${x.name} · ${x.issuer} (${x.year})`)));

  if (d.cv.includeCompetencies) {
    children.push(section("Competencias"));
    children.push(para(d.competencies.map((c) => c.name).slice(0, 24).join(" · ")));
  }

  if (d.cv.includeTrainings && d.plan) {
    const done = d.plan.items.filter((i) => i.status === "completado");
    if (done.length) {
      children.push(section("Formaciones completadas"));
      done.forEach((i) => children.push(para(`• ${i.title} (${i.platform})`)));
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `CV_${displayName(d).replace(/\s+/g, "_")}.docx`);
}
