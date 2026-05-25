import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, FileText, FileImage, Trash2, Plus, Upload, X, FileDown } from "lucide-react";
import { COMPANY_TECHNOLOGIES, type EmployeeCV, type Employee, type TrainingPlan, type Competency, type CVCertification, type CVExperience, type EducationLevel } from "@/types";
import { toast } from "sonner";
import { exportCVtoPDF, exportCVtoDOCX } from "@/lib/cvExport";

const EDUCATION_LEVELS: EducationLevel[] = [
  "Primario Incompleto", "Primario Completo",
  "Secundario Incompleto", "Secundario Completo",
  "Terciario Incompleto", "Terciario Completo",
  "Universitario Incompleto", "Universitario Completo",
  "Posgrado Incompleto", "Posgrado Completo",
];

interface Props {
  emp: Employee;
  cv: EmployeeCV;
  plan?: TrainingPlan;
  competencies: Competency[];
  updateCV: (employeeId: string, patch: Partial<EmployeeCV>) => void;
}

export function CvTab({ emp, cv, plan, competencies, updateCV }: Props) {
  const [techInput, setTechInput] = useState("");
  const [previewFile, setPreviewFile] = useState<{ type: "pdf" | "image"; data: string; name: string } | null>(null);

  const patch = (p: Partial<EmployeeCV>) => updateCV(emp.id, p);
  const techs = cv.technologies ?? [];

  const toggleTech = (t: string) => {
    if (techs.includes(t)) patch({ technologies: techs.filter((x) => x !== t) });
    else patch({ technologies: [...techs, t] });
  };
  const addCustomTech = () => {
    const v = techInput.trim();
    if (!v || techs.includes(v)) return;
    patch({ technologies: [...techs, v] });
    setTechInput("");
  };

  const updateCert = (i: number, p: Partial<CVCertification>) => {
    patch({ certifications: cv.certifications.map((c, idx) => idx === i ? { ...c, ...p } : c) });
  };
  const removeCert = (i: number) => patch({ certifications: cv.certifications.filter((_, idx) => idx !== i) });
  const addCert = () => patch({
    certifications: [...cv.certifications, { name: "", issuer: "", year: String(new Date().getFullYear()), includeInCV: true }],
  });

  const updateExp = (i: number, p: Partial<CVExperience>) => {
    patch({ experience: cv.experience.map((e, idx) => idx === i ? { ...e, ...p } : e) });
  };
  const removeExp = (i: number) => patch({ experience: cv.experience.filter((_, idx) => idx !== i) });
  const addExp = () => patch({
    experience: [...cv.experience, { company: "", role: "", from: "", description: "", includeInCV: true }],
  });

  return (
    <>
      <div className="grid lg:grid-cols-[1fr_440px] gap-4">
        {/* LEFT: Editor */}
        <div className="space-y-3">
          {/* Sección 1 - Inglés */}
          <Section title="Nivel de inglés">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Nivel general</Label>
                <Select value={cv.englishGeneral ?? "Intermedio"} onValueChange={(v) => patch({ englishGeneral: v as EmployeeCV["englishGeneral"] })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Inicial", "Intermedio", "Avanzado", "Certificado"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Marco europeo (CEFR)</Label>
                <Select value={cv.englishCEFR ?? "B1"} onValueChange={(v) => patch({ englishCEFR: v as EmployeeCV["englishCEFR"] })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["A1", "A2", "B1", "B2", "C1", "C2"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <IncludeToggle label="Incluir nivel de inglés en CV" checked={cv.includeEnglish ?? true} onChange={(v) => patch({ includeEnglish: v })} />
          </Section>

          {/* Sección 2 - Educación */}
          <Section title="Educación">
            <div>
              <Label className="text-xs">Nivel máximo alcanzado</Label>
              <Select value={cv.educationLevel ?? "Universitario Incompleto"} onValueChange={(v) => patch({ educationLevel: v as EducationLevel })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EDUCATION_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <Label className="text-xs">Institución</Label>
                <Input value={cv.educationInstitution ?? ""} onChange={(e) => patch({ educationInstitution: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Carrera / Título</Label>
                <Input value={cv.educationDegree ?? ""} onChange={(e) => patch({ educationDegree: e.target.value })} className="mt-1" />
              </div>
            </div>
            <IncludeToggle label="Incluir educación en CV" checked={cv.includeEducation ?? true} onChange={(v) => patch({ includeEducation: v })} />
          </Section>

          {/* Sección 3 - Tecnologías */}
          <Section title="Tecnologías">
            <div className="flex flex-wrap gap-1.5">
              {COMPANY_TECHNOLOGIES.map((t) => {
                const on = techs.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleTech(t)}
                    className={`text-xs px-2 py-1 rounded-md border transition-colors ${on ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary/50"}`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            {techs.filter((t) => !(COMPANY_TECHNOLOGIES as readonly string[]).includes(t)).length > 0 && (
              <div className="mt-3">
                <Label className="text-xs">Tecnologías personalizadas</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {techs.filter((t) => !(COMPANY_TECHNOLOGIES as readonly string[]).includes(t)).map((t) => (
                    <Badge key={t} variant="secondary" className="gap-1">
                      {t}
                      <button onClick={() => toggleTech(t)} aria-label="Quitar"><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <Input
                placeholder="+ Agregar tecnología"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTech(); } }}
              />
              <Button type="button" variant="outline" onClick={addCustomTech}><Plus className="h-4 w-4" /></Button>
            </div>
            <IncludeToggle label="Incluir tecnologías en CV" checked={cv.includeTechnologies ?? true} onChange={(v) => patch({ includeTechnologies: v })} />
          </Section>

          {/* Sección 4 - Certificaciones */}
          <Section title="Certificaciones Oficiales">
            <div className="flex items-center justify-between">
              <Label className="text-sm">¿Cuenta con certificaciones oficiales?</Label>
              <Switch checked={cv.hasCertifications ?? false} onCheckedChange={(v) => patch({ hasCertifications: v })} />
            </div>
            {cv.hasCertifications && (
              <div className="space-y-3 mt-3">
                {cv.certifications.map((c, i) => (
                  <CertRow
                    key={i}
                    cert={c}
                    onChange={(p) => updateCert(i, p)}
                    onRemove={() => removeCert(i)}
                    onPreview={() => c.fileBase64 && c.fileType && setPreviewFile({ type: c.fileType, data: c.fileBase64, name: c.fileName ?? c.name })}
                  />
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addCert}><Plus className="h-4 w-4 mr-1" />Agregar certificación</Button>
              </div>
            )}
          </Section>

          {/* Sección 5 - Experiencia Laboral */}
          <Section title="Experiencia Laboral">
            <div className="space-y-3">
              {cv.experience.map((e, i) => (
                <div key={i} className="rounded-md border border-border bg-background/40 p-3 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <Input placeholder="Empresa" value={e.company} onChange={(ev) => updateExp(i, { company: ev.target.value })} />
                      <Input placeholder="Rol" value={e.role} onChange={(ev) => updateExp(i, { role: ev.target.value })} />
                      <Input placeholder="Desde (YYYY-MM)" value={e.from} onChange={(ev) => updateExp(i, { from: ev.target.value })} />
                      <Input placeholder="Hasta (YYYY-MM o vacío)" value={e.to ?? ""} onChange={(ev) => updateExp(i, { to: ev.target.value || undefined })} />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeExp(i)}><Trash2 className="h-4 w-4 text-danger" /></Button>
                  </div>
                  <Textarea placeholder="Descripción" value={e.description} onChange={(ev) => updateExp(i, { description: ev.target.value })} rows={2} />
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Incluir en CV</Label>
                    <Switch checked={e.includeInCV} onCheckedChange={(v) => updateExp(i, { includeInCV: v })} />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addExp}><Plus className="h-4 w-4 mr-1" />Agregar experiencia</Button>
            </div>
          </Section>
        </div>

        {/* RIGHT: Preview + export */}
        <div className="space-y-3 lg:sticky lg:top-4 self-start">
          <Card className="bg-white text-slate-900 border-border shadow-md">
            <CardContent className="p-6 text-sm">
              <div className="border-b border-slate-200 pb-3 mb-3">
                <h3 className="font-display text-xl font-bold">{cv.anonymous ? "Colaborador" : emp.name}</h3>
                <p className="text-xs text-slate-600">{emp.role} · {emp.seniority} · {emp.unit === "negocio" ? "Negocio" : "Soporte"}</p>
              </div>

              {cv.includeEnglish && (
                <PreviewSection title="Inglés">
                  <p>{cv.englishGeneral ?? "—"} · CEFR {cv.englishCEFR ?? "—"}</p>
                </PreviewSection>
              )}

              {cv.includeEducation && (
                <PreviewSection title="Educación">
                  <p className="font-medium">{cv.educationLevel}</p>
                  <p className="text-slate-600">{cv.educationDegree}{cv.educationInstitution ? ` · ${cv.educationInstitution}` : ""}</p>
                </PreviewSection>
              )}

              {cv.includeTechnologies && techs.length > 0 && (
                <PreviewSection title="Tecnologías">
                  <div className="flex flex-wrap gap-1">
                    {techs.map((t) => <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">{t}</span>)}
                  </div>
                </PreviewSection>
              )}

              {cv.hasCertifications && cv.certifications.filter((c) => c.includeInCV && c.name).length > 0 && (
                <PreviewSection title="Certificaciones">
                  {cv.certifications.filter((c) => c.includeInCV && c.name).map((c, i) => (
                    <div key={i} className="text-[13px]">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-slate-600"> · {c.issuer} ({c.year}){c.expiresAt ? ` · vence ${c.expiresAt}` : ""}</span>
                    </div>
                  ))}
                </PreviewSection>
              )}

              {cv.experience.filter((e) => e.includeInCV).length > 0 && (
                <PreviewSection title="Experiencia">
                  {cv.experience.filter((e) => e.includeInCV).map((e, i) => (
                    <div key={i} className="mb-2">
                      <div className="font-medium">{e.role} · {e.company}</div>
                      <div className="text-[11px] text-slate-500">{e.from} — {e.to ?? "Actualidad"}</div>
                      {e.description && <p className="text-[12px] mt-0.5">{e.description}</p>}
                    </div>
                  ))}
                </PreviewSection>
              )}

              {cv.includeCompetencies && (
                <PreviewSection title="Competencias">
                  {(["Técnica", "Soft"] as const).map((dom) => {
                    const items = competencies.filter((c) => c.domain === dom);
                    if (!items.length) return null;
                    return (
                      <div key={dom} className="mb-2">
                        <div className="text-[11px] uppercase tracking-wide text-slate-500">{dom}</div>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {items.map((c) => <span key={c.id} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">{c.name}</span>)}
                        </div>
                      </div>
                    );
                  })}
                </PreviewSection>
              )}

              {cv.includeTrainings && plan && plan.items.filter((i) => i.status === "completado").length > 0 && (
                <PreviewSection title="Formaciones completadas">
                  {plan.items.filter((i) => i.status === "completado").map((i) => (
                    <div key={i.id} className="text-[12px]">• {i.title} · {i.platform} ({new Date().getFullYear()})</div>
                  ))}
                </PreviewSection>
              )}
            </CardContent>
          </Card>

          <Card className="bg-surface/60 border-border">
            <CardHeader className="pb-2"><CardTitle className="font-display text-sm">Opciones de exportación</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <RowSwitch label="CV anónimo" checked={cv.anonymous} onChange={(v) => patch({ anonymous: v })} />
                <RowSwitch label="Incluir competencias" checked={cv.includeCompetencies} onChange={(v) => patch({ includeCompetencies: v })} />
                <RowSwitch label="Incluir formaciones completadas" checked={cv.includeTrainings} onChange={(v) => patch({ includeTrainings: v })} />
              </div>
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <Button variant="outline" onClick={async () => { await exportCVtoDOCX({ emp, cv, plan, competencies }); toast.success("CV exportado a Word"); }}>
                  <FileDown className="h-4 w-4 mr-1" />Exportar Word (.docx)
                </Button>
                <Button variant="outline" onClick={() => { exportCVtoPDF({ emp, cv, plan, competencies }); toast.success("CV exportado a PDF"); }}>
                  <FileDown className="h-4 w-4 mr-1" />Exportar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!previewFile} onOpenChange={(o) => !o && setPreviewFile(null)}>
        <DialogContent className="max-w-3xl">
          {previewFile?.type === "pdf" ? (
            <iframe src={previewFile.data} className="w-full h-[70vh] rounded" title={previewFile.name} />
          ) : previewFile ? (
            <img src={previewFile.data} alt={previewFile.name} className="w-full max-h-[70vh] object-contain" />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Collapsible defaultOpen>
      <Card className="bg-surface/60 border-border">
        <CollapsibleTrigger className="w-full group">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-sm text-left">{title}</CardTitle>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-3 pt-0">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function IncludeToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between pt-2 border-t border-border/50">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function RowSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-xs">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <h4 className="font-display font-semibold text-[11px] uppercase tracking-wider text-blue-700 mb-1">{title}</h4>
      {children}
    </div>
  );
}

function CertRow({ cert, onChange, onRemove, onPreview }: {
  cert: CVCertification;
  onChange: (p: Partial<CVCertification>) => void;
  onRemove: () => void;
  onPreview: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = (f: File) => {
    if (f.size > 5 * 1024 * 1024) { toast.error("Archivo demasiado grande (máx 5MB)"); return; }
    const isPdf = f.type === "application/pdf";
    const isImg = f.type.startsWith("image/");
    if (!isPdf && !isImg) { toast.error("Formato no soportado (PDF, PNG, JPG)"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        fileBase64: reader.result as string,
        fileType: isPdf ? "pdf" : "image",
        fileName: f.name,
      });
    };
    reader.readAsDataURL(f);
  };

  return (
    <div className="rounded-md border border-border bg-background/40 p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Nombre" value={cert.name} onChange={(e) => onChange({ name: e.target.value })} />
        <Input placeholder="Emisor" value={cert.issuer} onChange={(e) => onChange({ issuer: e.target.value })} />
        <Input placeholder="Año" value={cert.year} onChange={(e) => onChange({ year: e.target.value })} />
        <Input placeholder="Vence (YYYY-MM, opcional)" value={cert.expiresAt ?? ""} onChange={(e) => onChange({ expiresAt: e.target.value || undefined })} />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <Upload className="h-3.5 w-3.5 mr-1" />Subir archivo
        </Button>
        {cert.fileBase64 && cert.fileType && (
          <button onClick={onPreview} className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
            {cert.fileType === "pdf" ? <FileText className="h-4 w-4" /> : <FileImage className="h-4 w-4" />}
            {cert.fileName ?? "Ver archivo"}
          </button>
        )}
        {cert.fileType === "image" && cert.fileBase64 && (
          <button onClick={onPreview}>
            <img src={cert.fileBase64} alt="" className="h-10 w-10 object-cover rounded border border-border" />
          </button>
        )}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Incluir</Label>
            <Switch checked={cert.includeInCV} onCheckedChange={(v) => onChange({ includeInCV: v })} />
          </div>
          <Button variant="ghost" size="icon" onClick={onRemove}><Trash2 className="h-4 w-4 text-danger" /></Button>
        </div>
      </div>
    </div>
  );
}
