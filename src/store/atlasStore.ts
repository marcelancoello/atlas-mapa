import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Employee, Assessment, TrainingPlan, SeniorityTransition,
  Notification, CourseRequest, EmployeeCV, UserRole, SuccessionPlan, SuccessionCandidate,
} from "@/types";
import {
  employees as seedEmployees, assessments as seedAssessments,
  plans as seedPlans, transitions as seedTransitions,
  notifications as seedNotifications, courseRequests as seedRequests,
  cvs as seedCvs, transitionRequirements as seedTR, successionPlans as seedSuccession,
} from "@/data/mockData";
import { competencies as seedComps } from "@/data/seedCompetencies";
import { courses as seedCourses } from "@/data/seedCourses";

interface AtlasState {
  currentUserId: string | null;
  login: (id: string) => void;
  logout: () => void;

  employees: Employee[];
  assessments: Assessment[];
  plans: TrainingPlan[];
  transitions: SeniorityTransition[];
  notifications: Notification[];
  courseRequests: CourseRequest[];
  cvs: EmployeeCV[];
  competencies: typeof seedComps;
  courses: typeof seedCourses;
  transitionRequirements: typeof seedTR;
  successionPlans: SuccessionPlan[];
  createSuccessionPlan: (p: Omit<SuccessionPlan, "id" | "updatedAt" | "successorCandidates"> & { successorCandidates?: SuccessionCandidate[] }) => void;
  addSuccessionCandidate: (planId: string, c: SuccessionCandidate) => void;
  removeSuccessionCandidate: (planId: string, employeeId: string) => void;

  markNotificationRead: (id: string) => void;
  markAllRead: (userId: string) => void;
  approvePlan: (planId: string, approverName: string) => void;
  returnPlan: (planId: string, note: string, returnedBy: string) => void;
  approveTransition: (transitionId: string, approverName: string) => void;
  returnTransition: (transitionId: string, note: string, returnedBy: string) => void;
  approveCourseRequest: (id: string, approverName: string) => void;
  rejectCourseRequest: (id: string, approverName: string) => void;
  requestCourse: (employeeId: string, courseId: string) => void;
  updateCV: (employeeId: string, patch: Partial<EmployeeCV>) => void;
  toggleTrainingItem: (planId: string, itemId: string) => void;
  addEmployee: (e: Employee) => void;
  setTransitionRequirement: (transitionId: string, key: string, value: boolean) => void;
  advanceTransitionStage: (transitionId: string) => void;
  requestCeoException: (transitionId: string) => void;
}

// helper to compute next stage in normal flow
const NEXT_STAGE: Record<string, SeniorityTransition["stage"]> = {
  "requisitos": "evaluacion",
  "evaluacion": "revision-ld",
  "revision-ld": "aprobacion-manager",
  "aprobacion-manager": "aprobado",
  "excepcion-ceo": "evaluacion",
};


export const useAtlas = create<AtlasState>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      login: (id) => set({ currentUserId: id }),
      logout: () => set({ currentUserId: null }),

      employees: seedEmployees,
      assessments: seedAssessments,
      plans: seedPlans,
      transitions: seedTransitions,
      notifications: seedNotifications,
      courseRequests: seedRequests,
      cvs: seedCvs,
      competencies: seedComps,
      courses: seedCourses,
      transitionRequirements: seedTR,
      successionPlans: seedSuccession,
      createSuccessionPlan: (p) => set({
        successionPlans: [...get().successionPlans, {
          ...p, id: `sp-${Date.now()}`, updatedAt: new Date().toISOString(),
          successorCandidates: p.successorCandidates ?? [],
        }],
      }),
      addSuccessionCandidate: (planId, c) => set({
        successionPlans: get().successionPlans.map((sp) => sp.id !== planId ? sp : {
          ...sp,
          successorCandidates: [...sp.successorCandidates.filter((x) => x.employeeId !== c.employeeId), c],
          updatedAt: new Date().toISOString(),
        }),
      }),
      removeSuccessionCandidate: (planId, employeeId) => set({
        successionPlans: get().successionPlans.map((sp) => sp.id !== planId ? sp : {
          ...sp,
          successorCandidates: sp.successorCandidates.filter((x) => x.employeeId !== employeeId),
          updatedAt: new Date().toISOString(),
        }),
      }),

      markNotificationRead: (id) =>
        set({ notifications: get().notifications.map((n) => n.id === id ? { ...n, read: true } : n) }),
      markAllRead: (userId) =>
        set({ notifications: get().notifications.map((n) => n.userId === userId ? { ...n, read: true } : n) }),
      approvePlan: (planId, approverName) => {
        const plan = get().plans.find((p) => p.id === planId);
        const now = new Date().toISOString();
        set({
          plans: get().plans.map((p) => p.id === planId
            ? { ...p, status: "aprobado", approvedAt: now, approvedBy: approverName }
            : p),
          notifications: plan ? [...get().notifications, {
            id: `n-${Date.now()}`, userId: plan.employeeId, type: "plan-aprobado",
            title: "Plan de formación aprobado",
            message: `Tu plan fue aprobado por ${approverName}.`,
            read: false, createdAt: now, link: "/mi-perfil",
          }] : get().notifications,
        });
      },
      returnPlan: (planId, note, returnedBy) => {
        const plan = get().plans.find((p) => p.id === planId);
        const emp = plan ? get().employees.find((e) => e.id === plan.employeeId) : null;
        const now = new Date().toISOString();
        const leaderId = emp?.leaderId ?? emp?.managerId;
        set({
          plans: get().plans.map((p) => p.id === planId
            ? { ...p, status: "borrador", notes: note }
            : p),
          notifications: leaderId ? [...get().notifications, {
            id: `n-${Date.now()}`, userId: leaderId, type: "plan-devuelto",
            title: "Plan devuelto para revisión",
            message: `${returnedBy} devolvió el plan de ${emp?.name}: ${note}`,
            read: false, createdAt: now, link: "/planes",
          }] : get().notifications,
        });
      },
      approveTransition: (transitionId, approverName) => {
        const t = get().transitions.find((x) => x.id === transitionId);
        const now = new Date().toISOString();
        set({
          transitions: get().transitions.map((x) => x.id === transitionId
            ? { ...x, stage: "aprobado" } : x),
          notifications: t ? [...get().notifications, {
            id: `n-${Date.now()}`, userId: t.employeeId, type: "transicion-aprobada",
            title: "Transición de seniority aprobada",
            message: `Tu transición ${t.fromSeniority} → ${t.toSeniority} fue aprobada por ${approverName}.`,
            read: false, createdAt: now, link: "/transiciones",
          }] : get().notifications,
        });
      },
      returnTransition: (transitionId, note, returnedBy) => {
        const t = get().transitions.find((x) => x.id === transitionId);
        const emp = t ? get().employees.find((e) => e.id === t.employeeId) : null;
        const leaderId = emp?.leaderId ?? emp?.managerId;
        const now = new Date().toISOString();
        set({
          transitions: get().transitions.map((x) => x.id === transitionId
            ? { ...x, stage: "evaluacion", executiveSummary: note } : x),
          notifications: leaderId ? [...get().notifications, {
            id: `n-${Date.now()}`, userId: leaderId, type: "transicion-devuelta",
            title: "Transición devuelta para revisión",
            message: `${returnedBy} devolvió la transición de ${emp?.name}: ${note}`,
            read: false, createdAt: now, link: "/transiciones",
          }] : get().notifications,
        });
      },
      approveCourseRequest: (id, approverName) => {
        const req = get().courseRequests.find((r) => r.id === id);
        if (!req) return;
        const course = get().courses.find((c) => c.id === req.courseId);
        set({
          courseRequests: get().courseRequests.map((r) => r.id === id ? { ...r, status: "aprobado", approvedBy: approverName, approvedAt: new Date().toISOString() } : r),
          plans: get().plans.map((p) => p.employeeId === req.employeeId && course
            ? { ...p, items: [...p.items, {
                id: `ti-req-${Date.now()}`,
                title: course.title, type: course.type, platform: course.platform,
                durationHours: course.durationHours, competencyIds: course.competencyIds,
                currentLevel: 1, targetLevel: 3, priority: "Media", quarter: "Q4",
                status: "pendiente", requestedByEmployee: true,
              }] }
            : p),
        });
      },
      rejectCourseRequest: (id, approverName) =>
        set({ courseRequests: get().courseRequests.map((r) => r.id === id ? { ...r, status: "rechazado", approvedBy: approverName, approvedAt: new Date().toISOString() } : r) }),
      requestCourse: (employeeId, courseId) =>
        set({ courseRequests: [...get().courseRequests, { id: `cr-${Date.now()}`, employeeId, courseId, requestedAt: new Date().toISOString(), status: "pendiente" }] }),
      updateCV: (employeeId, patch) =>
        set({ cvs: get().cvs.map((c) => c.employeeId === employeeId ? { ...c, ...patch } : c) }),
      toggleTrainingItem: (planId, itemId) =>
        set({
          plans: get().plans.map((p) => p.id !== planId ? p : {
            ...p,
            items: p.items.map((it) => it.id !== itemId ? it : {
              ...it,
              status: it.status === "completado" ? "pendiente" : "completado",
              progressPercent: it.status === "completado" ? 0 : 100,
            }),
          }),
        }),
      addEmployee: (e) => set({ employees: [...get().employees, e] }),
      setTransitionRequirement: (transitionId, key, value) =>
        set({
          transitions: get().transitions.map((t) => t.id !== transitionId ? t : {
            ...t,
            requirementsFulfilled: { ...t.requirementsFulfilled, [key]: value },
          }),
        }),
      advanceTransitionStage: (transitionId) =>
        set({
          transitions: get().transitions.map((t) => {
            if (t.id !== transitionId) return t;
            const next = NEXT_STAGE[t.stage] ?? t.stage;
            return { ...t, stage: next };
          }),
        }),
      requestCeoException: (transitionId) =>
        set({
          transitions: get().transitions.map((t) => t.id !== transitionId ? t : {
            ...t, stage: "excepcion-ceo", requiresCeoException: true,
          }),
        }),
    }),
    {
      name: "atlas-state-v5",
      partialize: (s) => ({
        currentUserId: s.currentUserId,
        plans: s.plans,
        courseRequests: s.courseRequests,
        cvs: s.cvs,
        notifications: s.notifications,
        employees: s.employees,
        transitions: s.transitions,
        successionPlans: s.successionPlans,
      }),
    },
  ),
);

export function useCurrentUser() {
  const { currentUserId, employees } = useAtlas();
  return employees.find((e) => e.id === currentUserId) ?? null;
}

export function visibleEmployees(currentRole: UserRole, currentId: string, all: Employee[]): Employee[] {
  if (currentRole === "ld_admin" || currentRole === "super_admin" || currentRole === "manager") {
    if (currentRole === "manager") {
      const direct = all.filter((e) => e.managerId === currentId);
      const leaders = direct.filter((e) => e.appRole === "leader").map((e) => e.id);
      return all.filter((e) => e.id === currentId || e.managerId === currentId || leaders.includes(e.leaderId ?? ""));
    }
    return all;
  }
  if (currentRole === "leader") {
    return all.filter((e) => e.id === currentId || e.leaderId === currentId);
  }
  return all.filter((e) => e.id === currentId);
}
