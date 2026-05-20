import type { CourseCatalogItem } from "@/types";

export const courses: CourseCatalogItem[] = [
  { id: "c-1", title: "React Avanzado: Hooks y Performance", platform: "Udemy", type: "Externo", domain: "Técnica", stack: "Frontend", durationHours: 24, level: "Avanzado", competencyIds: ["tech-3"], url: "#" },
  { id: "c-2", title: "Microservicios con Spring Boot", platform: "Coursera", type: "Externo", domain: "Técnica", stack: "Backend", durationHours: 32, level: "Avanzado", competencyIds: ["tech-2", "tech-5"], url: "#" },
  { id: "c-3", title: "AWS Solutions Architect Associate", platform: "AWS Skill Builder", type: "Externo", domain: "Técnica", stack: "Cloud", durationHours: 60, level: "Intermedio", competencyIds: ["tech-9"], url: "#" },
  { id: "c-4", title: "Kubernetes desde cero", platform: "Platzi", type: "Externo", domain: "Técnica", stack: "DevOps", durationHours: 20, level: "Intermedio", competencyIds: ["tech-11"], url: "#" },
  { id: "c-5", title: "Cypress E2E Testing", platform: "Egghead", type: "Externo", domain: "Técnica", stack: "QA", durationHours: 12, level: "Intermedio", competencyIds: ["tech-13"], url: "#" },
  { id: "c-6", title: "SQL Avanzado y Optimización", platform: "Interno", type: "Interno", domain: "Técnica", stack: "Data", durationHours: 16, level: "Avanzado", competencyIds: ["tech-7"], url: "#" },
  { id: "c-7", title: "Liderazgo Técnico para Tech Leads", platform: "Interno", type: "Interno", domain: "Soft", durationHours: 20, level: "Avanzado", competencyIds: ["soft-1", "soft-4"], url: "#" },
  { id: "c-8", title: "Comunicación efectiva con stakeholders", platform: "LinkedIn Learning", type: "Externo", domain: "Soft", durationHours: 8, level: "Intermedio", competencyIds: ["soft-6"], url: "#" },
  { id: "c-9", title: "Mentoring y desarrollo de equipos", platform: "Interno", type: "Interno", domain: "Soft", durationHours: 10, level: "Intermedio", competencyIds: ["soft-4", "soft-10"], url: "#" },
  { id: "c-10", title: "OWASP Top 10 práctico", platform: "Pluralsight", type: "Externo", domain: "Técnica", durationHours: 14, level: "Intermedio", competencyIds: ["tech-15"], url: "#" },
  { id: "c-11", title: "Observabilidad con OpenTelemetry", platform: "Interno", type: "Interno", domain: "Técnica", durationHours: 12, level: "Avanzado", competencyIds: ["tech-18"], url: "#" },
  { id: "c-12", title: "Estimación ágil avanzada", platform: "Interno", type: "Interno", domain: "Soft", durationHours: 6, level: "Intermedio", competencyIds: ["tech-20", "soft-8"], url: "#" },
];
