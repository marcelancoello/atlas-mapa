import type {
  Employee, Assessment, TrainingPlan, SeniorityTransition,
  CompetencyAssessment, TrainingItem, EmployeeCV, Quarter, Seniority,
  Notification, CourseRequest, SuccessionPlan,
} from "@/types";
import { competencies } from "./seedCompetencies";

const today = new Date();
const iso = (d: Date) => d.toISOString();
const daysAgo = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return iso(d); };

export const employees: Employee[] = [
  { id: "u-1", name: "Ana Pérez", email: "ana.perez@atlas.io", role: "L&D Administrator", seniority: "Tech Lead", stack: ["L&D"], joinDate: "2020-03-15", appRole: "ld_admin", unit: "soporte", status: "active", readinessScore: 9.5 },
  { id: "u-2", name: "Valentina López", email: "valentina.lopez@atlas.io", role: "DevOps Engineer", seniority: "Senior", targetSeniority: "Tech Lead", stack: ["DevOps", "AWS", "Docker"], joinDate: "2019-07-01", appRole: "manager", unit: "negocio", status: "in-review", readinessScore: 8.7 },
  { id: "u-3", name: "Nicolás Rodríguez", email: "nicolas.rodriguez@atlas.io", role: "Fullstack Engineer", seniority: "Senior", stack: ["React", "Node", "AWS"], joinDate: "2020-11-10", managerId: "u-2", appRole: "leader", unit: "negocio", status: "active", readinessScore: 9.1 },
  { id: "u-4", name: "Martina García", email: "martina.garcia@atlas.io", role: "Backend Engineer", seniority: "Semi-Senior", stack: ["Java", "SQL"], joinDate: "2022-02-20", leaderId: "u-3", managerId: "u-2", appRole: "employee", unit: "negocio", status: "active", readinessScore: 6.2 },
  { id: "u-5", name: "Tomás Herrera", email: "tomas.herrera@atlas.io", role: "Frontend Engineer", seniority: "Trainee", stack: ["React"], joinDate: "2025-09-01", managerId: "u-2", appRole: "employee", unit: "negocio", status: "onboarding", readinessScore: 2.3 },
  { id: "u-6", name: "Camila Martínez", email: "camila.martinez@atlas.io", role: "QA Analyst", seniority: "Junior", stack: ["QA", "Cypress"], joinDate: "2023-05-10", leaderId: "u-3", managerId: "u-2", appRole: "employee", unit: "negocio", status: "active", readinessScore: 5.5 },
  { id: "u-7", name: "Sebastián Torres", email: "sebastian.torres@atlas.io", role: "Data Engineer", seniority: "Semi-Senior", stack: ["Python", "SQL", "AWS"], joinDate: "2022-08-15", leaderId: "u-3", managerId: "u-2", appRole: "employee", unit: "soporte", status: "active", readinessScore: 6.8 },
  { id: "u-8", name: "Lucas Fernández", email: "lucas.fernandez@atlas.io", role: "Frontend Engineer", seniority: "Junior", stack: ["React"], joinDate: "2024-11-05", leaderId: "u-3", managerId: "u-2", appRole: "employee", unit: "negocio", status: "onboarding", readinessScore: 4.1 },
];

function gapSeverity(g: number): CompetencyAssessment["gapSeverity"] {
  if (g <= 0) return "none";
  if (g === 1) return "mild";
  if (g === 2) return "moderate";
  return "critical";
}

function makeAssessment(emp: Employee, profile: (id: string) => { self: number; mgr: number }): Assessment {
  const comps: CompetencyAssessment[] = competencies.map((c) => {
    const { self, mgr } = profile(c.id);
    const avg = +(((self + mgr) / 2).toFixed(2));
    const expected = c.expectedLevelBySeniority[emp.seniority];
    const gap = Math.max(0, expected - avg);
    return {
      competencyId: c.id, selfScore: self, managerScore: mgr,
      averageScore: avg, expectedLevel: expected,
      gap: +gap.toFixed(2),
      gapSeverity: gapSeverity(Math.round(gap)),
      discrepancy: Math.abs(self - mgr) > 1,
    };
  });
  const readiness = +(emp.readinessScore ?? 7).toFixed(1);
  return {
    id: `a-${emp.id}`, employeeId: emp.id, type: "periodico",
    date: daysAgo(20), competencies: comps,
    readinessScore: readiness, status: "completado",
    managerNotes: "Buen desempeño general, foco en cerrar gaps técnicos críticos.",
  };
}

// Distinct profile per employee, with discrepancies and varied gaps
const profileFor = (emp: Employee) => (cid: string) => {
  const c = competencies.find((x) => x.id === cid)!;
  const expected = c.expectedLevelBySeniority[emp.seniority];
  const seed = (cid.charCodeAt(cid.length - 1) + emp.id.charCodeAt(emp.id.length - 1)) % 5;
  let mgr = Math.max(0, Math.min(4, expected - (seed % 3)));
  let self = Math.max(0, Math.min(4, mgr + (seed === 2 ? 2 : seed === 0 ? -1 : 0)));
  return { self, mgr };
};

export const assessments: Assessment[] = employees
  .filter((e) => e.status !== "onboarding" || e.id === "u-8")
  .map((e) => makeAssessment(e, profileFor(e)));

const QUARTERS: Quarter[] = ["Q1", "Q2", "Q3", "Q4"];

function planFor(emp: Employee): TrainingPlan | null {
  const a = assessments.find((x) => x.employeeId === emp.id);
  if (!a) return null;
  const gaps = [...a.competencies].filter((c) => c.gap >= 1).sort((x, y) => y.gap - x.gap).slice(0, 8);
  const items: TrainingItem[] = gaps.map((g, i): TrainingItem => ({
    id: `ti-${emp.id}-${i}`,
    title: `Formación: ${competencies.find((c) => c.id === g.competencyId)?.name}`,
    type: i % 2 === 0 ? "Interno" : "Externo",
    platform: i % 2 === 0 ? "Interno" : ["Udemy", "Coursera", "Platzi"][i % 3],
    durationHours: 8 + (i % 4) * 4,
    competencyIds: [g.competencyId],
    currentLevel: Math.round(g.averageScore),
    targetLevel: g.expectedLevel,
    priority: g.gap >= 3 ? "Alta" : g.gap >= 2 ? "Media" : "Baja",
    quarter: QUARTERS[i % 4],
    status: i === 0 ? "en-curso" : i === 1 ? "completado" : "pendiente",
    progressPercent: i === 0 ? 45 : i === 1 ? 100 : 0,
    suggestedByAtlas: true,
  }));
  return {
    id: `p-${emp.id}`, employeeId: emp.id, items,
    status: emp.id === "u-4" || emp.id === "u-6" ? "en-curso" :
            emp.id === "u-7" ? "pendiente-aprobacion" : "aprobado",
    createdAt: daysAgo(15),
    approvedAt: daysAgo(10), approvedBy: "Ana Pérez",
  };
}

export const plans: TrainingPlan[] = employees
  .map(planFor)
  .filter((p): p is TrainingPlan => !!p);

export const transitions: SeniorityTransition[] = [
  {
    id: "t-1", employeeId: "u-2", fromSeniority: "Senior", toSeniority: "Tech Lead",
    initiatedBy: "u-1", initiatedByRole: "ld_admin", date: daysAgo(7),
    stage: "revision-ld", requiresCeoException: false,
    readinessPercentage: 78,
    dimensionScores: {
      "Autonomía": "demostrada", "Scope de impacto": "en-desarrollo",
      "Mentoring": "demostrada", "Ownership": "demostrada",
      "Comunicación con stakeholders": "referente",
    },
    requirementsFulfilled: { "Mentoring formal a 2+ personas": true, "Liderazgo de proyecto end-to-end": true, "Code review continuo": true },
    dictamen: "en-camino",
    executiveSummary: "Valentina demuestra liderazgo técnico sólido, con oportunidades en scope estratégico.",
  },
  {
    id: "t-2", employeeId: "u-4", fromSeniority: "Semi-Senior", toSeniority: "Senior",
    initiatedBy: "u-3", initiatedByRole: "leader", date: daysAgo(2),
    stage: "requisitos", requiresCeoException: false,
    readinessPercentage: 0,
    dimensionScores: {
      "Autonomía": "en-desarrollo", "Scope de impacto": "en-desarrollo",
      "Mentoring": "no-evidenciada", "Ownership": "en-desarrollo",
      "Comunicación con stakeholders": "en-desarrollo",
    },
    requirementsFulfilled: { "Diseño de feature completa": false, "Documentación técnica de un componente clave": false },
    executiveSummary: "Pendiente validación de requisitos excluyentes por parte del líder.",
  },
];

const cvFor = (emp: Employee): EmployeeCV => ({
  employeeId: emp.id,
  englishLevel: emp.seniority === "Trainee" ? "Intermedio" : "Avanzado",
  experience: [
    { company: "ATLAS", role: emp.role, from: emp.joinDate.slice(0, 7), description: `Desempeño como ${emp.role}.`, includeInCV: true },
    { company: "Empresa anterior", role: "Desarrollador", from: "2018-01", to: emp.joinDate.slice(0, 7), description: "Experiencia previa relevante.", includeInCV: true },
  ],
  education: [{ institution: "Universidad", degree: "Ingeniería en Sistemas", year: "2018", includeInCV: true }],
  certifications: [{ name: "Scrum Foundation", issuer: "Scrum.org", year: "2022", includeInCV: true }],
  includeCompetencies: true, includeTrainings: true, anonymous: false,
});

export const cvs: EmployeeCV[] = employees.map(cvFor);

export const notifications: Notification[] = [
  { id: "n-1", userId: "u-1", type: "plan", title: "Plan pendiente", message: "El plan de Sebastián Torres espera tu aprobación.", read: false, createdAt: daysAgo(1), link: "/ld-admin" },
  { id: "n-2", userId: "u-1", type: "transition", title: "Transición en revisión L&D", message: "Valentina López — Senior → Tech Lead", read: false, createdAt: daysAgo(2), link: "/transiciones" },
  { id: "n-3", userId: "u-3", type: "course", title: "Solicitud de curso", message: "Martina solicitó: SQL Avanzado y Optimización", read: false, createdAt: daysAgo(1), link: "/catalogo" },
  { id: "n-4", userId: "u-4", type: "assessment", title: "Recordatorio", message: "Completá tu autoevaluación trimestral.", read: false, createdAt: daysAgo(3), link: "/mi-perfil" },
];

export const courseRequests: CourseRequest[] = [
  { id: "cr-1", employeeId: "u-4", courseId: "c-6", requestedAt: daysAgo(1), status: "pendiente" },
];

export const transitionRequirements = [
  { id: "tr-1", fromSeniority: "Senior" as Seniority, toSeniority: "Tech Lead" as Seniority,
    mandatoryItems: ["Mentoring formal a 2+ personas", "Liderazgo de proyecto end-to-end", "Code review continuo"],
    recommendedItems: ["Charla técnica interna", "Participación en arquitectura"] },
  { id: "tr-2", fromSeniority: "Semi-Senior" as Seniority, toSeniority: "Senior" as Seniority,
    mandatoryItems: ["Diseño de feature completa", "Documentación técnica de un componente clave"],
    recommendedItems: ["Mentoring informal", "Refactor mayor con impacto"] },
];
