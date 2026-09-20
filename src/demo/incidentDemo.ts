import type { DistriFnTool } from "@distri/core";

import type {
  Incident,
  IncidentTask,
  IncidentStatus,
} from "../types/incident";

export const DEMO_INCIDENT_ID = "INC-1042";

export const demoPlan = [
  "Inspect Payment API incident signals",
  "Prepare database investigation task",
  "Assign mitigation work to the Database Team",
  "Record the response decision in the incident timeline",
  "Move the incident into mitigation",
];

export function getDemoPlan() {
  return {
    incidentId: DEMO_INCIDENT_ID,
    title: "Payment API elevated latency response",
    actions: demoPlan,
  };
}

type ToolResult = {
  success?: boolean;
  data?: unknown;
  error?: string;
};

type DemoTools = DistriFnTool[];

async function callTool(
  tools: DemoTools,
  name: string,
  input: Record<string, unknown>,
): Promise<unknown> {
  const tool = tools.find(
    (item) => item.name === name,
  );

  if (!tool) {
    throw new Error(
      `Tool "${name}" is not registered.`,
    );
  }

  const result = (await tool.handler(
    input,
  )) as ToolResult;

  if (
    result &&
    result.success === false
  ) {
    throw new Error(
      result.error ??
        `Tool "${name}" rejected the request.`,
    );
  }

  return result?.data ?? result;
}

async function callToolAllowError(
  tools: DemoTools,
  name: string,
  input: Record<string, unknown>,
): Promise<ToolResult> {
  const tool = tools.find(
    (item) => item.name === name,
  );

  if (!tool) {
    throw new Error(
      `Tool "${name}" is not registered.`,
    );
  }

  return (await tool.handler(
    input,
  )) as ToolResult;
}

export async function runApprovedDemo(
  tools: DemoTools,
  onStep?: (message: string) => void,
) {
  const step = (message: string) => {
    onStep?.(message);
  };

  // ---------------------------------------------
  // 1. READ INCIDENT
  // ---------------------------------------------

  step(
    "get_incident → Reading incident context...",
  );

  const incident = (await callTool(
    tools,
    "get_incident",
    {
      incidentId: DEMO_INCIDENT_ID,
    },
  )) as Incident;

  if (!incident) {
    throw new Error(
      "Demo incident INC-1042 was not found.",
    );
  }

  // ---------------------------------------------
  // 2. READ SERVICE STATUS
  // ---------------------------------------------

  step(
    "get_service_status → Inspecting service health...",
  );

  await callTool(
    tools,
    "get_service_status",
    {
      incidentId: DEMO_INCIDENT_ID,
    },
  );

  // ---------------------------------------------
  // 3. READ EXISTING TASKS
  // ---------------------------------------------

  step(
    "get_incident_tasks → Inspecting existing work...",
  );

  await callTool(
    tools,
    "get_incident_tasks",
    {
      incidentId: DEMO_INCIDENT_ID,
    },
  );

  // ---------------------------------------------
  // 4. CREATE TASK
  // ---------------------------------------------

  step(
    "create_incident_task → Creating investigation task...",
  );

  const task = (await callTool(
    tools,
    "create_incident_task",
    {
      incidentId: DEMO_INCIDENT_ID,
      title:
        "Review database connection pool saturation",
      priority: "HIGH",
    },
  )) as IncidentTask;

  // ---------------------------------------------
  // 5. RECORD TASK CREATION
  // ---------------------------------------------

  await callTool(
    tools,
    "add_incident_timeline_entry",
    {
      incidentId: DEMO_INCIDENT_ID,
      message:
        `[create_incident_task] Created investigation task ${task.id} for database connection pool saturation.`,
      type: "ACTION",
    },
  );

  // ---------------------------------------------
  // 6. ASSIGN TASK
  // ---------------------------------------------

  step(
    "assign_incident_task → Assigning Database Team...",
  );

  await callTool(
    tools,
    "assign_incident_task",
    {
      taskId: task.id,
      team: "Database Team",
    },
  );

  await callTool(
    tools,
    "add_incident_timeline_entry",
    {
      incidentId: DEMO_INCIDENT_ID,
      message:
        `[assign_incident_task] Assigned ${task.id} to the Database Team.`,
      type: "ACTION",
    },
  );

  // ---------------------------------------------
  // 7. RECORD HUMAN APPROVAL
  // ---------------------------------------------

  step(
    "add_incident_timeline_entry → Recording human approval...",
  );

  await callTool(
    tools,
    "add_incident_timeline_entry",
    {
      incidentId: DEMO_INCIDENT_ID,
      message:
        "Human approved IncidentPilot's response plan.",
      type: "APPROVAL",
    },
  );

  // ---------------------------------------------
  // 8. INTENTIONALLY INVALID STATUS CHANGE
  // ---------------------------------------------

  step(
    "update_incident_status → Validating proposed resolution...",
  );

  const rejected =
    await callToolAllowError(
      tools,
      "update_incident_status",
      {
        incidentId: DEMO_INCIDENT_ID,
        status: "RESOLVED" satisfies IncidentStatus,
      },
    );

  if (
    !rejected ||
    rejected.success !== false
  ) {
    throw new Error(
      "The validation test unexpectedly allowed RESOLVED.",
    );
  }

  // ---------------------------------------------
  // 9. RECORD VALIDATION FAILURE
  // ---------------------------------------------

  await callTool(
    tools,
    "add_incident_timeline_entry",
    {
      incidentId: DEMO_INCIDENT_ID,
      message:
        `[update_incident_status] Validation rejected RESOLVED: ${rejected.error ?? "Invalid status transition."}`,
      type: "ERROR",
    },
  );

  step(
    "Validation rejected RESOLVED — correcting the plan...",
  );

  // ---------------------------------------------
  // 10. CORRECT STATUS
  // ---------------------------------------------

  await callTool(
    tools,
    "update_incident_status",
    {
      incidentId: DEMO_INCIDENT_ID,
      status:
        "MITIGATION_IN_PROGRESS" satisfies IncidentStatus,
    },
  );

  await callTool(
    tools,
    "add_incident_timeline_entry",
    {
      incidentId: DEMO_INCIDENT_ID,
      message:
        "[update_incident_status] Corrected incident status to MITIGATION_IN_PROGRESS.",
      type: "SUCCESS",
    },
  );

  // ---------------------------------------------
  // 11. COMPLETE
  // ---------------------------------------------

  step(
    "Demo completed successfully.",
  );

  await callTool(
    tools,
    "add_incident_timeline_entry",
    {
      incidentId: DEMO_INCIDENT_ID,
      message:
        "IncidentPilot completed the approved response workflow.",
      type: "SUCCESS",
    },
  );
}