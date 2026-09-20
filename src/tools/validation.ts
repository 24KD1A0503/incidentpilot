import type { Incident, IncidentStatus } from "../types/incident";

const validTransitions: Record<
  IncidentStatus,
  IncidentStatus[]
> = {
  OPEN: ["INVESTIGATING"],
  INVESTIGATING: ["MITIGATION_IN_PROGRESS"],
  MITIGATION_IN_PROGRESS: ["MONITORING"],
  MONITORING: ["RESOLVED"],
  RESOLVED: [],
};

export function validateStatusTransition(
  incident: Incident,
  nextStatus: IncidentStatus,
): void {
  if (incident.status === nextStatus) {
    throw new Error(
      `Incident is already in ${nextStatus}.`,
    );
  }

  if (!validTransitions[incident.status].includes(nextStatus)) {
    throw new Error(
      `Invalid status transition: ${incident.status} → ${nextStatus}.`,
    );
  }

  if (
    nextStatus === "RESOLVED" &&
    incident.tasks.some((task) => task.status !== "COMPLETED")
  ) {
    throw new Error(
      "Incident cannot be resolved while mitigation tasks remain incomplete.",
    );
  }
}

export function validateTaskTitle(title: string): void {
  if (!title.trim()) {
    throw new Error("Task title cannot be empty.");
  }

  if (title.trim().length < 5) {
    throw new Error(
      "Task title must contain at least 5 characters.",
    );
  }
}

export function validateTeam(team: string): void {
  const allowedTeams = [
    "Backend Team",
    "Platform Team",
    "Database Team",
    "Frontend Team",
  ];

  if (!allowedTeams.includes(team)) {
    throw new Error(
      `Unknown team "${team}".`,
    );
  }
}