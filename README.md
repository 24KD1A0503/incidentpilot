# IncidentPilot

### AI-powered incident response workspace built with React, TypeScript, and Distri

IncidentPilot is a small AI-native incident response workspace for software teams.

The idea is simple: when an incident happens, the tedious part is often not finding information — it is collecting context, organizing the response, creating follow-up work, coordinating people, and keeping the incident state consistent.

IncidentPilot turns that workflow into an agent-driven process:

**Investigate → Propose → Ask for approval → Execute → Validate → Recover**

The agent can investigate an incident, prepare a response plan, and perform routine coordination through application tools. High-impact execution is deliberately stopped until a human approves the plan.

---

## What I Built

The demo uses a simulated production incident:

**INC-1042 — Payment API experiencing elevated latency**

The incident contains:

- High severity
- 2800 ms latency
- 18.4% error rate
- Database connection pool pressure
- Existing investigation tasks
- An incident timeline

IncidentPilot reads this context and proposes a response plan.

The important part is that **the agent does not immediately execute the plan**.

It stops at:

> Waiting for human approval

The user then explicitly clicks:

> **Approve Plan & Execute**

Only after that approval does the workflow continue.

---

## Demo Workflow

The complete demo follows this sequence:

```text
Incident context
       ↓
Investigate
       ↓
Propose response plan
       ↓
⏸ Human approval
       ↓
Create investigation task
       ↓
Assign Database Team
       ↓
Record incident activity
       ↓
Attempt status change
       ↓
❌ Validation rejects invalid transition
       ↓
Agent corrects the action
       ↓
MITIGATION_IN_PROGRESS
       ↓
Workflow complete
```

The validation failure is intentional.

The demo first attempts to move the incident directly from:

```text
INVESTIGATING → RESOLVED
```

The application rejects this because the incident still has incomplete work.

The agent then responds to the tool error and changes the incident to:

```text
MITIGATION_IN_PROGRESS
```

This demonstrates that the agent must respect the application's validation layer.

---

## Why This Is an Agent Workflow

The important design decision was to treat the AI as a **coordinator**, not as a chatbot.

The agent interacts with the application through explicit tools.

### Tools Available

| Tool | Purpose |
|---|---|
| `get_incident` | Read complete incident context |
| `get_service_status` | Inspect service health and metrics |
| `get_incident_tasks` | Inspect existing response work |
| `create_incident_task` | Create investigation/mitigation work |
| `assign_incident_task` | Assign work to an engineering team |
| `add_incident_timeline_entry` | Record operational activity |
| `update_incident_status` | Change incident state through validation |

The tools are intentionally separated instead of exposing one large `manage_incident` function.

This gives the agent smaller, understandable actions and allows the application to validate each state-changing operation independently.

---

## AI vs Human Boundaries

One of the main design goals was to make the boundary between the agent and the human explicit.

### The Agent Handles

- Reading incident context
- Inspecting service metrics
- Reviewing existing tasks
- Preparing a response plan
- Creating routine investigation work
- Assigning routine tasks
- Recording timeline activity
- Proposing incident status changes
- Responding to tool validation errors

### The Human Handles

- Approving the proposed response plan
- Allowing execution of state-changing actions
- High-impact operational decisions
- Final responsibility for incident resolution

The approval step is therefore not just a UI element. It is an intentional **control boundary** between planning and execution.

---

## Validation and Recovery

IncidentPilot has an application-level validation layer.

For example, the application prevents an incident from being marked `RESOLVED` while required work is still incomplete.

The tool does not silently ignore the request.

Instead, it returns a failure such as:

```text
Validation rejected RESOLVED:
Invalid status transition:
INVESTIGATING → RESOLVED
```

The agent can then use that feedback to choose a valid next action.

This makes the application state authoritative rather than allowing the model to simply claim that an operation succeeded.

---

## Architecture

```text
                    ┌──────────────────┐
                    │      Human       │
                    │  Review / Approve│
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ IncidentPilot UI │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    AI Agent      │
                    │    Coordinator   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Distri Tools    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Validation Layer │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Local React State│
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Updated UI       │
                    └──────────────────┘
```

There is no backend in the demo.

The application state lives locally in React, while the tool layer controls how the agent can interact with that state.

---

## Technology

- React
- TypeScript
- Vite
- Distri
- `@distri/core`
- `@distri/react`
- DistriFnTool
- Local React state
- No backend
- No database
- No authentication

The project intentionally keeps the infrastructure small so the focus stays on the:

**Agent → Tools → Application State**

interaction.

---

## Running Locally

### Requirements

- Node.js
- pnpm

### Install Dependencies

```bash
pnpm install
```

### Start the Application

```bash
pnpm dev
```

Then open:

```text
http://localhost:5173
```

### Production Build

```bash
pnpm build
```

---

## Running the Demo Without an API Key

The main workflow includes a deterministic demo mode, so the project can be demonstrated without depending on an external model response.

This is intentional.

A reviewer should be able to clone the repository and see the complete workflow without first configuring an AI provider.

The same application tool layer is used by the scripted workflow, including:

- Tool execution
- State mutation
- Validation
- Error handling
- Recovery

Distri integration is also included for connecting the application tools to the agent.

---

## Project Structure

```text
incidentpilot/
│
├── agents/
│   └── incidentpilot.md
│
├── src/
│   ├── components/
│   │
│   ├── data/
│   │   └── incidents.ts
│   │
│   ├── demo/
│   │   └── incidentDemo.ts
│   │
│   ├── state/
│   │   └── IncidentContext.tsx
│   │
│   ├── tools/
│   │   ├── incidentTools.ts
│   │   └── validation.ts
│   │
│   ├── types/
│   │   └── incident.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
├── pnpm-lock.yaml
└── README.md
```

### Separation of Responsibilities

#### `agents/`

Defines the agent's role, workflow, safety boundaries, and approval requirement.

#### `tools/`

Defines the functions exposed to the agent and the application's validation rules.

#### `state/`

Owns incident state and the operations that mutate it.

#### `demo/`

Provides a deterministic, API-key-free demonstration of the same tool workflow.

#### `data/`

Contains the simulated incident data used by the demo.

#### `types/`

Defines the domain model for incidents, tasks, metrics, statuses, and timeline entries.

---

## Why the Application Owns Validation

The model should not be the final authority on whether an operation is valid.

For example, the agent may request:

```text
RESOLVED
```

but the application knows whether that transition is actually allowed.

This gives the system a useful separation:

```text
AI decides what it wants to do
            ↓
Application decides whether it is allowed
            ↓
State changes only if validation succeeds
```

This is particularly important for workflows where an incorrect action could have operational consequences.

---

## Human Approval as a Stop Point

The agent is intentionally designed to stop after planning.

The workflow is:

```text
READ
 ↓
ANALYZE
 ↓
PROPOSE
 ↓
STOP
 ↓
HUMAN APPROVES
 ↓
EXECUTE
```

This means the system does not allow the agent to silently move from analysis into operational execution.

The approval button represents an explicit human-in-the-loop boundary.

---

## Tool Design

The tools are intentionally small and focused.

For example:

```text
get_incident
```

only reads incident context.

```text
create_incident_task
```

only creates a task.

```text
assign_incident_task
```

only assigns a task.

```text
update_incident_status
```

only changes the incident status and is protected by the validation layer.

This makes each operation:

- Easier for the agent to understand
- Easier for the application to validate
- Easier to audit
- Easier to test
- Easier to extend later

---

## Incident State Machine

The demo uses controlled incident status transitions:

```text
OPEN
  ↓
INVESTIGATING
  ↓
MITIGATION_IN_PROGRESS
  ↓
MONITORING
  ↓
RESOLVED
```

Invalid transitions are rejected by the application.

For example:

```text
INVESTIGATING → RESOLVED
```

is rejected.

The agent must respond to the validation result instead of assuming the operation succeeded.

---

## Example Demo Result

After executing the approved workflow, the UI shows:

```text
Human approved IncidentPilot's response plan.

[assign_incident_task]
Assigned task to Database Team.

[update_incident_status]
Validation rejected RESOLVED:
Invalid status transition:
INVESTIGATING → RESOLVED.

[update_incident_status]
Corrected incident status to:
MITIGATION_IN_PROGRESS.

IncidentPilot completed the approved response workflow.
```

The incident workspace is updated at each stage rather than only displaying a final text response.

---

## What Makes the Demo Useful

The project focuses on a task that involves multiple small operational actions rather than a simple question-and-answer interaction.

Instead of:

```text
User → AI → Text response
```

the workflow is:

```text
User
 ↓
AI Agent
 ↓
Application Tools
 ↓
Validation
 ↓
State Mutation
 ↓
Updated Workspace
```

The result is visible directly in the incident workspace.

---

## What I Would Build Next

If this were moved beyond the prototype, I would extend it in a few directions.

### 1. Real Observability Integrations

Connect the tools to real systems such as:

- Monitoring platforms
- Log systems
- Deployment history
- Incident management platforms

The current simulated data could then be replaced with real incident context.

### 2. Persistent Incident Workspace

Move the local state to a persistence layer so incident timelines and tasks survive page reloads and can be shared between responders.

### 3. More Granular Approval Policies

Not every action needs the same level of approval.

For example:

```text
Read metrics
    ↓
Automatic

Create investigation task
    ↓
Automatic / configurable

Assign routine task
    ↓
Configurable

Change incident status
    ↓
Human approval

Resolve incident
    ↓
Explicit human approval
```

### 4. Better Recovery Strategies

Instead of handling only one validation failure, the agent could reason about multiple possible recovery paths and explain why it selected one.

### 5. Auditability

Every tool invocation could include:

- Who or what initiated it
- Tool name
- Input
- Result
- Validation outcome
- Timestamp

This would make the system more useful for real operational environments.

---

## Design Principle

The main principle behind IncidentPilot is:

> **Let the AI coordinate the work, but keep the application and the human in control of consequential actions.**

The goal isn't to build another chat interface for incident management.

It is to make the agent **operate the workspace through explicit, validated tools**, while giving the human a clear point to review and approve what will happen next.

---

## Demo Scenario

### Incident

**INC-1042 — Payment API elevated latency**

### Initial State

```text
Severity: HIGH
Status: INVESTIGATING
Latency: 2800 ms
Error Rate: 18.4%
```

### Agent Plan

```text
1. Inspect Payment API incident signals
2. Prepare database investigation task
3. Assign mitigation work to the Database Team
4. Record the response decision in the incident timeline
5. Move the incident into mitigation
```

### Human Action

```text
Approve Plan & Execute
```

### Agent Execution

```text
Create investigation task
        ↓
Assign Database Team
        ↓
Record approval
        ↓
Attempt RESOLVED
```

### Application Validation

```text
❌ INVESTIGATING → RESOLVED

Rejected by application validation.
```

### Agent Recovery

```text
MITIGATION_IN_PROGRESS
```

### Final Result

```text
Workflow completed successfully.
```

---

## Final Takeaway

IncidentPilot demonstrates a practical pattern for AI-native applications:

**The agent plans and coordinates.**

**The tools perform concrete actions.**

**The application validates those actions.**

**The human approves consequential execution.**

The goal isn't to build another chat interface for incident management.

It is to make the agent **operate the workspace through explicit, validated tools**, while giving the human a clear point to review and approve what will happen next.
