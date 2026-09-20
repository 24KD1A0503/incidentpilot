import type { DistriFnTool } from "@distri/core";

import type {
  Incident,
  IncidentStatus,
  IncidentTask,
  TimelineEntry,
} from "../types/incident";

interface IncidentActions {
  getIncident: (incidentId: string) => Incident;

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

  getIncidents: () => Incident[];
}

function toolError(error: unknown) {
  return {
    success: false,
    error:
      error instanceof Error
        ? error.message
        : "The requested operation was rejected.",
  };
}

function toolSuccess<T>(data: T) {
  return {
    success: true,
    data,
  };
}

export function createIncidentTools(
  actions: IncidentActions,
): DistriFnTool[] {
  return [
    {
      name: "get_incident",
      type: "function",

      description:
        "Get complete details about a software incident, including severity, status, service metrics, recent events, tasks, and timeline.",

      parameters: {
        type: "object",
        properties: {
          incidentId: {
            type: "string",
            description:
              "The incident identifier, for example INC-1042.",
          },
        },
        required: ["incidentId"],
      },

      handler: async ({ incidentId }) => {
        try {
          return toolSuccess(
            actions.getIncident(incidentId),
          );
        } catch (error) {
          return toolError(error);
        }
      },
    },

    {
      name: "get_service_status",
      type: "function",

      description:
        "Read the current health metrics for the service associated with an incident.",

      parameters: {
        type: "object",
        properties: {
          incidentId: {
            type: "string",
            description:
              "The incident whose service health should be checked.",
          },
        },
        required: ["incidentId"],
      },

      handler: async ({ incidentId }) => {
        try {
          const incident =
            actions.getIncident(incidentId);

          return toolSuccess({
            service: incident.service,
            status: incident.status,
            metrics: incident.metrics,
          });
        } catch (error) {
          return toolError(error);
        }
      },
    },

    {
      name: "get_incident_tasks",
      type: "function",

      description:
        "List all tasks associated with an incident and their current status.",

      parameters: {
        type: "object",
        properties: {
          incidentId: {
            type: "string",
            description:
              "The incident identifier.",
          },
        },
        required: ["incidentId"],
      },

      handler: async ({ incidentId }) => {
        try {
          const incident =
            actions.getIncident(incidentId);

          return toolSuccess({
            incidentId,
            tasks: incident.tasks,
          });
        } catch (error) {
          return toolError(error);
        }
      },
    },

    {
      name: "create_incident_task",
      type: "function",

      description:
        "Create a response or investigation task for an incident. Invalid task titles are rejected by the application.",

      parameters: {
        type: "object",
        properties: {
          incidentId: {
            type: "string",
            description:
              "Incident identifier.",
          },

          title: {
            type: "string",
            description:
              "Clear description of the investigation or mitigation task.",
          },

          priority: {
            type: "string",
            enum: ["LOW", "MEDIUM", "HIGH"],
            description: "Task priority.",
          },
        },

        required: [
          "incidentId",
          "title",
          "priority",
        ],
      },

      handler: async ({
        incidentId,
        title,
        priority,
      }) => {
        try {
          const task =
            actions.createTask(
              incidentId,
              title,
              priority,
            );

          return toolSuccess(task);
        } catch (error) {
          return toolError(error);
        }
      },
    },

    {
      name: "assign_incident_task",
      type: "function",

      description:
        "Assign an existing incident task to a valid engineering team. Invalid teams or task IDs are rejected by the application.",

      parameters: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description:
              "Task identifier.",
          },

          team: {
            type: "string",
            enum: [
              "Backend Team",
              "Platform Team",
              "Database Team",
              "Frontend Team",
            ],
            description:
              "Engineering team responsible for the task.",
          },
        },

        required: ["taskId", "team"],
      },

      handler: async ({
        taskId,
        team,
      }) => {
        try {
          const task =
            actions.assignTask(
              taskId,
              team,
            );

          return toolSuccess(task);
        } catch (error) {
          return toolError(error);
        }
      },
    },

    {
      name: "add_incident_timeline_entry",
      type: "function",

      description:
        "Add a concise operational event to an incident's timeline.",

      parameters: {
        type: "object",
        properties: {
          incidentId: {
            type: "string",
            description:
              "Incident identifier.",
          },

          message: {
            type: "string",
            description:
              "Timeline event description.",
          },

          type: {
            type: "string",
            enum: [
              "INFO",
              "ACTION",
              "SUCCESS",
              "ERROR",
              "APPROVAL",
            ],
            description:
              "Timeline event type.",
          },
        },

        required: [
          "incidentId",
          "message",
          "type",
        ],
      },

      handler: async ({
        incidentId,
        message,
        type,
      }) => {
        try {
          const entry =
            actions.addTimelineEntry(
              incidentId,
              message,
              type,
            );

          return toolSuccess(entry);
        } catch (error) {
          return toolError(error);
        }
      },
    },

    {
      name: "update_incident_status",
      type: "function",

      description:
        "Change an incident's status. The application validates whether the transition is allowed. Invalid transitions, including resolving an incident with incomplete tasks, are rejected and returned to the agent as an error.",

      parameters: {
        type: "object",
        properties: {
          incidentId: {
            type: "string",
            description:
              "Incident identifier.",
          },

          status: {
            type: "string",
            enum: [
              "OPEN",
              "INVESTIGATING",
              "MITIGATION_IN_PROGRESS",
              "MONITORING",
              "RESOLVED",
            ],
            description:
              "The desired incident status.",
          },
        },

        required: [
          "incidentId",
          "status",
        ],
      },

      handler: async ({
        incidentId,
        status,
      }) => {
        try {
          const incident =
            actions.updateStatus(
              incidentId,
              status,
            );

          return toolSuccess(incident);
        } catch (error) {
          return toolError(error);
        }
      },
    },
  ];
}