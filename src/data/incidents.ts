import type { Incident } from "../types/incident";

export const initialIncidents: Incident[] = [
  {
    id: "INC-1042",
    title: "Payment API experiencing elevated latency",
    description:
      "The Payment API is experiencing increased latency and elevated error rates.",
    severity: "HIGH",
    status: "INVESTIGATING",
    service: "Payment API",

    metrics: {
      errorRate: 18.4,
      latencyMs: 2800,
      dbPoolUtilization: 94,
    },

    recentEvents: [
      "Deployment v2.4.1 completed",
      "Latency spike detected",
      "Database connection pool warning",
    ],

    tasks: [
      {
        id: "TASK-101",
        title: "Check application logs",
        priority: "HIGH",
        status: "COMPLETED",
        assignedTeam: "Backend Team",
      },
      {
        id: "TASK-102",
        title: "Compare recent deployment",
        priority: "HIGH",
        status: "COMPLETED",
        assignedTeam: "Backend Team",
      },
      {
        id: "TASK-103",
        title: "Investigate database connection pool",
        priority: "HIGH",
        status: "TODO",
      },
      {
        id: "TASK-104",
        title: "Prepare mitigation",
        priority: "HIGH",
        status: "TODO",
      },
    ],

    timeline: [
      {
        id: "TL-001",
        timestamp: "09:41",
        message: "Incident detected",
        type: "INFO",
      },
      {
        id: "TL-002",
        timestamp: "09:42",
        message: "Incident moved to investigation",
        type: "ACTION",
      },
    ],
  },

  {
    id: "INC-1041",
    title: "Authentication service elevated error rate",
    description:
      "Authentication requests are returning intermittent 5xx responses.",
    severity: "MEDIUM",
    status: "INVESTIGATING",
    service: "Authentication API",

    metrics: {
      errorRate: 7.2,
      latencyMs: 920,
      dbPoolUtilization: 61,
    },

    recentEvents: [
      "Authentication error spike detected",
      "No recent deployment detected",
    ],

    tasks: [
      {
        id: "TASK-201",
        title: "Inspect authentication logs",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        assignedTeam: "Platform Team",
      },
    ],

    timeline: [
      {
        id: "TL-101",
        timestamp: "10:12",
        message: "Elevated authentication errors detected",
        type: "INFO",
      },
    ],
  },

  {
    id: "INC-1039",
    title: "Search service degradation",
    description:
      "Search responses are slower than the normal service baseline.",
    severity: "LOW",
    status: "MONITORING",
    service: "Search API",

    metrics: {
      errorRate: 1.8,
      latencyMs: 740,
      dbPoolUtilization: 48,
    },

    recentEvents: [
      "Search latency increased",
      "Performance returned toward baseline",
    ],

    tasks: [],

    timeline: [
      {
        id: "TL-201",
        timestamp: "08:32",
        message: "Search degradation detected",
        type: "INFO",
      },
      {
        id: "TL-202",
        timestamp: "09:18",
        message: "Service performance improving",
        type: "SUCCESS",
      },
    ],
  },
];