import { useState } from "react";
import {
  Chat,
  DistriProvider,
  useAgent,
} from "@distri/react";

import {
  IncidentProvider,
  useIncidents,
} from "./state/IncidentContext";

import { createIncidentTools } from "./tools/incidentTools";

import {
  DEMO_INCIDENT_ID,
  getDemoPlan,
  runApprovedDemo,
} from "./demo/incidentDemo";

function IncidentPilot() {
  const {
    incidents,
    getIncident,
    createTask,
    assignTask,
    addTimelineEntry,
    updateStatus,
  } = useIncidents();

  const [threadId] = useState(() => crypto.randomUUID());

  const [approved, setApproved] = useState(false);
  const [planRejected, setPlanRejected] = useState(false);
  const [running, setRunning] = useState(false);
  const [demoStep, setDemoStep] =
    useState("Waiting for approval");
  const [demoComplete, setDemoComplete] =
    useState(false);

  const tools = createIncidentTools({
    getIncident,
    createTask,
    assignTask,
    addTimelineEntry,
    updateStatus,
    getIncidents: () => incidents,
  });

  const { agent } = useAgent({
    agentIdOrDef: "incidentpilot",
  });

  const incident = incidents.find(
    (item) => item.id === DEMO_INCIDENT_ID,
  );

  const plan = getDemoPlan();

  async function handleApproval() {
    if (
      running ||
      demoComplete ||
      planRejected
    ) {
      return;
    }

    setApproved(true);
    setRunning(true);

    try {
      await runApprovedDemo(
        tools,
        setDemoStep,
      );

      setDemoComplete(true);
      setDemoStep(
        "Workflow completed successfully",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Demo execution failed.";

      setDemoStep(message);
    } finally {
      setRunning(false);
    }
  }

  function handleRejectPlan() {
    if (
      running ||
      approved ||
      demoComplete ||
      planRejected
    ) {
      return;
    }

    setPlanRejected(true);

    setDemoStep(
      "Plan rejected by operator. No response actions were executed.",
    );
  }

  function handleReviewPlan() {
    if (
      running ||
      approved ||
      demoComplete
    ) {
      return;
    }

    setPlanRejected(false);

    setDemoStep(
      "Waiting for approval",
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f6fa",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        color: "#172033",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background:
            "linear-gradient(135deg, #101827 0%, #17243a 100%)",
          color: "white",
          padding: "24px 36px",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "13px",
                letterSpacing: "2px",
                opacity: 0.65,
                fontWeight: 700,
              }}
            >
              AI INCIDENT RESPONSE
            </div>

            <h1
              style={{
                margin: "5px 0 0",
                fontSize: "30px",
                color: "#ffffff",
                fontWeight: 800,
                letterSpacing: "-0.8px",
              }}
            >
              IncidentPilot
            </h1>

            <p
              style={{
                margin: "6px 0 0",
                opacity: 0.7,
              }}
            >
              Investigate, plan, approve, and coordinate
              incident response.
            </p>
          </div>

          <div
            style={{
              padding: "8px 13px",
              borderRadius: "999px",
              background:
                "rgba(255,255,255,0.1)",
              fontSize: "13px",
            }}
          >
            Demo Mode • No API key required
          </div>
        </div>
      </header>

      <main
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "28px",
        }}
      >
        {/* INCIDENT + AGENT STATE */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1.15fr 0.85fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <section
            style={{
              background: "white",
              border:
                "1px solid #dfe5ed",
              borderRadius: "16px",
              padding: "24px",
              boxShadow:
                "0 5px 20px rgba(20,30,50,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "14px",
                  color: "#506078",
                }}
              >
                {incident?.id}
              </span>

              <span
                style={{
                  padding: "5px 10px",
                  borderRadius: "999px",
                  background: "#fff1e8",
                  color: "#a54b16",
                  fontWeight: 800,
                  fontSize: "12px",
                }}
              >
                {incident?.severity}
              </span>
            </div>

            <h2
              style={{
                margin: "14px 0 8px",
                fontSize: "24px",
              }}
            >
              {incident?.title}
            </h2>

            <p
              style={{
                color: "#637086",
                lineHeight: 1.6,
                marginBottom: "20px",
              }}
            >
              {incident?.description}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, 1fr)",
                gap: "10px",
              }}
            >
              <Metric
                label="Status"
                value={
                  incident?.status ?? "-"
                }
              />

              <Metric
                label="Latency"
                value={`${incident?.metrics.latencyMs ?? "-"} ms`}
              />

              <Metric
                label="Error rate"
                value={`${incident?.metrics.errorRate ?? "-"}%`}
              />
            </div>
          </section>

          <section
            style={{
              background: "white",
              border:
                "1px solid #dfe5ed",
              borderRadius: "16px",
              padding: "24px",
              boxShadow:
                "0 5px 20px rgba(20,30,50,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#718096",
                    fontWeight: 700,
                    letterSpacing: "1px",
                  }}
                >
                  AGENT STATE
                </div>

                <h2
                  style={{
                    margin: "6px 0",
                    fontSize: "22px",
                  }}
                >
                  {planRejected
                    ? "Plan rejected"
                    : approved
                      ? demoComplete
                        ? "Execution complete"
                        : "Executing approved plan"
                      : "Waiting for human approval"}
                </h2>
              </div>

              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  marginTop: "7px",
                  background:
                    planRejected
                      ? "#ef4444"
                      : demoComplete
                        ? "#22c55e"
                        : approved
                          ? "#f59e0b"
                          : "#3b82f6",
                }}
              />
            </div>

            <p
              style={{
                color: "#637086",
                lineHeight: 1.5,
                marginTop: "18px",
              }}
            >
              {demoStep}
            </p>
          </section>
        </div>

        {/* PLAN + TIMELINE */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: "20px",
          }}
        >
          {/* RESPONSE PLAN */}
          <section
            style={{
              background: "white",
              border:
                "1px solid #dfe5ed",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#718096",
                    fontSize: "12px",
                    fontWeight: 800,
                    letterSpacing: "1px",
                  }}
                >
                  PROPOSED RESPONSE PLAN
                </div>

                <h2
                  style={{
                    margin:
                      "6px 0 0",
                    fontSize: "22px",
                  }}
                >
                  {plan.title}
                </h2>
              </div>

              {!approved &&
                !planRejected && (
                  <span
                    style={{
                      padding:
                        "6px 10px",
                      borderRadius: "8px",
                      background:
                        "#fff7ed",
                      color:
                        "#c2410c",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    APPROVAL REQUIRED
                  </span>
                )}

              {planRejected && (
                <span
                  style={{
                    padding:
                      "6px 10px",
                    borderRadius: "8px",
                    background:
                      "#fee2e2",
                    color:
                      "#b91c1c",
                    fontSize: "12px",
                    fontWeight: 800,
                  }}
                >
                  PLAN REJECTED
                </span>
              )}

              {demoComplete && (
                <span
                  style={{
                    padding:
                      "6px 10px",
                    borderRadius: "8px",
                    background:
                      "#dcfce7",
                    color:
                      "#166534",
                    fontSize: "12px",
                    fontWeight: 800,
                  }}
                >
                  COMPLETED
                </span>
              )}
            </div>

            {plan.actions.map(
              (action, index) => (
                <div
                  key={action}
                  style={{
                    display: "flex",
                    gap: "13px",
                    alignItems:
                      "flex-start",
                    padding:
                      "13px 0",
                    borderBottom:
                      index ===
                      plan.actions.length - 1
                        ? "none"
                        : "1px solid #edf0f4",
                  }}
                >
                  <div
                    style={{
                      width: "27px",
                      height: "27px",
                      borderRadius:
                        "50%",
                      background:
                        approved
                          ? "#e8f7ee"
                          : planRejected
                            ? "#fee2e2"
                            : "#edf4ff",
                      color:
                        approved
                          ? "#16803c"
                          : planRejected
                            ? "#b91c1c"
                            : "#2563eb",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      fontWeight: 800,
                      fontSize: "13px",
                      flexShrink: 0,
                    }}
                  >
                    {approved
                      ? "✓"
                      : planRejected
                        ? "×"
                        : index + 1}
                  </div>

                  <div
                    style={{
                      lineHeight: 1.45,
                      fontSize:
                        "14px",
                    }}
                  >
                    {action}
                  </div>
                </div>
              ),
            )}

            {/* APPROVAL ACTIONS */}
            {!approved &&
              !planRejected && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "10px",
                    marginTop: "20px",
                  }}
                >
                  <button
                    onClick={handleApproval}
                    disabled={running}
                    style={{
                      border:
                        "1px solid #1d4ed8",
                      borderRadius:
                        "10px",
                      padding:
                        "14px 16px",
                      background:
                        running
                          ? "#e2e8f0"
                          : "#2563eb",
                      color:
                        running
                          ? "#64748b"
                          : "#ffffff",
                      fontWeight: 800,
                      fontSize:
                        "14px",
                      cursor:
                        running
                          ? "default"
                          : "pointer",
                      boxShadow:
                        running
                          ? "none"
                          : "0 4px 12px rgba(37, 99, 235, 0.18)",
                    }}
                  >
                    {running
                      ? "Executing..."
                      : "✓ Approve & Execute"}
                  </button>

                  <button
                    onClick={
                      handleRejectPlan
                    }
                    disabled={running}
                    style={{
                      border:
                        "1px solid #fecaca",
                      borderRadius:
                        "10px",
                      padding:
                        "14px 16px",
                      background:
                        "#ffffff",
                      color:
                        "#b91c1c",
                      fontWeight: 800,
                      fontSize:
                        "14px",
                      cursor:
                        running
                          ? "default"
                          : "pointer",
                    }}
                  >
                    ✕ Reject Plan
                  </button>
                </div>
              )}

            {/* REJECTED STATE */}
            {planRejected && (
              <>
                <div
                  style={{
                    marginTop: "20px",
                    padding: "14px",
                    borderRadius: "10px",
                    background: "#fff7ed",
                    border:
                      "1px solid #fed7aa",
                    color: "#9a3412",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                >
                  <strong>
                    No response actions were executed.
                  </strong>
                  <br />
                  The operator rejected the proposed
                  response plan before execution.
                </div>

                <button
                  onClick={
                    handleReviewPlan
                  }
                  style={{
                    width: "100%",
                    marginTop: "12px",
                    border:
                      "1px solid #cbd5e1",
                    borderRadius: "10px",
                    padding:
                      "12px 16px",
                    background:
                      "#ffffff",
                    color:
                      "#334155",
                    fontWeight: 800,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  ↻ Review Plan Again
                </button>
              </>
            )}

            {/* COMPLETED STATE */}
            {demoComplete && (
              <button
                disabled
                style={{
                  width: "100%",
                  marginTop: "20px",
                  border:
                    "1px solid #bbf7d0",
                  borderRadius: "10px",
                  padding:
                    "14px 16px",
                  background:
                    "#dcfce7",
                  color:
                    "#166534",
                  fontWeight: 800,
                  fontSize: "14px",
                }}
              >
                ✓ Plan Executed
              </button>
            )}

            <p
              style={{
                textAlign:
                  "center",
                color:
                  "#7b8798",
                fontSize:
                  "12px",
                margin:
                  "10px 0 0",
              }}
            >
              {planRejected
                ? "Human approval was not granted, so IncidentPilot did not execute the plan."
                : demoComplete
                  ? "The approved plan was executed through the application's validated tool layer."
                  : "Approval required — IncidentPilot will not execute these actions until you approve the plan."}
            </p>
          </section>

          {/* TIMELINE */}
          <section
            style={{
              background: "white",
              border:
                "1px solid #dfe5ed",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <div
              style={{
                color: "#718096",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "1px",
              }}
            >
              LIVE INCIDENT TIMELINE
            </div>

            <h2
              style={{
                margin:
                  "6px 0 18px",
                fontSize: "22px",
              }}
            >
              Tool activity
            </h2>

            <div
              style={{
                maxHeight:
                  "380px",
                overflowY:
                  "auto",
              }}
            >
              {incident?.timeline
                .slice()
                .reverse()
                .map(
                  (entry) => (
                    <div
                      key={
                        entry.id
                      }
                      style={{
                        display:
                          "flex",
                        gap: "12px",
                        padding:
                          "12px 0",
                        borderBottom:
                          "1px solid #edf0f4",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius:
                            "50%",
                          marginTop:
                            "6px",
                          flexShrink: 0,
                          background:
                            entry.type ===
                            "ERROR"
                              ? "#ef4444"
                              : entry.type ===
                                  "SUCCESS"
                                ? "#22c55e"
                                : entry.type ===
                                    "APPROVAL"
                                  ? "#8b5cf6"
                                  : "#3b82f6",
                        }}
                      />

                      <div>
                        <div
                          style={{
                            fontSize:
                              "14px",
                            lineHeight:
                              1.45,
                          }}
                        >
                          {
                            entry.message
                          }
                        </div>

                        <div
                          style={{
                            color:
                              "#94a3b8",
                            fontSize:
                              "11px",
                            marginTop:
                              "4px",
                          }}
                        >
                          {
                            entry.type
                          }
                        </div>
                      </div>
                    </div>
                  ),
                )}
            </div>
          </section>
        </div>

        {/* TASKS */}
        <section
          style={{
            background: "white",
            border:
              "1px solid #dfe5ed",
            borderRadius: "16px",
            padding: "24px",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
            }}
          >
            <div>
              <div
                style={{
                  color: "#718096",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "1px",
                }}
              >
                INCIDENT TASKS
              </div>

              <h2
                style={{
                  margin:
                    "6px 0 0",
                  fontSize: "22px",
                }}
              >
                Response work
              </h2>
            </div>

            <strong>
              {
                incident?.tasks.filter(
                  (task) =>
                    task.status ===
                    "COMPLETED",
                ).length
              }{" "}
              /{" "}
              {incident?.tasks.length}{" "}
              completed
            </strong>
          </div>

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "12px",
              marginTop:
                "18px",
            }}
          >
            {incident?.tasks.map(
              (task) => (
                <div
                  key={task.id}
                  style={{
                    border:
                      "1px solid #e5eaf0",
                    borderRadius:
                      "10px",
                    padding:
                      "14px",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      gap: "10px",
                    }}
                  >
                    <strong
                      style={{
                        fontSize:
                          "13px",
                      }}
                    >
                      {task.id}
                    </strong>

                    <span
                      style={{
                        fontSize:
                          "11px",
                        fontWeight: 800,
                        color:
                          task.status ===
                          "COMPLETED"
                            ? "#16803c"
                            : "#b45309",
                      }}
                    >
                      {
                        task.status
                      }
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop:
                        "8px",
                      fontSize:
                        "14px",
                      lineHeight:
                        1.4,
                    }}
                  >
                    {
                      task.title
                    }
                  </div>

                  {task.assignedTeam && (
                    <div
                      style={{
                        marginTop:
                          "8px",
                        fontSize:
                          "12px",
                        color:
                          "#64748b",
                      }}
                    >
                      Assigned:{" "}
                      {
                        task.assignedTeam
                      }
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </section>

        {/* DISTRI */}
        <section
          style={{
            marginTop: "20px",
            background:
              "#111827",
            color: "white",
            borderRadius:
              "16px",
            padding:
              "20px 24px",
          }}
        >
          <div
            style={{
              fontSize:
                "12px",
              opacity: 0.55,
              letterSpacing:
                "1px",
              fontWeight: 800,
            }}
          >
            DISTRI INTEGRATION
          </div>

          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap: "20px",
              marginTop:
                "8px",
            }}
          >
            <div>
              <strong>
                Distri tools connected
              </strong>

              <div
                style={{
                  marginTop:
                    "4px",
                  fontSize:
                    "13px",
                  opacity: 0.65,
                }}
              >
                7 application tools are
                registered with the Distri
                agent. Demo execution uses
                the same application state
                and validation layer.
              </div>
            </div>

            {demoComplete &&
              agent && (
                <div
                  style={{
                    width:
                      "360px",
                    background:
                      "white",
                    color:
                      "#172033",
                    borderRadius:
                      "10px",
                    overflow:
                      "hidden",
                  }}
                >
                  <Chat
                    agent={agent}
                    threadId={
                      threadId
                    }
                    externalTools={
                      tools
                    }
                  />
                </div>
              )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background:
          "#f7f9fc",
        borderRadius:
          "10px",
        padding:
          "12px",
      }}
    >
      <div
        style={{
          fontSize:
            "11px",
          color:
            "#7b8798",
          fontWeight: 700,
          textTransform:
            "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop:
            "5px",
          fontSize:
            "14px",
          fontWeight: 800,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function App() {
  return (
    <DistriProvider
      config={{
        baseUrl:
          "https://api.distri.dev",

        // IMPORTANT:
        // Put the same Public Client ID that is
        // currently in your existing App.tsx here.
        clientId:
          "dpc_FDeJ8XR9c13kzJPt0L73wEOYWot73rTj",
      }}
    >
      <IncidentProvider>
        <IncidentPilot />
      </IncidentProvider>
    </DistriProvider>
  );
}

export default App;