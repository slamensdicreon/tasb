export const routes = {
  dashboard: "Overview",
  tasks: "My tasks",
  claims: "Claims",
  report: "Report a claim",
  coverage: "Coverage",
  renewals: "Annual renewal",
  billing: "Billing & payments",
  documents: "Documents",
  unemployment: "Unemployment",
  resources: "Resources & training",
  contacts: "Contacts & requests",
  services: "Connected services",
  routing: "District review queue",
  admin: "Administration preview",
  requirements: "Requirements guide",
  access: "Member access",
};
export const programs = [
  "Property",
  "Workers’ compensation",
  "Auto",
  "Liability",
  "Cyber",
];
export const districts = {
  cedar: {
    name: "Cedar Grove ISD",
    role: "District Business Manager",
    balance: 18450,
    campus: "Cedar Grove Elementary",
  },
  pine: {
    name: "Pine Hollow ISD",
    role: "Finance & Payroll Contact",
    balance: 8240,
    campus: "Pine Hollow Elementary",
  },
};
export const scopeAllows = (org, view) =>
  org === "cedar" ||
  [
    "dashboard",
    "billing",
    "documents",
    "unemployment",
    "contacts",
    "services",
    "requirements",
    "access",
  ].includes(view);
export const freshDraft = () => ({
  step: 1,
  type: "Property",
  campus: "",
  date: "",
  description: "",
  contact: "Angela Mitchell",
  email: "angela.mitchell@example.org",
  reference: "",
  files: [],
});
export function freshData(org = "cedar") {
  return {
    claims: [],
    requests: [],
    uploads: [],
    paid: false,
    docReceived: false,
    wages: false,
    renewal: 3,
    renewalAnswers: "",
    routed: false,
    read: false,
    noticeChannels: ["Portal", "Email"],
    training: [],
    contacts: [
      {
        name: "Angela Mitchell",
        role: "Program contact",
        email: "angela.mitchell@example.org",
      },
      {
        name: org === "cedar" ? "Daniel Brooks" : "Elena Morris",
        role: org === "cedar" ? "Claims contact" : "Payroll contact",
        email:
          org === "cedar"
            ? "daniel.brooks@example.org"
            : "elena.morris@example.org",
      },
      {
        name: "Renee Parker",
        role: "Billing contact",
        email: "renee.parker@example.org",
      },
    ],
    draft: freshDraft(),
    config: {
      taskTitle: "Your next steps",
      insight: true,
      resources: true,
      reference: false,
      referenceRequired: false,
      fieldLabel: "District incident reference",
      routed: true,
      intervals: ["90", "60", "30", "15"],
      email: true,
      portal: true,
      audience: "Property program members",
    },
    roles: {
      Angela: ["Program contact", "Claims contact", "Billing contact"],
      Daniel: ["Claims contact"],
      Renee: ["Billing contact"],
    },
    audit: [],
    extraAccess: [],
  };
}
export function newStore() {
  return {
    org: "cedar",
    districts: { cedar: freshData(), pine: freshData("pine") },
  };
}
export function validate(d, cfg) {
  if (!d.campus) return "Select a district location.";
  if (!d.date || d.date > "2026-10-15")
    return "Choose an incident date on or before the demonstration date, October 15, 2026.";
  if (d.description.trim().length < 10)
    return "Describe the incident in at least ten characters.";
  if (!d.contact.trim() || !/^\S+@\S+\.\S+$/.test(d.email))
    return "Enter a contact name and valid email address.";
  if (cfg.reference && cfg.referenceRequired && !d.reference.trim())
    return "Enter " + cfg.fieldLabel.toLowerCase() + ".";
  return "";
}
export function newClaim(data) {
  const d = data.draft,
    routed = d.type === "Workers’ compensation" && data.config.routed;
  const id =
    (routed
      ? "INC"
      : { Property: "PROP", Auto: "AUTO", Liability: "LIAB", Cyber: "CYB" }[
          d.type
        ] || "WC") +
    "-2026-" +
    String(148 + data.claims.length).padStart(4, "0");
  return {
    id,
    title:
      d.type === "Property" && /hail|storm/i.test(d.description)
        ? "Storm damage report"
        : d.type + " report",
    type: d.type,
    location: d.campus,
    date: d.date,
    status: routed ? "District review" : "Received",
    updated: "Oct 15",
    icon: d.type === "Auto" ? "car" : "building",
    description: d.description,
    contact: d.contact,
    email: d.email,
    files: [...d.files],
    reference: d.reference,
  };
}
export const usd = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
export const navItems = [
  ["dashboard", "grid"],
  ["tasks", "checklist"],
  ["claims", "clipboard"],
  ["coverage", "shield"],
  ["renewals", "calendar"],
  ["billing", "wallet"],
  ["documents", "file"],
  ["unemployment", "calendar"],
  ["resources", "book"],
  ["contacts", "users"],
  ["services", "external"],
];
export function taskList(d, org) {
  return [
    ...(org === "cedar" && !d.docReceived
      ? [
          [
            "doc",
            "Add a document to an open claim",
            "Workers’ compensation · WC-2026-0284",
            "Oct 19",
            "file",
          ],
        ]
      : []),
    ...(!d.wages
      ? [
          [
            "wages",
            "Complete quarterly wage reporting",
            "Unemployment compensation · Q3 2026",
            "Oct 31",
            "calendar",
          ],
        ]
      : []),
    ...(org === "cedar" && d.renewal < 5
      ? [
          [
            "renew",
            "Finish your renewal questionnaire",
            d.renewal + " of 5 steps complete",
            "Nov 30",
            "checklist",
          ],
        ]
      : []),
  ];
}
export function resolveTarget(t) {
  const m = {
    dashboard: ["dashboard"],
    organization: ["dashboard", "org"],
    entry: ["access"],
    search: ["dashboard", "search"],
    notifications: ["dashboard", "notices"],
    "upload-document": ["documents", "upload"],
    "access-request": ["services", "requestAccess"],
    invoice: ["billing", "invoice"],
    "new-claim": ["report"],
    renewal: ["renewals"],
    "coverage-question": ["coverage", "service", "Coverage information"],
    certificate: ["coverage", "service", "Certificate of coverage"],
    "auto-card": ["documents", "document", "Auto identification cards"],
    contact: ["contacts", "support"],
    "service-request": ["contacts", "service", "Loss prevention consultation"],
    "training-history": ["resources", "history"],
    uc: ["unemployment"],
    "uc-mail": ["unemployment", "notice"],
  };
  if (t.startsWith("admin:")) return ["admin", "tab", t.split(":")[1]];
  if (t.startsWith("claim/")) return ["claims", "claim", t.slice(6)];
  return m[t] || [t];
}
