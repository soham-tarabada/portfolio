export const diagrams = {
  "dr-jones": {
    summary:
      "Two front ends, one authenticated edge, and a refill engine that four schedulers drive on a clock.",
    layers: [
      {
        label: "Clients",
        note: "5 roles with dynamic sub-roles",
        nodes: [
          { id: "patient", label: "Patient portal", note: "React · RTK Query" },
          { id: "staff", label: "Staff console", note: "React · Ant Design" },
        ],
      },
      {
        label: "Access",
        via: "OTP · rate limited",
        nodes: [
          { id: "jwt", label: "JWT access + refresh", note: "session + lockout" },
          { id: "guard", label: "Role guard + audit log", note: "per-module rights" },
        ],
      },
      {
        label: "Runtime",
        note: "349 endpoints across 45 route modules",
        nodes: [
          { id: "api", label: "Express" },
          { id: "cron", label: "4 cron schedulers", note: "SchedulerLock" },
        ],
      },
      {
        label: "Domain",
        nodes: [
          { id: "refill", label: "Refill engine" },
          { id: "payments", label: "Payments + settlement" },
          { id: "invoices", label: "Invoices", note: "PDFKit · CSV" },
        ],
      },
      {
        label: "Data",
        nodes: [
          { id: "mongo", label: "MongoDB", note: "50 models" },
          { id: "stripe", label: "Stripe", note: "idempotent webhooks" },
          { id: "smtp", label: "SMTP email", note: "templated" },
          { id: "axiom", label: "Axiom logs", note: "Winston" },
        ],
      },
    ],
    notes: [
      "Stripe events are de-duplicated against a ProcessedWebhookEvent collection, so payment reconciliation is exactly-once.",
      "Refill, payments, identity and reporting schedulers coordinate through a SchedulerLock so only one instance runs a tick.",
      "A refill order is only raised once a physician approves it through a single-use token.",
    ],
  },

  "tata-advanced-systems": {
    summary:
      "Two systems behind one login model: a document automation pipeline and a video-recorded inspection desk.",
    layers: [
      {
        label: "Clients",
        note: "React · Ant Design · ApexCharts · DataTables",
        nodes: [
          { id: "console", label: "Automation UI", note: "dashboards" },
          { id: "station", label: "Quality station", note: "video inspection" },
        ],
      },
      {
        label: "Access",
        via: "JWT access + refresh",
        nodes: [{ id: "rbac", label: "Role + permission guard", note: "audit trail" }],
      },
      {
        label: "Services",
        nodes: [
          { id: "autoapi", label: "Automation API", note: "5 route modules" },
          { id: "qualityapi", label: "Quality API", note: "6 route modules" },
        ],
      },
      {
        label: "Work",
        nodes: [
          { id: "engine", label: "Processing engine", note: "WebSocket progress" },
          { id: "recorder", label: "Recording server", note: "HTTP + WebSocket" },
          { id: "dump", label: "Scheduled mongodump" },
        ],
      },
      {
        label: "Data",
        nodes: [
          { id: "mongo", label: "MongoDB", note: "11 models" },
          { id: "store", label: "Report + video store" },
          { id: "smtp", label: "SMTP email" },
        ],
      },
    ],
    notes: [
      "Each sync run records XLS files processed, part numbers found, documents matched and copied, folders created and processing time.",
      "Engineering, manufacturing and summary reports are produced per run and charted on the dashboard.",
      "The dashboard holds a WebSocket to the processing engine and shows status and progress as each run works through the register.",
      "Inspections are keyed to a part number and recorded to video by a separate recording server, controlled over HTTP and watched over a WebSocket.",
    ],
  },

  mav: {
    summary:
      "Three clients on one API, with a notification layer that chases requests nobody accepted.",
    layers: [
      {
        label: "Clients",
        note: "React · Material-UI",
        nodes: [
          { id: "admin", label: "Admin console" },
          { id: "venue", label: "Venue portal" },
          { id: "mobile", label: "Mobile app" },
        ],
      },
      {
        label: "API",
        note: "86 endpoints · 14 models",
        nodes: [{ id: "api", label: "Express + Socket.io" }],
      },
      {
        label: "Notify",
        owned: true,
        via: "node-cron escalation",
        nodes: [
          { id: "whatsapp", label: "WhatsApp templates" },
          { id: "push", label: "Firebase push", note: "FCM" },
          { id: "email", label: "Email", note: "18 templates" },
        ],
      },
      {
        label: "Data",
        nodes: [
          { id: "mongo", label: "MongoDB" },
          { id: "s3", label: "AWS S3", note: "image store" },
          { id: "stripe", label: "Stripe", note: "subscriptions" },
          { id: "excel", label: "Excel exports" },
        ],
      },
    ],
    notes: [
      "I owned the notification and escalation layer end to end.",
      "A cron pass reassigns service requests that no member of staff has accepted.",
      "Staff assignment was refactored from single-venue to multi-venue.",
    ],
  },

  "ip-tutorials": {
    summary:
      "A student platform with live staff chat, a queued reminder worker and Google Calendar behind the mobile app.",
    layers: [
      {
        label: "Clients",
        note: "React · Vite · Flutter",
        nodes: [
          { id: "web", label: "Student + staff web" },
          { id: "mobile", label: "Flutter mobile" },
        ],
      },
      {
        label: "API",
        note: "543 endpoints across 62 route modules",
        nodes: [
          { id: "api", label: "Express" },
          { id: "socket", label: "Socket.io chat", note: "per-room joins" },
        ],
      },
      {
        label: "Async",
        nodes: [
          { id: "queue", label: "BullMQ + Redis", note: "invoice reminders" },
          { id: "cron", label: "node-cron jobs" },
        ],
      },
      {
        label: "Data",
        nodes: [
          { id: "mongo", label: "MongoDB", note: "65 models" },
          { id: "fcm", label: "Firebase push" },
          { id: "gcal", label: "Google Calendar" },
          { id: "export", label: "ExcelJS + CSV" },
        ],
      },
    ],
    notes: [
      "Chat sockets join both a per-user key and a per-room channel, so messages fan out to the right staff only.",
      "Invoice reminders are handed to a BullMQ queue backed by Redis and drained by a separate worker.",
      "Attendance, examinations, results and academic records for 600+ students.",
    ],
  },
};
