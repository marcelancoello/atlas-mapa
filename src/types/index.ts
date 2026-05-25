export type Seniority =
  | "Trainee" | "Junior" | "Semi-Senior" | "Senior"
  | "Tech Lead" | "Architect" | "Manager" | "Director";
export type Domain = "Técnica" | "Soft";
export type CompetencyLevel = 0 | 1 | 2 | 3 | 4;
export type Quarter = "Q1" | "Q2" | "Q3" | "Q4";
export type UserRole = "employee" | "leader" | "manager" | "ld_admin" | "super_admin";
export type Unit = "negocio" | "soporte";

export interface Competency {
  id: string;
  name: string;
  domain: Domain;
  stack?: string;
  description: string;
  expectedLevelBySeniority: Record<Seniority, CompetencyLevel>;
}

export interface CompetencyAssessment {
  competencyId: string;
  selfScore: number;
  managerScore: number;
  peerScore?: number;
  averageScore: number;
  expectedLevel: number;
  gap: number;
  gapSeverity: "none" | "mild" | "moderate" | "critical";
  discrepancy: boolean;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  seniority: Seniority;
  targetSeniority?: Seniority;
  stack: string[];
  joinDate: string;
  avatar?: string;
  managerId?: string;
  leaderId?: string;
  appRole: UserRole;
  unit: Unit;
  status: "onboarding" | "active" | "in-review" | "promoted";
  readinessScore?: number;
}

export interface TrainingItem {
  id: string;
  title: string;
  type: "Interno" | "Externo";
  platform: string;
  durationHours: number;
  competencyIds: string[];
  currentLevel: number;
  targetLevel: number;
  priority: "Alta" | "Media" | "Baja";
  quarter: Quarter;
  status: "pendiente" | "en-curso" | "completado" | "cancelado";
  progressPercent?: number;
  url?: string;
  suggestedByAtlas?: boolean;
  requestedByEmployee?: boolean;
}

export interface TrainingPlan {
  id: string;
  employeeId: string;
  items: TrainingItem[];
  status: "borrador" | "pendiente-aprobacion" | "aprobado" | "en-curso" | "completado";
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  notes?: string;
}

export interface Assessment {
  id: string;
  employeeId: string;
  type: "onboarding" | "periodico" | "promocion";
  date: string;
  competencies: CompetencyAssessment[];
  readinessScore: number;
  managerNotes?: string;
  ldNotes?: string;
  status: "borrador" | "completado";
}

export interface TransitionRequirement {
  id: string;
  fromSeniority: Seniority;
  toSeniority: Seniority;
  mandatoryItems: string[];
  recommendedItems: string[];
}

export interface SeniorityTransition {
  id: string;
  employeeId: string;
  fromSeniority: Seniority;
  toSeniority: Seniority;
  initiatedBy: string;
  initiatedByRole: "leader" | "manager" | "ld_admin";
  date: string;
  stage:
    | "requisitos" | "evaluacion" | "revision-ld"
    | "aprobacion-manager" | "excepcion-ceo" | "aprobado" | "rechazado";
  requiresCeoException: boolean;
  dictamen?: "listo" | "en-camino" | "requiere-desarrollo";
  readinessPercentage: number;
  dimensionScores: Record<string, "no-evidenciada" | "en-desarrollo" | "demostrada" | "referente">;
  closingActions?: string[];
  executiveSummary?: string;
  requirementsFulfilled: Record<string, boolean>;
}

export interface CourseCatalogItem {
  id: string;
  title: string;
  platform: string;
  type: "Interno" | "Externo";
  domain: Domain;
  stack?: string;
  durationHours: number;
  level: "Básico" | "Intermedio" | "Avanzado";
  competencyIds: string[];
  url?: string;
}

export interface CourseRequest {
  id: string;
  employeeId: string;
  courseId: string;
  requestedAt: string;
  status: "pendiente" | "aprobado" | "rechazado";
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface CVExperience {
  company: string; role: string; from: string; to?: string;
  description: string; includeInCV: boolean;
}
export interface CVEducation {
  institution: string; degree: string; year: string; includeInCV: boolean;
}
export interface CVCertification {
  name: string; issuer: string; year: string;
  expiresAt?: string; includeInCV: boolean;
  fileBase64?: string;
  fileType?: "pdf" | "image";
  fileName?: string;
}
export type EducationLevel =
  | "Primario Incompleto" | "Primario Completo"
  | "Secundario Incompleto" | "Secundario Completo"
  | "Terciario Incompleto" | "Terciario Completo"
  | "Universitario Incompleto" | "Universitario Completo"
  | "Posgrado Incompleto" | "Posgrado Completo";

export const COMPANY_TECHNOLOGIES = [
  "React", "Angular", "Vue", "Next.js", "Node.js", "Java", "Spring Boot",
  "Python", "Django", "FastAPI", "Go", "Ruby on Rails", ".NET", "C#",
  "TypeScript", "JavaScript", "PHP", "Kotlin", "Swift",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform",
  "Jenkins", "GitHub Actions", "GitLab CI",
  "GraphQL", "REST", "Kafka", "RabbitMQ",
  "Cypress", "Jest", "Playwright", "Selenium",
] as const;

export type SuccessionReadiness = "Listo ahora" | "Listo en 1 año" | "Listo en 2-3 años";

export interface SuccessionCandidate {
  employeeId: string;
  readinessLevel: SuccessionReadiness;
  readinessPercentage: number;
  strengths: string[];
  developmentAreas: string[];
  hasDevelopmentPlan: boolean;
}

export interface SuccessionPlan {
  id: string;
  targetRoleId: string;
  targetRoleName: string;
  currentHolderId?: string;
  successorCandidates: SuccessionCandidate[];
  notes?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface EmployeeCV {
  employeeId: string;
  englishLevel: "Básico" | "Intermedio" | "Avanzado" | "Bilingüe";
  experience: CVExperience[];
  education: CVEducation[];
  certifications: CVCertification[];
  includeCompetencies: boolean;
  includeTrainings: boolean;
  anonymous: boolean;
}
