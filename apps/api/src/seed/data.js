import { diagrams } from "./diagrams.js";

export const profile = {
  singleton: "profile",
  name: "Soham Tarabada",
  roleTitle: "Full Stack Developer",
  tagline: "Production platforms for healthcare, e-commerce and enterprise.",
  summary:
    "Full Stack Developer with 1.5 years of experience delivering production web platforms for healthcare, e-commerce and enterprise clients using the MERN stack, Next.js and TypeScript. Builds multi-portal systems with role-based access control, payment integrations and real-time features, deployed on Docker, Kubernetes and AWS with CI/CD, owning the full software development life cycle (SDLC).",
  about: [
    "I'm a Full Stack Developer at Webbrains Technologies in Vadodara, where I've spent the last year and a half shipping production platforms for healthcare, e-commerce and enterprise clients.",
    "Most of my work is multi-portal systems: role-based access control down to the module level, payment integrations, real-time features, and the operational plumbing that keeps them running — 250+ REST endpoints across five client platforms, and 11 GitHub Actions pipelines deploying to AWS ECS, Lambda and CloudFront.",
    "Lately that includes building with agentic tooling: a multi-agent code automation workflow that chains specialized Claude sub-agents through requirement gathering, planning, execution and QA, carrying a single prompt to reviewed, working code.",
    "I take projects end to end: schema design, the API, the interface, the container, and the pipeline that ships it.",
  ],
  location: "Vadodara, Gujarat, India",
  timezone: "Asia/Kolkata",
  email: "sohamtarabada2003@gmail.com",
  phone: "+91 87995 35382",
  availability: "",
  yearsExperience: 1.5,
  socials: [
    {
      platform: "github",
      label: "GitHub",
      handle: "soham-tarabada",
      url: "https://github.com/soham-tarabada",
      order: 1,
    },
    {
      platform: "linkedin",
      label: "LinkedIn",
      handle: "soham-tarabada",
      url: "https://www.linkedin.com/in/soham-tarabada-51a50020b",
      order: 2,
    },
    {
      platform: "email",
      label: "Email",
      handle: "sohamtarabada2003@gmail.com",
      url: "mailto:sohamtarabada2003@gmail.com",
      order: 3,
    },
    {
      platform: "whatsapp",
      label: "WhatsApp",
      handle: "+91 87995 35382",
      url: "https://wa.me/918799535382",
      order: 4,
    },
    {
      platform: "telegram",
      label: "Telegram",
      handle: "soham9898",
      url: "https://t.me/soham9898",
      order: 5,
    },
    {
      platform: "instagram",
      label: "Instagram",
      handle: "_soham9898",
      url: "https://www.instagram.com/_soham9898/",
      order: 6,
      visible: false,
    },
  ],
};

export const sections = [
  {
    key: "about",
    label: "About",
    filename: "about.md",
    folder: null,
    language: "markdown",
    icon: "markdown",
    order: 1,
    openByDefault: true,
  },
  {
    key: "experience",
    label: "Experience",
    filename: "experience.ts",
    folder: null,
    language: "typescript",
    icon: "typescript",
    order: 2,
  },
  {
    key: "skills",
    label: "Skills",
    filename: "skills.json",
    folder: null,
    language: "json",
    icon: "json",
    order: 3,
  },
  {
    key: "projects",
    label: "Projects",
    filename: "projects",
    folder: null,
    language: "markdown",
    icon: "folder",
    order: 4,
  },
  {
    key: "education",
    label: "Education",
    filename: "education.md",
    folder: null,
    language: "markdown",
    icon: "markdown",
    order: 5,
  },
  {
    key: "uses",
    label: "Uses",
    filename: "uses.md",
    folder: null,
    language: "markdown",
    icon: "markdown",
    order: 6,
  },
  {
    key: "contact",
    label: "Contact",
    filename: "contact.sh",
    folder: null,
    language: "shell",
    icon: "shell",
    order: 7,
  },
];

export const skillCategories = [
  {
    key: "languages",
    name: "Languages",
    order: 1,
    skills: ["JavaScript", "TypeScript", "SQL", "HTML5", "CSS3"].map((name) => ({ name })),
  },
  {
    key: "frontend",
    name: "Frontend",
    order: 2,
    skills: [
      "React.js",
      "Next.js",
      "Redux Toolkit",
      "RTK Query",
      "TanStack Query",
      "Tailwind CSS",
      "Ant Design",
      "Material-UI",
      "Formik",
      "Yup",
    ].map((name) => ({ name })),
  },
  {
    key: "backend",
    name: "Backend",
    order: 3,
    skills: [
      "Node.js",
      "Express.js",
      "REST APIs",
      "JWT Authentication",
      "Socket.io",
      "WebSockets",
      "BullMQ",
      "Mongoose",
    ].map((name) => ({ name })),
  },
  {
    key: "ai-llm",
    name: "AI & LLM",
    order: 4,
    skills: [
      "MCP",
      "Agentic Workflows",
      "Code Automation Using Sub-Agent Teams",
    ].map((name) => ({ name })),
  },
  {
    key: "data-integrations",
    name: "Databases & Integrations",
    order: 5,
    skills: [
      "MongoDB",
      "MySQL",
      "Redis",
      "Stripe",
      "Razorpay",
      "WhatsApp Business API",
      "Firebase",
      "Puppeteer",
      "FFmpeg",
    ].map((name) => ({ name })),
  },
  {
    key: "devops-cloud",
    name: "DevOps & Cloud",
    order: 6,
    skills: [
      "Docker",
      "Kubernetes",
      "AWS ECS",
      "AWS ECR",
      "AWS Lambda",
      "AWS CloudFront",
      "AWS EC2",
      "AWS S3",
      "AWS VPC",
      "AWS IAM",
      "GitHub Actions CI/CD",
      "OIDC",
    ].map((name) => ({ name })),
  },
  {
    key: "testing-tools",
    name: "Testing & Tools",
    order: 7,
    skills: [
      "Jest",
      "Unit & Integration Testing",
      "Git",
      "GitHub",
      "Postman",
      "Vite",
      "Winston",
    ].map((name) => ({ name })),
  },
];

export const experiences = [
  {
    company: "Webbrains Technologies Pvt. Ltd.",
    role: "Full Stack Developer",
    employmentType: "Full-time",
    location: "Vadodara, India",
    startDate: "2025-05",
    endDate: null,
    current: true,
    order: 1,
    tech: ["React.js", "Node.js", "Express.js", "MongoDB", "Docker", "Kubernetes", "AWS"],
    bullets: [
      "Delivered 5 production client platforms across healthcare, e-commerce and enterprise automation using React.js, Node.js, Express.js and MongoDB, serving 3,000+ monthly active users.",
      "Built 250+ RESTful API endpoints with JSON Web Token (JWT) authentication and module-level role-based access control, reducing average API response time by 30%.",
      "Containerized and deployed full-stack applications with Docker and Kubernetes on AWS (EC2, S3, VPC, IAM), cutting deployment time from 20 minutes to under 3.",
      "Built and maintained 11 GitHub Actions CI/CD pipelines deploying 4 services across DEV, UAT and production environments to AWS ECS, Lambda and CloudFront, with OIDC-federated authentication and automated ECS rollback.",
      "Built a multi-agent code automation workflow chaining specialized Claude sub-agents for requirement gathering, planning, execution and QA, taking a single prompt through to reviewed, working code.",
      "Wrote unit and integration tests for API and authentication flows, with Winston structured logging.",
    ],
  },
  {
    company: "Webbrains Technologies Pvt. Ltd.",
    role: "Full Stack Developer Intern",
    employmentType: "Internship",
    location: "Vadodara, India",
    startDate: "2025-01",
    endDate: "2025-04",
    current: false,
    order: 2,
    tech: ["Node.js", "Express.js", "MongoDB"],
    bullets: [
      "Developed RESTful API endpoints with Node.js, Express.js and MongoDB supporting 6 core modules, and resolved 20+ production bugs in a shared codebase in Agile/Scrum sprints alongside a 4-person development team.",
    ],
  },
];

export const projects = [
  {
    slug: "dr-jones",
    diagram: diagrams["dr-jones"],
    filename: "dr-jones.md",
    title: "Dr. Jones",
    subtitle: "Telehealth & E-Pharmacy Platform",
    client: "Confidential (Canada)",
    period: "04/2026 – Present",
    startDate: "2026-04",
    endDate: null,
    current: true,
    featured: true,
    confidential: true,
    order: 1,
    role: "Full Stack Developer",
    summary:
      "A Canadian medical platform covering telehealth consultation, prescription management and e-pharmacy fulfilment, built for five roles with module-level permissions and Stripe subscription billing.",
    tech: [
      "React 19",
      "Redux Toolkit",
      "RTK Query",
      "Tailwind CSS",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Stripe",
      "JWT",
    ],
    bullets: [
      "Engineered a Canadian medical platform for 5 roles with dynamic sub-roles and module-level CRUD permissions across 40 route modules and 40 data models, secured with OTP login, JWT refresh-token rotation and audit logs.",
      "Integrated Stripe subscription billing with idempotent webhook processing for exactly-once payment reconciliation, and automated prescription refill scheduling with token-based physician approval and PDFKit document generation.",
    ],
    dossier: {
      scale: [
        { label: "Data models", value: "49" },
        { label: "API endpoints", value: "349" },
        { label: "Route modules", value: "44" },
        { label: "Services", value: "78" },
        { label: "Permission modules", value: "26" },
        { label: "Roles", value: "6 base roles plus unlimited sub-roles" },
      ],
      modules: [
        "Patients",
        "Doctors",
        "Pharmacists",
        "Employees",
        "Roles and permissions",
        "Intake forms",
        "Treatments",
        "Prescriptions and refills",
        "Orders",
        "Appointments",
        "Medications",
        "Products",
        "Payments and subscriptions",
        "Promotions and promo codes",
        "Reports",
        "Audit logs",
        "Email templates",
        "Landing and checkout CMS",
        "Support",
      ],
      integrations: [
        {
          title: "Stripe",
          detail:
            "Subscription billing, saved cards and a webhook endpoint. Every event id is written to a ProcessedWebhookEvent collection before the event is handled, so a redelivered webhook is a no-op rather than a double charge.",
        },
        {
          title: "Axiom",
          detail:
            "Winston ships structured logs to Axiom through a redaction list, so tokens and card fields never reach a transport.",
        },
        {
          title: "SMTP",
          detail:
            "Transactional email rendered server-side from an editable EmailTemplate collection.",
        },
      ],
      decisions: [
        {
          title: "Permissions are data, not code",
          detail:
            "A Role document carries one row per module with view, create, edit and delete flags across 26 modules. Sub-roles are created under a parent role family, so a new job function is configured in the admin panel rather than deployed.",
        },
        {
          title: "Four schedulers, one winner",
          detail:
            "Refills, payments, reports and notifications each run on their own node-cron schedule. A SchedulerLock lease arbitrates them: acquisition is reap-then-insert so the unique index elects exactly one winner, and a duplicate-key error is read as held elsewhere rather than a fault. Holder identity carries a random suffix so a respawned worker cannot release a lease it never took.",
        },
        {
          title: "Exactly-once payment handling",
          detail:
            "Webhook events are recorded by id before processing, and reconciliation and settlement run as separate passes, so payment state converges even when Stripe retries.",
        },
        {
          title: "One place decides tax",
          detail:
            "Every order resolves its province through a single ladder - shipping address, then billing address, then the patient record - so Canadian provincial tax is never computed two different ways.",
        },
        {
          title: "Refills as a state machine",
          detail:
            "Twenty-seven services cover cadence, plan length and limits, check-ins, physician approval tokens, renewal, reinstatement and end-of-plan, so a prescription plan has an explicit lifecycle rather than scattered conditionals.",
        },
        {
          title: "Documents are generated, not uploaded",
          detail:
            "Consultation, prescription and shipment invoices are produced with PDFKit from order data at request time, with sequential invoice numbering.",
        },
      ],
    },
    links: [],
  },
  {
    slug: "tata-advanced-systems",
    diagram: diagrams["tata-advanced-systems"],
    filename: "tata.md",
    title: "TATA Advanced Systems",
    subtitle: "Engineering Data Automation & Quality Inspection",
    client: "TATA Advanced Systems",
    period: "12/2025 – 03/2026",
    startDate: "2025-12",
    endDate: "2026-03",
    current: false,
    featured: true,
    confidential: true,
    order: 2,
    role: "Lead Developer",
    summary:
      "An engineering document automation and quality-inspection system that replaced a manual two-to-three-day process, secured behind JWT authentication with role and permission based access.",
    tech: [
      "React",
      "Redux Toolkit",
      "Ant Design",
      "Node.js",
      "Express.js",
      "MongoDB",
      "JWT",
      "WebSockets",
      "ApexCharts",
    ],
    bullets: [
      "Automated an engineering document workflow ingesting XLS drawing registers to extract part numbers and copy matched documents into generated folder structures, replacing a manual process that previously took 2-3 days per cycle.",
      "Generated engineering, manufacturing and summary reports with telemetry on an ApexCharts dashboard handling 1,000+ records per run, secured by JWT authentication with role and permission based access control.",
      "Streamed live progress into the dashboard over a WebSocket connection to the processing service, reporting per-run status as files were matched and copied.",
      "Delivered the quality-inspection module as lead developer, recording each inspection against its part number with a pass, fail or reject verdict and video capture driven against a separate recording server over HTTP and WebSocket.",
    ],
    dossier: {
      scale: [
        { label: "Services", value: "2 (data automation, quality inspection)" },
        { label: "Data models", value: "11" },
        { label: "API endpoints", value: "57" },
        { label: "Statistics captured per run", value: "6" },
      ],
      modules: [
        "Document sync",
        "Engineering reports",
        "Manufacturing reports",
        "Summary reports",
        "Quality inspection",
        "Video capture",
        "Dashboard telemetry",
        "Users",
        "Roles and permissions",
      ],
      integrations: [
        {
          title: "Processing engine",
          detail:
            "A separate service performs each sync. The dashboard subscribes to it over a native WebSocket and handles init, status, progress, complete and error messages.",
        },
        {
          title: "Recording server",
          detail:
            "Inspection video capture is started and stopped against a separate recording server over HTTP, with a WebSocket carrying live recording state.",
        },
        {
          title: "SMTP",
          detail:
            "Nodemailer templates for account creation, credential delivery and password reset.",
        },
      ],
      decisions: [
        {
          title: "Every sync run is a record",
          detail:
            "A run is stored as a Sync document with a status of pending, processing, success, failed or partial, plus a statistics block counting XLS files processed, part numbers found, documents matched, documents copied, folders created and issues extracted. A failed run can be read back afterwards instead of being lost.",
        },
        {
          title: "Progress is pushed, not polled",
          detail:
            "The dashboard holds a WebSocket to the processing engine rather than polling the API, so a run lasting minutes reports per-file progress as it happens.",
        },
        {
          title: "Inspections are evidence",
          detail:
            "Each inspection records the part number, inspector, start time, duration, a passed, failed or rejected verdict and the URL of the recorded video, so a quality result can be reviewed later against its footage.",
        },
        {
          title: "Scheduled database dumps",
          detail:
            "A node-cron job runs mongodump into a dated directory every three days, keeping a restorable copy outside the application.",
        },
      ],
    },
    links: [],
  },
  {
    slug: "mav",
    diagram: diagrams["mav"],
    filename: "mav.md",
    title: "MAV",
    subtitle: "Multi-Portal Venue Service Request Platform",
    client: "Confidential",
    period: "07/2025 – 02/2026",
    startDate: "2025-07",
    endDate: "2026-02",
    current: false,
    featured: true,
    confidential: true,
    order: 3,
    role: "Full Stack Developer — notification layer owner",
    summary:
      "A venue service-request platform spanning super-admin, venue and mobile-app clients, where I owned the multi-channel notification and escalation layer.",
    tech: [
      "React",
      "Redux",
      "Material-UI",
      "Node.js",
      "Express.js",
      "MongoDB",
      "WhatsApp Business API",
      "Firebase",
      "node-cron",
    ],
    bullets: [
      "Owned the multi-channel notification layer of a venue service-request platform spanning 85 REST endpoints and 14 data models, alerting staff via templated WhatsApp Business API messages, Firebase push notifications and 18 email templates.",
      "Built a node-cron escalation service that auto-reassigns unaccepted service requests, refactored staff assignment from single- to multi-venue, and generated PDFKit and Excel operational reports across super-admin, venue and mobile-app clients.",
    ],
    dossier: {
      scale: [
        { label: "Data models", value: "14" },
        { label: "API endpoints", value: "141" },
        { label: "Email templates", value: "18" },
        { label: "Scheduled jobs", value: "5" },
        { label: "Client applications", value: "3 (super admin, venue portal, mobile app)" },
      ],
      modules: [
        "Service requests",
        "Venues",
        "Rooms",
        "Staff",
        "Users",
        "Notifications",
        "Subscriptions and trials",
        "Reporting",
      ],
      integrations: [
        {
          title: "WhatsApp Business API",
          detail:
            "Templated messages sent through a provider for request, escalation and quotation events.",
        },
        {
          title: "Firebase Cloud Messaging",
          detail:
            "Push notifications to staff and mobile app devices.",
        },
        {
          title: "AWS S3",
          detail:
            "Image and document storage.",
        },
        {
          title: "Stripe",
          detail:
            "Venue subscription billing, free-trial expiry and renewal.",
        },
      ],
      decisions: [
        {
          title: "Escalation is a scheduled sweep",
          detail:
            "An unaccepted request carries an escalation flag and timestamp, indexed together with its venue and creation time. A cron sweep reassigns them, so a request cannot sit unanswered because nobody was watching a screen.",
        },
        {
          title: "One fan-out layer, three channels",
          detail:
            "WhatsApp templates, Firebase push and 18 email templates are driven from a single notification service, so a new event type reaches every channel at once instead of being wired three times.",
        },
        {
          title: "Staff assignment went from one venue to many",
          detail:
            "The assignment model was refactored from a single venue reference to multi-venue, so one staff member can cover several sites without duplicate accounts.",
        },
        {
          title: "Reports are workbooks, not documents",
          detail:
            "Operational reports are generated with write-excel-file, so a venue manager gets a spreadsheet they can filter and pivot rather than a fixed-layout page.",
        },
      ],
    },
    links: [],
  },
  {
    slug: "ip-tutorials",
    diagram: diagrams["ip-tutorials"],
    filename: "ip-tutorials.md",
    title: "IP Tutorials",
    subtitle: "Student Management System",
    client: "IP Tutorials",
    period: "05/2025 – 11/2025",
    startDate: "2025-05",
    endDate: "2025-11",
    current: false,
    featured: true,
    confidential: false,
    order: 4,
    role: "Full Stack Developer",
    summary:
      "A student management platform for 600+ students covering attendance, examinations, results and academic records, with real-time staff chat and queued report generation.",
    tech: [
      "React",
      "Vite",
      "Redux Toolkit",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Socket.io",
      "BullMQ",
      "Firebase",
    ],
    bullets: [
      "Architected a student management platform for 600+ students across 52 data models and 50 API route modules, covering attendance, examinations, results and academic records.",
      "Added Socket.io real-time chat for 50+ staff, with BullMQ job queues, Firebase push notifications and ExcelJS report exports.",
    ],
    dossier: {
      scale: [
        { label: "Data models", value: "67" },
        { label: "API endpoints", value: "543" },
        { label: "Route modules", value: "62" },
        { label: "Controllers", value: "86" },
        { label: "Students supported", value: "600+" },
      ],
      modules: [
        "Students",
        "Teachers",
        "Parents",
        "Admissions and inquiries",
        "Attendance",
        "Examinations",
        "Results",
        "Syllabus and lesson plans",
        "Timetable",
        "Study material",
        "Notes",
        "Leave",
        "Feedback",
        "CRM and tasks",
        "Appointments",
        "Communication",
        "Notifications",
        "Reports",
      ],
      integrations: [
        {
          title: "Socket.io",
          detail:
            "A dedicated socket server handles direct and group chat with typing indicators, read receipts, online presence and last-seen tracking.",
        },
        {
          title: "BullMQ on Redis",
          detail:
            "Invoice reminders are queued as delayed jobs with three retry attempts and consumed by a separate worker process.",
        },
        {
          title: "Firebase Cloud Messaging",
          detail:
            "Push notifications to the mobile app.",
        },
        {
          title: "Google Calendar",
          detail:
            "An OAuth2 integration that creates and removes calendar events when inquiry follow-up tasks are scheduled or cancelled.",
        },
      ],
      decisions: [
        {
          title: "Chat is its own server surface",
          detail:
            "Presence, typing, read receipts and last-seen live in a dedicated socket layer rather than bolted onto REST, so a message never waits on an HTTP round trip.",
        },
        {
          title: "Reminders are jobs, not timers",
          detail:
            "Invoice reminders go into a Redis-backed queue with a delay and a retry policy, so a process restart does not silently lose a scheduled reminder.",
        },
        {
          title: "Bulk data moves as spreadsheets",
          detail:
            "Master schedules and syllabus plans import and export through ExcelJS, and an import returns a per-row success and failure report, so a bad file is diagnosable instead of silently partial.",
        },
        {
          title: "Schedules separated by cadence",
          detail:
            "Four node-cron schedules cover reminders and housekeeping at different intervals rather than one catch-all job.",
        },
      ],
    },
    links: [{ label: "Live demo", url: "https://iptutorials.demobrains.com/", kind: "demo" }],
  },
];

export const education = [
  {
    institution: "Government Engineering College",
    qualification: "B.E. Computer Engineering",
    field: "Computer Engineering",
    score: "CGPA 7.87/10",
    location: "Gandhinagar, India",
    startDate: "2021-08",
    endDate: "2025-05",
    order: 1,
  },
  {
    institution: "Parth School of Science and Commerce",
    qualification: "HSC, Science Stream",
    field: "Science",
    score: "89.69%",
    location: "Vadodara, India",
    startDate: "2020-03",
    endDate: "2021-05",
    order: 2,
  },
];

export const uses = {
  singleton: "uses",
  intro: "The tools I reach for daily. Hardware and editor setup still to fill in.",
  categories: [
    {
      name: "Everyday stack",
      order: 1,
      items: [
        { name: "React", note: "with Redux Toolkit and RTK Query" },
        { name: "Node.js + Express", note: "REST APIs" },
        { name: "MongoDB", note: "with Mongoose" },
        { name: "Tailwind CSS", note: "and Ant Design or MUI on client work" },
      ],
    },
    {
      name: "Shipping",
      order: 2,
      items: [
        { name: "Docker", note: "everything runs in a container" },
        { name: "Kubernetes", note: "" },
        { name: "GitHub Actions", note: "CI/CD to AWS ECS, Lambda and CloudFront" },
        { name: "AWS", note: "ECS, ECR, Lambda, CloudFront, EC2, S3, VPC, IAM" },
      ],
    },
    {
      name: "Tools",
      order: 3,
      items: [
        { name: "Git and GitHub", note: "" },
        { name: "Postman", note: "API work" },
        { name: "Vite", note: "" },
        { name: "Winston", note: "structured logging" },
        { name: "Jest", note: "unit and integration tests" },
      ],
    },
    { name: "Hardware", order: 4, items: [] },
    { name: "Editor", order: 5, items: [] },
  ],
};
