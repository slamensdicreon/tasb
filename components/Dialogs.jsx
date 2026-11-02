"use client";
import { useEffect, useRef, useState } from "react";
import { usePortal } from "./PortalContext";
import { Btn, Text, Tag, Row, Field, Hint, I, download } from "./UI";
import {
  districts,
  scopeAllows,
  usd,
  navItems,
  routes,
} from "../lib/model.mjs";
const serviceKinds = [
  "Loss prevention consultation",
  "Special risks consultation",
  "Customized training",
  "Coverage information",
  "Certificate of coverage",
  "General account support",
];
export default function Dialogs() {
  const p = usePortal(),
    { type, arg } = p.dialog,
    d = p.data,
    box = useRef(null),
    [f, F] = useState({
      kind: serviceKinds.includes(arg) ? arg : serviceKinds[0],
      name: "",
      email: "",
      details: "",
      context: arg || "General district document",
      program: p.org === "cedar" ? "Property" : "Billing",
      file: "",
      q: "",
      selection: arg || "Online training",
      change: arg ? "Update contact" : "Add contact",
      role: "Program contact",
      channel: "Email",
      choice: "No material changes",
      contact: "",
      note: "",
      accepted: false,
    }),
    [err, E] = useState(""),
    [result, R] = useState(""),
    [checks, K] = useState(
      type === "roles" ? [...(d.roles[arg] || [])] : [...d.noticeChannels],
    );
  const patch = (x) => F((v) => ({ ...v, ...x }));
  const finish = (msg) => {
    p.close();
    p.toast(msg);
  };
  const c = p.allClaims.find((x) => x.id === arg),
    contact = d.contacts.find((x) => x.email === arg),
    req = d.requests.find((x) => x.id === arg);
  useEffect(() => {
    const before = document.activeElement,
      overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    box.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") p.close();
      if (e.key === "Tab") {
        const els = Array.from(
          box.current?.querySelectorAll(
            'button:not(:disabled),a[href],input:not(:disabled),select,textarea,[tabindex="0"]',
          ) || [],
        );
        const first = els[0],
          last = els.at(-1);
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === box.current)
        ) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      if (before?.isConnected) before.focus();
    };
  }, []);
  const input = (l, k, t = "text", fallback = "") => (
    <Field label={l}>
      <input
        type={t}
        value={f[k] || fallback}
        onChange={(e) => patch({ [k]: e.target.value })}
      />
    </Field>
  );
  const notes = (l) => (
    <Field label={l}>
      <textarea
        value={f.details}
        onChange={(e) => patch({ details: e.target.value })}
      />
    </Field>
  );
  const select = (l, k, options) => (
    <Field label={l}>
      <select value={f[k]} onChange={(e) => patch({ [k]: e.target.value })}>
        {options.map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
    </Field>
  );
  const checkList = (options) =>
    options.map((v) => (
      <label className="check-field" key={v}>
        <input
          type="checkbox"
          checked={checks.includes(v)}
          onChange={(e) =>
            K(e.target.checked ? [...checks, v] : checks.filter((a) => a !== v))
          }
        />
        {v}
      </label>
    ));
  const done = (text, fn) => <Btn onClick={fn}>{text}</Btn>;
  const ask = (kind, detail, route, extra = {}) => {
    const id = p.request(kind, detail, route, extra);
    R(id + " · " + kind + " received. Next owner: " + route + ".");
  };
  let title = "Member workspace",
    body = null;
  if (result) {
    title = "Confirmation";
    body = (
      <>
        <div className="hint green">
          <I name="check" />
          {result}
        </div>
        <p>This demonstration updates only this browser.</p>
        <Btn onClick={() => p.go("contacts")}>View district requests</Btn>
      </>
    );
  } else
    switch (type) {
      case "org":
        title = "Choose your district workspace";
        body = (
          <>
            {Object.entries(districts).map(([k, v]) => (
              <Row
                key={k}
                title={v.name}
                sub={v.role}
                tag={k === p.org ? "Current" : "Switch"}
                icon="building"
                onClick={() => p.switchOrg(k)}
              />
            ))}
            <Hint>
              Each district has separate sample data and a distinct role.
            </Hint>
          </>
        );
        break;
      case "search": {
        title = "Search your workspace";
        const items = [
          ...navItems
            .filter(([v]) => scopeAllows(p.org, v))
            .map(([v]) => [routes[v], "Portal area", () => p.go(v)]),
          ...p.allClaims.map((c) => [
            c.id + " · " + c.title,
            c.location,
            () => p.open("claim", c.id),
          ]),
          ...[
            "Contribution statement",
            "Payment confirmation",
            ...(p.org === "cedar"
              ? ["Property coverage summary", "Auto identification cards"]
              : []),
          ].map((n) => [n, "Document", () => p.open("document", n)]),
          ...d.requests.map((r) => [
            r.id + " · " + r.type,
            "District request",
            () => p.open("request", r.id),
          ]),
        ];
        let found = items.filter(([n, s]) =>
          (n + " " + s).toLowerCase().includes(f.q.toLowerCase()),
        );
        body = (
          <>
            <Field label="Search claims, documents, or services">
              <input
                value={f.q}
                onChange={(e) => patch({ q: e.target.value })}
                placeholder="Try a claim number or document name"
              />
            </Field>
            {found.slice(0, 12).map(([n, s, fn]) => (
              <Row key={n} title={n} sub={s} onClick={fn} />
            ))}
            {!found.length && <p>No matching sample records.</p>}
          </>
        );
        break;
      }
      case "notices":
        title = "Your notifications";
        body = (
          <>
            {d.claims.slice(0, 3).map((c) => (
              <Row
                key={c.id}
                title={"Report received · " + c.id}
                sub={c.status}
                onClick={() => p.open("claim", c.id)}
              />
            ))}
            {p.org === "cedar" && (
              <Row
                title="Renewal checklist ready"
                sub={
                  "Due November 30 · Reminder intervals: " +
                  d.config.intervals.join(", ") +
                  " days"
                }
                onClick={() => p.go("renewals")}
              />
            )}
            <Row
              title="Q3 wage reporting period open"
              sub="Submission due October 31"
              onClick={() => p.go("unemployment")}
            />
            {d.requests.slice(0, 3).map((r) => (
              <Row
                key={r.id}
                title={r.type}
                sub={r.id + " · " + r.status}
                onClick={() => p.open("request", r.id)}
              />
            ))}
            <Btn
              secondary
              onClick={() => {
                p.change((s) => ({ ...s, read: true }));
                finish("Notifications acknowledged.");
              }}
            >
              Acknowledge notices
            </Btn>
          </>
        );
        break;
      case "claim":
        title = c ? c.id : "Claim unavailable";
        if (!c) {
          body = <p>This record is unavailable for the selected district.</p>;
          break;
        }
        body = (
          <>
            <Tag color="teal">{c.status}</Tag>
            <h3>{c.title}</h3>
            <dl className="review-dl">
              {[
                ["District", p.district.name],
                ["Location", c.location],
                ["Program", c.type],
                ["Incident date", c.date],
                [
                  "Next owner",
                  c.status === "Action required"
                    ? "Your district"
                    : c.status === "District review"
                      ? "District coordinator"
                      : "Fund claims team",
                ],
                ...(c.reference ? [["District reference", c.reference]] : []),
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            {c.description && <p>{c.description}</p>}
            <h3>Activity history</h3>
            <div className="timeline-box">
              <p>
                <I name="check" />{" "}
                {c.status === "District review"
                  ? "Received by district"
                  : "Report received"}{" "}
                · {c.date}
              </p>
              <p>
                <I name="clock" /> {c.status} · {c.updated}
              </p>
            </div>
            <h3>Correspondence & payments</h3>
            <Text onClick={() => p.open("document", "Acknowledgement " + c.id)}>
              Read acknowledgement
            </Text>
            <p>
              {c.id === "PROP-2026-0089"
                ? "Sample property claim payment: $4,250 · October 9, 2026."
                : "No payment activity recorded."}
            </p>
            <h3>Supporting documents</h3>
            {[
              ...(c.files || []),
              ...d.uploads.filter((a) => a.context === c.id).map((a) => a.name),
            ].map((n, i) => (
              <p key={i}>
                <I name="file" /> {n}
              </p>
            ))}
            <Btn secondary icon="upload" onClick={() => p.open("upload", c.id)}>
              Add supporting document
            </Btn>
          </>
        );
        break;
      case "upload":
        title = "Add a supporting document";
        body = (
          <>
            {input("Record or purpose", "context")}
            {select(
              "Program",
              "program",
              p.org === "cedar"
                ? [
                    "Property",
                    "Workers’ compensation",
                    "Auto",
                    "Liability",
                    "Cyber",
                    "Billing",
                  ]
                : ["Billing", "Unemployment compensation"],
            )}
            <Field label="Choose a file">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.xlsx,.docx,.txt,.csv,.mov,.mp4"
                onChange={(e) => {
                  const x = e.target.files?.[0];
                  if (!x) return;
                  if (x.size > 200 * 1024 * 1024) {
                    E("Choose a file smaller than 200 MB.");
                    return;
                  }
                  patch({ file: x.name });
                  E("");
                }}
              />
            </Field>
            <Text
              onClick={() => {
                patch({ file: "Supporting document.pdf" });
                E("");
              }}
            >
              Use sample document
            </Text>
            {f.file && (
              <p>
                <I name="file" /> {f.file}
              </p>
            )}
            <Hint>
              Only the filename and record association are saved. File contents
              are not transmitted.
            </Hint>
            {done("Submit demo document", () => {
              if (!f.file || !f.context.trim())
                return E("Choose a file and specify its record or purpose.");
              p.change((s) => ({
                ...s,
                uploads: [
                  { name: f.file, context: f.context, program: f.program },
                  ...s.uploads,
                ],
                docReceived: s.docReceived || f.context === "WC-2026-0284",
                read: false,
              }));
              finish("Document added to the district record.");
            })}
          </>
        );
        break;
      case "document":
        title = arg || "Member document";
        body = (
          <>
            <Tag>Read-only sample</Tag>
            <dl className="review-dl">
              {[
                ["District", p.district.name],
                ["Document", title],
                ["Version", "1.0"],
                ["Publication date", "October 1, 2026"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <p>
              {title.includes("payment") || title.includes("Payment")
                ? "Payment activity is provided for account reconciliation."
                : title.includes("Auto")
                  ? "Demonstration fleet record. Sample documents cannot serve as proof of coverage."
                  : "This sample illustrates how a member previews a record in context."}
            </p>
            <Btn
              icon="download"
              onClick={() =>
                download(
                  title,
                  p.district.name +
                    " · Version 1.0 · October 2026\nIllustrative sample record: " +
                    title,
                )
              }
            >
              Download sample (.txt)
            </Btn>
          </>
        );
        break;
      case "questionnaire":
        title = "Renewal questionnaire";
        body = (
          <>
            {select("Have district operations changed?", "choice", [
              "No material changes",
              "Changes to report",
            ])}
            {notes("Describe changes or add a note")}
            <label className="check-field">
              <input
                type="checkbox"
                checked={f.accepted}
                onChange={(e) => patch({ accepted: e.target.checked })}
              />
              I have reviewed the district information.
            </label>
            {done("Save questionnaire", () => {
              if (
                !f.accepted ||
                (f.choice === "Changes to report" && !f.details.trim())
              )
                return E("Confirm review and describe any changes.");
              p.change((s) => ({
                ...s,
                renewal: 4,
                renewalAnswers: f.choice + " " + f.details,
              }));
              finish(
                "Questionnaire complete. Review and submit the renewal package.",
              );
            })}
          </>
        );
        break;
      case "renewSubmit":
        title = "Review renewal package";
        body = (
          <>
            <p>{p.district.name} · 2026–27 renewal</p>
            <p>{d.renewalAnswers}</p>
            <Hint>
              Your package will move from district preparation to Fund review in
              the demonstration.
            </Hint>
            {done("Submit demo renewal", () => {
              p.change((s) => ({ ...s, renewal: 5, read: false }));
              finish("Renewal received for Fund review.");
            })}
          </>
        );
        break;
      case "invoice":
        title = "Deductible billing statement";
        body = (
          <>
            <div className="balance-hero">
              <small>Outstanding balance</small>
              <h1>{usd(d.paid ? 0 : p.district.balance)}</h1>
              <p>{p.district.name} · Due October 30, 2026</p>
            </div>
            <Hint>
              Payment simulation only. No financial information is collected and
              no funds move.
            </Hint>
            {!d.paid &&
              done("Confirm demo payment", () => {
                p.change((s) => ({ ...s, paid: true }));
                finish(
                  "Sample payment recorded. The account balance is updated.",
                );
              })}
            <Text
              onClick={() =>
                download(
                  "Invoice statement",
                  p.district.name +
                    " · Amount " +
                    usd(p.district.balance) +
                    " · " +
                    (d.paid ? "Paid" : "Outstanding"),
                )
              }
            >
              Download sample statement
            </Text>
          </>
        );
        break;
      case "wage":
        title = "Q3 wage submission";
        body = (
          <>
            <p>Reporting period: July 1 through September 30, 2026.</p>
            <Tag color="teal">{d.wages ? "Submitted" : "Due October 31"}</Tag>
            <Hint>
              The live service would continue through UC Connections using the
              member’s authenticated context.
            </Hint>
            {!d.wages &&
              done("Record demo submission", () => {
                p.change((s) => ({ ...s, wages: true }));
                finish("Q3 submission recorded.");
              })}
          </>
        );
        break;
      case "notice":
        title = "Quarterly reporting notice";
        body = (
          <>
            <Tag>UC correspondence · Oct 9</Tag>
            <p>
              Q3 wage reporting is open for {p.district.name}. Complete your
              district submission by October 31, 2026.
            </p>
            <Btn onClick={() => p.go("unemployment")}>
              View reporting periods
            </Btn>
          </>
        );
        break;
      case "service":
        title = "Request a Fund service";
        body = (
          <>
            {select("Service type", "kind", serviceKinds)}
            {notes(
              f.kind === "Certificate of coverage"
                ? "Certificate holder and purpose"
                : "What would your district like help with?",
            )}
            <Hint>
              Illustrative response target: two business days. No message will
              be sent.
            </Hint>
            {done("Submit demo request", () => {
              if (!f.details.trim()) return E("Provide the request details.");
              ask(
                f.kind,
                f.details,
                /coverage|Certificate/i.test(f.kind)
                  ? "Coverage services"
                  : /training/i.test(f.kind)
                    ? "Training team"
                    : "Risk solutions",
              );
            })}
          </>
        );
        break;
      case "support":
        title = "Contact your Fund team";
        body = (
          <>
            <div className="person">
              <span className="avatar">ML</span>
              <div>
                <strong>Maria Lopez</strong>
                <small>Risk Management Consultant · Sample contact</small>
              </div>
            </div>
            {select("Contact method", "channel", ["Email", "Chat", "Phone"])}
            <p>
              {f.channel === "Phone"
                ? "Fund member service: 800-482-7276. This demonstration does not place calls."
                : f.channel === "Chat"
                  ? "Start a sample chat request with Member Services."
                  : "Compose a sample inquiry for your service team."}
            </p>
            {notes("Question or callback request")}
            <Hint>
              Illustrative response target: within two business days. No
              external message is sent.
            </Hint>
            {done("Record demo inquiry", () => {
              if (!f.details.trim()) return E("Add a question or request.");
              ask(f.channel + " inquiry", f.details, "Member support");
            })}
          </>
        );
        break;
      case "contactChange":
        title = "Request a contact change";
        body = (
          <>
            {select("Change requested", "change", [
              "Add contact",
              "Update contact",
              "Remove contact",
            ])}
            {input("Contact name", "name", "text", contact?.name || "")}
            {input("Contact email", "email", "email", contact?.email || "")}
            {select("Responsibility", "role", [
              "Program contact",
              "Claims contact",
              "Billing contact",
              "Loss prevention contact",
            ])}
            {done("Submit for review", () => {
              const name = (f.name || contact?.name || "").trim(),
                email = (f.email || contact?.email || "").trim();
              if (!name || !/^\S+@\S+\.\S+$/.test(email))
                return E("Enter a contact name and valid email address.");
              ask(
                "Contact change",
                f.change + ": " + name + " · " + email,
                "Member administration",
                {
                  edit: f.change,
                  oldEmail: arg || email,
                  person: { name, email, role: f.role },
                },
              );
            })}
          </>
        );
        break;
      case "requestAccess":
        title = "Request application access";
        body = (
          <>
            {select("Application", "selection", [
              "Online training",
              "Fund Data Center",
              "Resolver",
              "UC Connections",
              "Member Portal",
              "Fund website",
            ])}
            {notes("Business purpose")}
            {done("Submit access request", () => {
              if (!f.details.trim())
                return E("Enter a short business purpose.");
              ask(
                "Application access",
                f.selection + " · " + f.details,
                "TASB access administrator",
                { application: f.selection },
              );
            })}
          </>
        );
        break;
      case "handoff":
        title = "Continue to " + arg;
        body = (
          <>
            <Tag color="teal">Single sign-on preview</Tag>
            <dl className="review-dl">
              <div>
                <dt>Member organization</dt>
                <dd>{p.district.name}</dd>
              </div>
              <div>
                <dt>Member role</dt>
                <dd>{p.district.role}</dd>
              </div>
              <div>
                <dt>Destination</dt>
                <dd>{arg}</dd>
              </div>
            </dl>
            <Hint>
              The live portal would pass an authenticated session to this
              service. No external login occurs in this prototype.
            </Hint>
            <Btn onClick={p.close}>Return to workspace</Btn>
          </>
        );
        break;
      case "request":
      case "approve":
        title = req?.type || "Certificate of coverage request";
        body = (
          <>
            <Tag>{req?.status || "With the Fund"}</Tag>
            <p>
              <strong>{arg}</strong>
            </p>
            <p>
              {req?.detail ||
                "Property coverage certificate requested October 13."}
            </p>
            <p>Next owner: {req?.route || "Coverage services"}.</p>
            {type === "approve" &&
              req &&
              req.status !== "Reviewed" &&
              done("Approve / mark reviewed", () => {
                p.change((s) => {
                  let contacts = [...s.contacts];
                  if (req.person) {
                    contacts = contacts.filter(
                      (c) =>
                        c.email !== req.oldEmail &&
                        c.email !== req.person.email,
                    );
                    if (req.edit !== "Remove contact")
                      contacts.push(req.person);
                  }
                  return {
                    ...s,
                    contacts,
                    requests: s.requests.map((r) =>
                      r.id === arg ? { ...r, status: "Reviewed" } : r,
                    ),
                    extraAccess: req.application
                      ? [...new Set([...s.extraAccess, req.application])]
                      : s.extraAccess,
                    audit: [
                      { action: "Reviewed " + req.id, detail: req.type },
                      ...s.audit,
                    ],
                    read: false,
                  };
                });
                finish("Request reviewed; sample records updated.");
              })}
          </>
        );
        break;
      case "routeIncident":
        title = "Review campus injury report";
        body = (
          <>
            <Tag color="amber">
              District incident · Not yet submitted to the Fund
            </Tag>
            <p>
              {arg} · {c?.location || p.district.campus}
            </p>
            <p>
              {c?.description ||
                "A campus employee reported an injury while moving supplies. Initial details are available to the district coordinator."}
            </p>
            {done("Submit demo claim to the Fund", () => {
              p.change((s) => {
                const rec = {
                  ...(c || {}),
                  id: "WC-2026-" + String(600 + s.claims.length),
                  type: "Workers’ compensation",
                  title: "District-reviewed injury report",
                  location: c?.location || p.district.campus,
                  date: c?.date || "2026-10-14",
                  updated: "Oct 15",
                  status: "Received",
                  description:
                    "Reviewed by the district coordinator. Incident reference " +
                    arg,
                  files: c?.files || [],
                };
                return {
                  ...s,
                  routed: arg === "INC-CG-0042" || s.routed,
                  claims: [rec, ...s.claims.filter((x) => x.id !== arg)],
                  read: false,
                };
              });
              finish("The reviewed incident now appears in district claims.");
            })}
          </>
        );
        break;
      case "preferences":
      case "roles":
        title =
          type === "roles" ? "Roles for " + arg : "Notification preferences";
        body = (
          <>
            {checkList(
              type === "roles"
                ? [
                    "Program contact",
                    "Claims contact",
                    "Billing contact",
                    "Loss prevention contact",
                  ]
                : ["Portal", "Email"],
            )}
            {done("Save changes", () => {
              p.change((s) =>
                type === "roles"
                  ? {
                      ...s,
                      roles: { ...s.roles, [arg]: checks },
                      audit: [
                        {
                          action: "Role assignment: " + arg,
                          detail: checks.join(", ") || "All roles removed",
                        },
                        ...s.audit,
                      ],
                    }
                  : { ...s, noticeChannels: checks },
              );
              finish("Changes saved.");
            })}
          </>
        );
        break;
      case "emailPreview":
        title = "Renewal reminder preview";
        body = (
          <>
            <p>To: Authorized program contacts at {p.district.name}</p>
            <h3>Your annual renewal is due November 30</h3>
            <p>
              Review your questionnaire and outstanding checklist items before
              the deadline.
            </p>
            <p>
              Reminder intervals: {d.config.intervals.join(", ") || "None"}{" "}
              days. Enabled channels:{" "}
              {[d.config.email && "Email", d.config.portal && "Portal"]
                .filter(Boolean)
                .join(", ") || "None"}
              .
            </p>
            <Btn onClick={() => p.go("renewals")}>Open renewal</Btn>
          </>
        );
        break;
      case "checklist":
        title = "Campus preparation checklist";
        body = (
          <>
            <img
              className="dialog-photo"
              src="/assets/maintenance.jpg"
              alt="Facilities equipment"
            />
            <Tag>{d.config.audience}</Tag>
            <ol className="guidance">
              <li>
                Follow district emergency procedures and keep people away from
                damaged areas.
              </li>
              <li>Record the location, date, and affected property.</li>
              <li>
                Gather available photos and supporting records when it is safe.
              </li>
              <li>Report the incident and follow updates in your workspace.</li>
            </ol>
            <Btn onClick={() => p.go("report")}>Report an incident</Btn>
          </>
        );
        break;
      case "reset":
        title = "Reset the demonstration?";
        body = (
          <>
            <p>
              This restores both fictional district workspaces and clears
              locally saved reports, drafts, and configuration changes.
            </p>
            <Btn onClick={p.reset}>Reset demo</Btn>
          </>
        );
        break;
      default:
        title = "Workspace";
        body = <Btn onClick={p.close}>Return</Btn>;
    }
  return (
    <div
      className="panel-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) p.close();
      }}
    >
      <section
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        ref={box}
        tabIndex={-1}
      >
        <div className="drawer-head">
          <div>
            <div className="eyebrow">{p.district.name}</div>
            <h2 id="dialog-title">{title}</h2>
          </div>
          <button
            className="icon-button"
            onClick={p.close}
            aria-label="Close dialog"
          >
            <I name="x" />
          </button>
        </div>
        <div className="drawer-body">
          {body}
          {err && (
            <p className="field-error" role="alert">
              {err}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
