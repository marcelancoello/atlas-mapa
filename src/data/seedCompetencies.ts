import type { Competency, Seniority, CompetencyLevel } from "@/types";

const lvl = (
  t: CompetencyLevel, j: CompetencyLevel, ss: CompetencyLevel, s: CompetencyLevel,
  tl: CompetencyLevel, a: CompetencyLevel, m: CompetencyLevel, d: CompetencyLevel
): Record<Seniority, CompetencyLevel> => ({
  Trainee: t, Junior: j, "Semi-Senior": ss, Senior: s,
  "Tech Lead": tl, Architect: a, Manager: m, Director: d,
});

const tech: Array<[string, string, string | undefined, string, Record<Seniority, CompetencyLevel>]> = [
  ["Programación orientada a objetos", "POO", undefined, "Principios SOLID, encapsulamiento, herencia y polimorfismo.", lvl(1,2,3,3,4,4,3,3)],
  ["Arquitectura de microservicios", "Microservicios", undefined, "Diseño y comunicación entre microservicios.", lvl(0,1,2,3,4,4,3,3)],
  ["React / componentes y estado", "React", "Frontend", "Componentes, hooks, performance y estado.", lvl(1,2,3,3,4,4,2,2)],
  ["Node.js / APIs REST", "Node", "Backend", "Construcción de APIs con Node.js.", lvl(1,2,3,3,4,4,2,2)],
  ["Java / Spring Boot", "Java", "Backend", "Servicios con Spring Boot.", lvl(0,1,2,3,4,4,2,2)],
  ["Python / scripting", "Python", undefined, "Scripting y automatizaciones.", lvl(1,2,2,3,3,4,2,2)],
  ["SQL y modelado de datos", "SQL", "Data", "Modelado relacional y queries avanzadas.", lvl(1,2,3,3,4,4,3,3)],
  ["NoSQL (MongoDB, Redis)", "NoSQL", "Data", "Bases NoSQL clave-valor y documentales.", lvl(0,1,2,3,3,4,2,2)],
  ["AWS / servicios core", "AWS", "Cloud", "EC2, S3, Lambda, IAM, RDS.", lvl(0,1,2,3,3,4,3,3)],
  ["CI/CD y pipelines", "DevOps", undefined, "Pipelines automatizados.", lvl(0,1,2,3,4,4,3,3)],
  ["Docker y Kubernetes", "Docker", "DevOps", "Contenedores y orquestación.", lvl(0,1,2,3,4,4,2,2)],
  ["Testing unitario e integración", "Testing", undefined, "Test pyramid, coverage.", lvl(1,2,3,3,4,4,3,3)],
  ["QA automatizado (Selenium/Cypress)", "QA", "QA", "Automation E2E.", lvl(0,1,2,3,3,3,2,2)],
  ["Machine Learning básico", "ML", "Data", "Fundamentos de ML supervisado.", lvl(0,0,1,2,2,3,1,1)],
  ["Seguridad en aplicaciones (OWASP)", "Seguridad", undefined, "OWASP Top 10 y mitigaciones.", lvl(0,1,2,3,3,4,3,3)],
  ["Code review y buenas prácticas", "Práctica", undefined, "Reviews efectivas.", lvl(1,2,3,3,4,4,3,3)],
  ["Diseño de APIs", "API", undefined, "REST/GraphQL design.", lvl(0,1,2,3,4,4,3,3)],
  ["Observabilidad y monitoring", "Obs", undefined, "Logs, métricas, trazas.", lvl(0,1,2,3,4,4,3,3)],
  ["Documentación técnica", "Doc", undefined, "Docs claras y útiles.", lvl(1,2,2,3,3,4,3,3)],
  ["Estimación y planificación", "Plan", undefined, "Estimación realista.", lvl(0,1,2,3,4,4,4,4)],
  ["Gestión de deuda técnica", "Deuda", undefined, "Identificación y priorización.", lvl(0,1,2,3,4,4,3,3)],
];

const soft: Array<[string, string, Record<Seniority, CompetencyLevel>]> = [
  ["Visión Estratégica", "Pensar en el largo plazo y el impacto.", lvl(0,1,1,2,3,4,4,4)],
  ["Agentes de Cambio y Agilidad", "Adaptación y promoción del cambio.", lvl(1,2,2,3,3,4,4,4)],
  ["Cuidado para con el Cliente", "Foco en el cliente.", lvl(1,2,2,3,3,4,4,4)],
  ["Cuidado para con el Equipo", "Cuidado de las personas.", lvl(1,2,2,3,4,4,4,4)],
  ["Innovación", "Generar nuevas ideas y soluciones.", lvl(1,1,2,2,3,4,3,4)],
  ["Comunicación Fluida, Clara y Empática", "Comunicación efectiva.", lvl(1,2,2,3,3,4,4,4)],
  ["Compromiso con Valores y Propósito Organizacional", "Vivir los valores.", lvl(1,2,3,3,3,4,4,4)],
  ["Orientación con Calidad a Resultados", "Calidad y entrega.", lvl(1,2,3,3,4,4,4,4)],
  ["Colaboración y Trabajo en Equipo", "Trabajo en equipo.", lvl(1,2,3,3,3,4,4,4)],
  ["Aprendizaje y Desarrollo", "Aprendizaje continuo.", lvl(2,2,3,3,3,4,3,4)],
];

export const competencies: Competency[] = [
  ...tech.map((t, i): Competency => ({
    id: `tech-${i + 1}`,
    name: t[0], domain: "Técnica", stack: t[2], description: t[3],
    expectedLevelBySeniority: t[4],
  })),
  ...soft.map((s, i): Competency => ({
    id: `soft-${i + 1}`,
    name: s[0], domain: "Soft", description: s[1],
    expectedLevelBySeniority: s[2],
  })),
];
