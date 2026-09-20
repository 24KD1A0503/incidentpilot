import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { initialIncidents } from "../data/incidents";

import type {
  Incident,
  IncidentTask,
  TimelineEntry,
  IncidentStatus,
} from "../types/incident";

import {
  validateStatusTransition,
  validateTaskTitle,
  validateTeam,
} from "../tools/validation";

interface IncidentContextValue {
  incidents: Incident[];

  getIncident: (
    incidentId: string,
  ) => Incident;

  createTask: (
    incidentId: string,
    title: string,
    priority: IncidentTask["priority"],
  ) => IncidentTask;

  assignTask: (
    taskId: string,
    team: string,
  ) => IncidentTask;

  addTimelineEntry: (
    incidentId: string,
    message: string,
    type: TimelineEntry["type"],
  ) => TimelineEntry;

  updateStatus: (
    incidentId: string,
    status: IncidentStatus,
  ) => Incident;
}

const IncidentContext =
  createContext<IncidentContextValue | null>(null);

export function IncidentProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [incidents, setIncidents] =
    useState<Incident[]>(initialIncidents);

  /*
   * React state updates are asynchronous.
   *
   * The ref gives our application tools an immediately
   * synchronized view of the latest state so that sequential
   * tool calls can safely depend on one another.
   */
  const incidentsRef =
    useRef<Incident[]>(initialIncidents);

  const commit = (
    nextIncidents: Incident[],
  ) => {
    incidentsRef.current = nextIncidents;
    setIncidents(nextIncidents);
  };

  const getIncident = (
    incidentId: string,
  ): Incident => {
    const incident =
      incidentsRef.current.find(
        (item) => item.id === incidentId,
      );

    if (!incident) {
      throw new Error(
        `Incident "${incidentId}" was not found.`,
      );
    }

    return incident;
  };

  const createTask = (
    incidentId: string,
    title: string,
    priority: IncidentTask["priority"],
  ): IncidentTask => {
    validateTaskTitle(title);

    const current =
      incidentsRef.current;

    const incident =
      current.find(
        (item) => item.id === incidentId,
      );

    if (!incident) {
      throw new Error(
        `Incident "${incidentId}" was not found.`,
      );
    }

    const task: IncidentTask = {
      id: `TASK-${Date.now()}`,
      title: title.trim(),
      priority,
      status: "TODO",
    };

    const nextIncidents =
      current.map((item) =>
        item.id === incidentId
          ? {
              ...item,
              tasks: [
                ...item.tasks,
                task,
              ],
            }
          : item,
      );

    commit(nextIncidents);

    return task;
  };

  const assignTask = (
    taskId: string,
    team: string,
  ): IncidentTask => {
    validateTeam(team);

    const current =
      incidentsRef.current;

    let existingTask:
      | IncidentTask
      | undefined;

    for (const incident of current) {
      const task =
        incident.tasks.find(
          (item) => item.id === taskId,
        );

      if (task) {
        existingTask = task;
        break;
      }
    }

    if (!existingTask) {
      throw new Error(
        `Task "${taskId}" was not found.`,
      );
    }

    const updatedTask: IncidentTask = {
      ...existingTask,
      assignedTeam: team,
    };

    const nextIncidents =
      current.map((incident) => ({
        ...incident,
        tasks: incident.tasks.map(
          (task) =>
            task.id === taskId
              ? updatedTask
              : task,
        ),
      }));

    commit(nextIncidents);

    return updatedTask;
  };

  const addTimelineEntry = (
    incidentId: string,
    message: string,
    type: TimelineEntry["type"],
  ): TimelineEntry => {
    if (!message.trim()) {
      throw new Error(
        "Timeline message cannot be empty.",
      );
    }

    const current =
      incidentsRef.current;

    const incident =
      current.find(
        (item) => item.id === incidentId,
      );

    if (!incident) {
      throw new Error(
        `Incident "${incidentId}" was not found.`,
      );
    }

    const entry: TimelineEntry = {
      id: `TL-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`,

      timestamp:
        new Date().toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          },
        ),

      message: message.trim(),
      type,
    };

    const nextIncidents =
      current.map((item) =>
        item.id === incidentId
          ? {
              ...item,
              timeline: [
                ...item.timeline,
                entry,
              ],
            }
          : item,
      );

    commit(nextIncidents);

    return entry;
  };

  const updateStatus = (
    incidentId: string,
    status: IncidentStatus,
  ): Incident => {
    const current =
      incidentsRef.current;

    const incident =
      current.find(
        (item) => item.id === incidentId,
      );

    if (!incident) {
      throw new Error(
        `Incident "${incidentId}" was not found.`,
      );
    }

    validateStatusTransition(
      incident,
      status,
    );

    const updatedIncident: Incident = {
      ...incident,
      status,
    };

    const nextIncidents =
      current.map((item) =>
        item.id === incidentId
          ? updatedIncident
          : item,
      );

    commit(nextIncidents);

    return updatedIncident;
  };

  const value = useMemo(
    () => ({
      incidents,
      getIncident,
      createTask,
      assignTask,
      addTimelineEntry,
      updateStatus,
    }),
    [incidents],
  );

  return (
    <IncidentContext.Provider
      value={value}
    >
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncidents() {
  const context =
    useContext(IncidentContext);

  if (!context) {
    throw new Error(
      "useIncidents must be used inside IncidentProvider.",
    );
  }

  return context;
}