"use client";
import { useState } from "react";
import { usePortal } from "./PortalContext";
import { programs, taskList, usd, resolveTarget } from "../lib/model.mjs";
import requirements from "../lib/requirements.json";
import { I, Btn, Text, Head, Card, Tag, Row, Hint } from "./UI";
import ClaimJourney from "./ClaimJourney";
import Admin from "./Admin";
const appList = [
  "Fund Data Center",
  "Resolver",
  "UC Connections",
  "TASB.org",
  "Online training",
];
export { appList };
export function TaskCard() {
  const p = usePortal(),
    [tab, setTab] = useState("Needs attention");
  const rows = taskList(p.data, p.org);
  return (
    <Card
      title={p.data.config.taskTitle}
      sub="Prioritized for your district and responsibilities."
    >
      <div className="tabs">
        {["Needs attention", "With the Fund", "Completed"].map((t) => (
          <button
            className={t === tab ? "active" : ""}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
            {t === "Needs attention" && " · " + rows.length}
          </button>
        ))}
      </div>
      {tab === "Needs attention" ? (
        rows.length ? (
          rows.map(([id, h, s, date, ic]) => (
            <Row
              key={id}
              title={h}
              sub={s}
              icon={ic}
              tag={"Due " + date}
              onClick={() =>
                id === "doc"
                  ? p.open("upload", "WC-2026-0284")
                  : p.go(id === "wages" ? "unemployment" : "renewals")
              }
            />
          ))
        ) : (
          <p className="pad">Your district is caught up.</p>
        )
      ) : tab === "With the Fund" ? (
        <>
          {p.data.requests
            .filter((r) => r.status !== "Reviewed")
            .map((r) => (
              <Row
                key={r.id}
                title={r.type}
                sub={r.id + " · " + r.route}
                onClick={() => p.open("request", r.id)}
              />
            ))}
          <Row
            title="Coverage certificate request"
            sub="Submitted Oct 13 · Coverage services"
            onClick={() => p.open("request", "SR-104")}
          />
        </>
      ) : (
        <>
          <Row
            title="Quarterly wage statement accepted"
            sub="Q2 2026 · Payroll"
            onClick={() => p.go("unemployment")}
          />
          {p.data.docReceived && (
            <Row
              title="Requested claim document received"
              sub="WC-2026-0284"
              onClick={() => p.open("claim", "WC-2026-0284")}
            />
          )}
        </>
      )}
    </Card>
  );
}
function Team() {
  const p = usePortal();
  return (
    <Card title="Your Fund team">
      <div className="pad-topless">
        <div className="person">
          <span className="avatar">ML</span>
          <div>
            <strong>Maria Lopez</strong>
            <small>Risk Management Consultant</small>
          </div>
        </div>
        <Text onClick={() => p.open("support")}>Contact your team</Text>
      </div>
    </Card>
  );
}
function RenewalPromo() {
  const p = usePortal();
  return (
    <section className="card renewal-card">
      <div className="eyebrow">
        <I name="shield" /> ANNUAL RENEWAL
      </div>
      <h2>
        {p.data.renewal === 5
          ? "Your renewal is with the Fund."
          : "Prepare for your next coverage year."}
      </h2>
      <p>Review the checklist and pick up where you left off.</p>
      <div className="renewal-progress">
        <span>District progress</span>
        <strong>{p.data.renewal} of 5 complete</strong>
      </div>
      <div className="segmented-bar">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={i <= p.data.renewal ? "done" : ""} />
        ))}
      </div>
      <p>Due November 30, 2026</p>
      <button className="btn btn-light" onClick={() => p.go("renewals")}>
        View renewal checklist <I name="arrow" />
      </button>
    </section>
  );
}
function ClaimRows({ items }) {
  const p = usePortal();
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>CLAIM / REPORT</th>
            <th>STATUS</th>
            <th>LAST UPDATE</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id}>
              <td>
                <button
                  className="text-button"
                  onClick={() => p.open("claim", c.id)}
                >
                  {c.id}
                </button>
                <small>
                  {c.title} · {c.location}
                </small>
              </td>
              <td>
                <Tag
                  color={
                    c.status === "Action required"
                      ? "amber"
                      : c.status === "Received"
                        ? "green"
                        : "gray"
                  }
                >
                  {c.status}
                </Tag>
              </td>
              <td>{c.updated}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!items.length && <p className="pad">No matching records.</p>}
    </div>
  );
}
function Dashboard() {
  const p = usePortal(),
    cedar = p.org === "cedar",
    d = p.data;
  const stats = cedar
    ? [
        [
          "Needs attention",
          taskList(d, p.org).length,
          "Assigned to your district",
          "tasks",
          "checklist",
        ],
        [
          "Open claims & reports",
          p.allClaims.length,
          "View current activity",
          "claims",
          "clipboard",
        ],
        [
          "Coverage programs",
          programs.length,
          "Active coverage programs",
          "coverage",
          "shield",
        ],
        [
          "Outstanding balance",
          usd(d.paid ? 0 : p.district.balance),
          "Billing and contributions",
          "billing",
          "wallet",
        ],
      ]
    : [
        [
          "Outstanding balance",
          usd(d.paid ? 0 : p.district.balance),
          "Finance & payroll",
          "billing",
          "wallet",
        ],
        [
          "Wage reporting",
          "Q3 2026",
          d.wages ? "Submitted" : "Due October 31",
          "unemployment",
          "calendar",
        ],
      ];
  return (
    <>
      <section className="workspace-welcome">
        <div>
          <div className="eyebrow">OCTOBER 15, 2026 · MEMBER WORKSPACE</div>
          <h1>Good morning, Angela.</h1>
          <p>Here’s what needs your attention at {p.district.name}.</p>
          <div className="actions">
            <Btn
              icon={cedar ? "plus" : "wallet"}
              onClick={() => p.go(cedar ? "report" : "billing")}
            >
              {cedar
                ? d.draft.step > 1
                  ? "Resume claim report"
                  : "Report a claim"
                : "Review billing"}
            </Btn>
            <Btn
              secondary
              onClick={() => p.open("service", "Loss prevention consultation")}
            >
              Request support
            </Btn>
          </div>
        </div>
        <figure>
          <img
            src="/assets/campus-sunset.jpg"
            alt="An aerial view of school buildings and athletic fields"
          />
          <figcaption>
            <I name="building" /> {p.district.name}
          </figcaption>
        </figure>
      </section>
      <div className="stats">
        {stats.map(([h, n, s, v, i]) => (
          <button className="stat" key={h} onClick={() => p.go(v)}>
            <div className="stat-top">
              {h}
              <I name={i} />
            </div>
            <div className="stat-number">{n}</div>
            <div className="stat-bottom">{s}</div>
          </button>
        ))}
      </div>
      <div className="dashboard-grid">
        <div className="main-column">
          <TaskCard />
          {cedar && (
            <>
              <Card
                title="Recent claim activity"
                action={<Text onClick={() => p.go("claims")}>All claims</Text>}
              >
                <ClaimRows items={p.allClaims.slice(0, 3)} />
              </Card>
              <Card title="District services">
                <div className="quick-actions">
                  {[
                    ["Certificate of coverage", "shield", "service"],
                    ["Auto identification cards", "car", "document"],
                    ["Contribution statement", "wallet", "document"],
                    ["Coverage information", "book", "service"],
                  ].map(([name, ic, a]) => (
                    <button
                      className="quick-action"
                      key={name}
                      onClick={() => p.open(a, name)}
                    >
                      <span>
                        <I name={ic} />
                      </span>
                      {name}
                    </button>
                  ))}
                </div>
              </Card>
            </>
          )}
          {d.config.resources && (
            <Card
              title="Recommended for your district"
              action={
                <Text onClick={() => p.go(cedar ? "resources" : "documents")}>
                  Explore
                </Text>
              }
            >
              <div className="media-strip">
                <img
                  alt="School facilities maintenance"
                  src="/assets/maintenance.jpg"
                />
                <div>
                  <Tag color="teal">
                    {cedar ? "Property program" : "Finance & payroll"}
                  </Tag>
                  <h3>
                    {cedar
                      ? "Prepare your campuses for severe weather"
                      : "Prepare your quarterly reporting documents"}
                  </h3>
                  <Text
                    onClick={() =>
                      cedar ? p.open("checklist") : p.go("documents")
                    }
                  >
                    View guidance
                  </Text>
                </div>
              </div>
            </Card>
          )}
        </div>
        <div className="side-column">
          {cedar && <RenewalPromo />}
          <Team />
          {d.config.insight && cedar && (
            <Card
              title="Claims by program"
              sub="Current open claims and reports"
            >
              <div className="pad-topless">
                {programs.map((t) => {
                  const n = p.allClaims.filter((c) => c.type === t).length;
                  return (
                    <div className="bar-line" key={t}>
                      <span>{t}</span>
                      <i
                        style={{
                          width:
                            Math.max(
                              2,
                              (n / Math.max(1, p.allClaims.length)) * 100,
                            ) + "%",
                        }}
                      />
                      <b>{n}</b>
                    </div>
                  );
                })}
                <Text onClick={() => p.open("handoff", "Fund Data Center")}>
                  Open reporting service
                </Text>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
function Claims() {
  const p = usePortal(),
    [q, Q] = useState(""),
    [type, T] = useState("All programs");
  return (
    <>
      <Head
        eyebrow="CLAIMS"
        title="Your district’s claims"
        sub="Track each report, status change, and request for information."
        action={
          <Btn icon="plus" onClick={() => p.go("report")}>
            Report a claim
          </Btn>
        }
      />
      <div className="banner">
        <I name="users" />
        <span>
          Campus injury reports awaiting district review:{" "}
          <b>
            {(!p.data.routed ? 1 : 0) +
              p.allClaims.filter((c) => c.status === "District review").length}
          </b>
        </span>
        <Text onClick={() => p.go("routing")}>Review queue</Text>
      </div>
      <Card title="Open claims & reports">
        <div className="filterbar">
          <input
            aria-label="Search claims"
            placeholder="Claim number, location, or description"
            value={q}
            onChange={(e) => Q(e.target.value)}
          />
          <select
            aria-label="Coverage filter"
            value={type}
            onChange={(e) => T(e.target.value)}
          >
            {["All programs", ...programs].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <ClaimRows
          items={p.allClaims.filter(
            (c) =>
              (type === "All programs" || c.type === type) &&
              [c.id, c.location, c.title, c.status]
                .join(" ")
                .toLowerCase()
                .includes(q.toLowerCase()),
          )}
        />
      </Card>
    </>
  );
}
function Renewal() {
  const p = usePortal(),
    d = p.data,
    [program, P] = useState("Property");
  return (
    <>
      <Head
        eyebrow="COVERAGE & RENEWALS"
        title="Your annual renewal"
        sub="Review district information, supporting records, and the next owner."
        action={
          <Btn secondary icon="bell" onClick={() => p.open("preferences")}>
            Reminder preferences
          </Btn>
        }
      />
      <div className="renew-hero">
        <div className="ring" style={{ "--progress": d.renewal * 20 + "%" }}>
          <b>{d.renewal}/5</b>
        </div>
        <div>
          <h2>
            {d.renewal === 5
              ? "Submitted for Fund review"
              : "District preparation in progress"}
          </h2>
          <p>2026–27 renewal · Due November 30, 2026</p>
        </div>
        <Tag color="green">
          {d.renewal === 5 ? "With the Fund" : "District action"}
        </Tag>
      </div>
      <div className="details-grid">
        <div className="main-column">
          <Card
            title="Renewal checklist"
            action={
              <select
                aria-label="Program"
                value={program}
                onChange={(e) => P(e.target.value)}
              >
                {programs.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            }
          >
            {[
              "Confirm district contacts",
              "Confirm program participation",
              program === "Property"
                ? "Review buildings and property values"
                : program === "Auto"
                  ? "Review vehicle schedules"
                  : "Review " + program.toLowerCase() + " schedule",
              "Complete renewal questionnaire",
              "Review and submit to the Fund",
            ].map((s, i) => (
              <div className="step-row" key={s}>
                <I name={i < d.renewal ? "check" : "clock"} />
                <div>
                  <strong>{s}</strong>
                  <small>
                    {i < d.renewal
                      ? "Completed"
                      : i === d.renewal
                        ? "Your next action"
                        : "Available after prior steps"}
                  </small>
                </div>
                {i === d.renewal && (
                  <Text
                    onClick={() =>
                      p.open(i === 3 ? "questionnaire" : "renewSubmit")
                    }
                  >
                    {i === 3 ? "Continue" : "Review"}
                  </Text>
                )}
              </div>
            ))}
          </Card>
          <Card
            title="Renewal documents"
            sub="Read-only documents from the sample member record"
          >
            {[
              program + " schedule",
              "Renewal instructions",
              "2026–27 renewal notice",
            ].map((n) => (
              <Row
                key={n}
                title={n}
                sub="Version 1.2 · Published Oct 1, 2026"
                onClick={() => p.open("document", n)}
              />
            ))}
          </Card>
        </div>
        <div className="side-column">
          <Card title="Renewal status">
            <div className="pad-topless">
              {[
                "Renewal opened",
                "District preparation",
                "Fund review",
                "Final documents",
              ].map((s, i) => (
                <p className="stage" key={s}>
                  <I name={i < (d.renewal === 5 ? 3 : 2) ? "check" : "clock"} />
                  {s}
                </p>
              ))}
              <small>Sample status · Updated October 15</small>
            </div>
          </Card>
          <Team />
        </div>
      </div>
    </>
  );
}
function Billing() {
  const p = usePortal(),
    d = p.data,
    amount = p.district.balance;
  return (
    <>
      <Head
        eyebrow="BILLING & PAYMENTS"
        title="Your financial account"
        sub={
          "Balances, payment activity, and statements for " +
          p.district.name +
          "."
        }
      />
      <div className="balance-hero">
        <span>Outstanding district balance</span>
        <h1>{usd(d.paid ? 0 : amount)}</h1>
        <p>
          {d.paid
            ? "Payment recorded in the demonstration."
            : "One invoice due October 30, 2026."}
        </p>
        <Btn secondary onClick={() => p.open("invoice")}>
          View invoice
        </Btn>
      </div>
      <Card title="Invoices & payment history">
        {[
          [
            p.org === "cedar" ? "INV-1842" : "PH-1035",
            "Deductible billing · October 2026",
            usd(amount),
            d.paid ? "Paid" : "Due Oct 30",
          ],
          [
            "INV-1690",
            "ASO billing · September 2026",
            usd(p.org === "cedar" ? 12180 : 7120),
            "Paid",
          ],
          [
            "INV-1518",
            "Deductible billing · August 2026",
            usd(p.org === "cedar" ? 9720 : 5400),
            "Paid",
          ],
        ].map(([n, s, v, t], i) => (
          <Row
            key={n}
            title={n + " · " + v}
            sub={s}
            tag={t}
            icon="wallet"
            onClick={() =>
              i === 0
                ? p.open("invoice")
                : p.open("document", n + " payment confirmation")
            }
          />
        ))}
      </Card>
      <Card title="Financial documents">
        <Row
          title="Contribution statement"
          sub="October 2026 · Account reporting"
          onClick={() => p.open("document", "Contribution statement")}
        />
      </Card>
    </>
  );
}
const docs = [
  "Property coverage summary",
  "Auto identification cards",
  "Renewal instructions",
  "Contribution statement",
  "Quarterly wage submission receipt",
  "Payment confirmation",
];
function Documents() {
  const p = usePortal(),
    [q, Q] = useState("");
  const list = (p.org === "cedar" ? docs : docs.slice(3)).concat(
    p.data.uploads.map((f) => f.name),
  );
  return (
    <>
      <Head
        eyebrow="DOCUMENTS"
        title="District document center"
        sub="Find the right version or attach a document to a district record."
        action={
          <Btn icon="upload" onClick={() => p.open("upload")}>
            Upload document
          </Btn>
        }
      />
      <Card title="Available documents">
        <div className="filterbar">
          <input
            aria-label="Search documents"
            placeholder="Search by name"
            value={q}
            onChange={(e) => Q(e.target.value)}
          />
        </div>
        {list
          .filter((n) => n.toLowerCase().includes(q.toLowerCase()))
          .map((n, i) => (
            <Row
              key={n + i}
              title={n}
              sub={
                p.data.uploads.find((f) => f.name === n)?.context ||
                "District document · Version 1.0 · October 2026"
              }
              tag="Preview"
              onClick={() => p.open("document", n)}
            />
          ))}
      </Card>
    </>
  );
}
export function LibraryScreen() {
  const p = usePortal(),
    history = p.resourceTab === "history";
  return (
    <>
      <Head
        eyebrow="RESOURCES & TRAINING"
        title="Learning for your district"
        sub="Guidance selected for your role and program participation."
        action={
          <Btn
            icon="plus"
            onClick={() => p.open("service", "Customized training")}
          >
            Request training
          </Btn>
        }
      />
      <div className="pill-tabs">
        {[
          ["recommended", "Recommended for you"],
          ["history", "Training history"],
        ].map(([id, t]) => (
          <button
            key={id}
            className={p.resourceTab === id ? "active" : ""}
            onClick={() => p.setResourceTab(id)}
          >
            {t}
          </button>
        ))}
      </div>
      {history ? (
        <Card title="Completed learning">
          {[
            ["Facilities risk review", "Oct 6 · Consultation · 2 hours"],
            ["Fleet safety fundamentals", "Sep 17 · Webinar · 1 hour"],
            ["Workers’ compensation essentials", "Aug 12 · Course · 1.5 hours"],
            ["Emergency preparedness", "Jun 9 · Workshop · 2 hours"],
          ].map(([t, s]) => (
            <Row
              key={t}
              title={t}
              sub={s}
              tag="Completed"
              onClick={() => p.open("document", t + " attendance record")}
            />
          ))}
        </Card>
      ) : (
        <div className="resource-grid">
          {[
            [
              "maintenance.jpg",
              "Property",
              "Campus maintenance checklist",
              p.data.config.audience,
              "checklist",
            ],
            [
              "buses.jpg",
              "Auto",
              "Keep your fleet ready for renewal",
              "Auto program members",
              "fleet",
            ],
            [
              "training.jpg",
              "Learning",
              "Plan training for your team",
              "Fund members",
              "training",
            ],
          ].map(([im, k, t, s, a]) => (
            <article className="card media-card" key={k}>
              <img
                src={"/assets/" + im}
                alt={
                  k === "Auto"
                    ? "District school buses"
                    : k === "Property"
                      ? "Facilities equipment maintenance"
                      : "A Fund expert presenting at a conference"
                }
              />
              <div className="pad">
                <div className="eyebrow">{k}</div>
                <h2>{t}</h2>
                <p>{s}</p>
                <Text
                  onClick={() =>
                    a === "checklist"
                      ? p.open("checklist")
                      : a === "fleet"
                        ? p.open("handoff", "Resolver")
                        : p.open("service", "Customized training")
                  }
                >
                  Explore
                </Text>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
function Guide() {
  const p = usePortal(),
    [group, G] = useState("All"),
    [q, Q] = useState("");
  const filtered = requirements.filter(
    (r) =>
      (group === "All" || r[2] === group) &&
      (r[0] + " " + r[1] + " " + r[4]).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <Head
        eyebrow="PRESENTATION GUIDE"
        title="TASB’s 45 requirements"
        sub="Jump from each RFP requirement to its corresponding prototype screen."
      />
      <div className="banner">
        <I name="info" />
        <span>
          All data is illustrative. Live identity, API exchange, payment
          processing, notifications, security enforcement, and compliance
          require implementation and validation.
        </span>
      </div>
      <Card
        title="Requirements map"
        action={<Tag>{filtered.length} of 45</Tag>}
      >
        <div className="filterbar">
          <input
            placeholder="Find a requirement"
            aria-label="Find requirement"
            value={q}
            onChange={(e) => Q(e.target.value)}
          />
          <select
            aria-label="Requirement group"
            value={group}
            onChange={(e) => G(e.target.value)}
          >
            {["All", ...new Set(requirements.map((r) => r[2]))].map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
        {filtered.map((r) => (
          <div className="require-row" key={r[0]}>
            <b>{String(r[0]).padStart(2, "0")}</b>
            <div>
              <strong>{r[1]}</strong>
              <small>{r[4]}</small>
            </div>
            <Tag color={r[5] ? "amber" : "teal"}>{r[5] || "Demo"}</Tag>
            <Text onClick={() => p.target(r[3])}>Show me</Text>
          </div>
        ))}
      </Card>
    </>
  );
}
function Other({ view }) {
  const p = usePortal(),
    d = p.data;
  if (view === "coverage")
    return (
      <>
        <Head
          eyebrow="COVERAGE"
          title="Your district’s coverage"
          sub="Active participation, renewal dates, and program documents."
          action={
            <Btn onClick={() => p.open("service", "Coverage information")}>
              Ask about coverage
            </Btn>
          }
        />
        <div className="coverage-grid">
          {programs.map((n, i) => (
            <Card key={n} title={n} action={<Tag color="green">Active</Tag>}>
              <div className="pad-topless">
                <p>Dec 1, 2025 – Nov 30, 2026 · CG-{i + 1}026</p>
                <Text
                  onClick={() => p.open("document", n + " coverage summary")}
                >
                  Program documents
                </Text>
              </div>
            </Card>
          ))}
        </div>
        <div className="actions">
          <Btn secondary onClick={() => p.go("renewals")}>
            Annual renewal
          </Btn>
          <Btn
            secondary
            onClick={() => p.open("service", "Certificate of coverage")}
          >
            Request certificate
          </Btn>
        </div>
      </>
    );
  if (view === "unemployment")
    return (
      <>
        <Head
          eyebrow="UNEMPLOYMENT COMPENSATION"
          title="Quarterly wage reporting"
          sub="Reporting periods, due dates, and correspondence in one place."
          action={
            <Btn secondary onClick={() => p.open("preferences")}>
              Reminder preferences
            </Btn>
          }
        />
        <Card title="Reporting periods">
          <div className="periods">
            {["Q1", "Q2", "Q3", "Q4"].map((q, i) => (
              <div key={q}>
                <strong>{q} 2026</strong>
                <Tag color={i < 2 ? "green" : "gray"}>
                  {i < 2
                    ? "Accepted"
                    : i === 2
                      ? d.wages
                        ? "Submitted"
                        : "Due Oct 31"
                      : "Upcoming"}
                </Tag>
              </div>
            ))}
          </div>
          <div className="pad-topless">
            <Btn onClick={() => p.open("wage")}>
              {d.wages ? "View confirmation" : "Continue Q3 submission"}
            </Btn>
          </div>
        </Card>
        <Card title="UC correspondence">
          <Row
            title="Quarterly reporting window open"
            sub="Received October 9, 2026 · Member notice"
            icon="mail"
            onClick={() => p.open("notice")}
          />
        </Card>
      </>
    );
  if (view === "contacts")
    return (
      <>
        <Head
          eyebrow="CONTACTS & REQUESTS"
          title="Your district and Fund team"
          sub="Keep contact records current and track who owns the next step."
          action={
            <Btn onClick={() => p.open("contactChange")}>
              Request contact change
            </Btn>
          }
        />
        <div className="details-grid">
          <div className="main-column">
            <Card title="District contacts">
              {d.contacts.map((c) => (
                <Row
                  key={c.email}
                  title={c.name}
                  sub={c.role + " · " + c.email}
                  icon="users"
                  onClick={() => p.open("contactChange", c.email)}
                />
              ))}
            </Card>
            <Card
              title="Service requests"
              action={
                <Text
                  onClick={() =>
                    p.open("service", "Loss prevention consultation")
                  }
                >
                  New request
                </Text>
              }
            >
              {d.requests.map((r) => (
                <Row
                  key={r.id}
                  title={r.type}
                  sub={r.id + " · " + r.route}
                  tag={r.status}
                  onClick={() => p.open("request", r.id)}
                />
              ))}
              <Row
                title="Certificate of coverage"
                sub="SR-104 · Coverage services"
                tag="With the Fund"
                onClick={() => p.open("request", "SR-104")}
              />
            </Card>
          </div>
          <Team />
        </div>
      </>
    );
  if (view === "services")
    return (
      <>
        <Head
          eyebrow="MEMBER SERVICES"
          title="Your connected services"
          sub="Find district applications, access requests, and public resources."
        />
        <div className="coverage-grid">
          {appList
            .filter(
              (n) =>
                p.org === "cedar" || ["UC Connections", "TASB.org"].includes(n),
            )
            .map((n, i) => {
              let needs = n === "Online training" && !d.extraAccess.includes(n);
              return (
                <Card
                  key={n}
                  title={n}
                  action={
                    <I
                      name={
                        ["chart", "building", "calendar", "book", "users"][i]
                      }
                    />
                  }
                >
                  <div className="pad-topless">
                    <p>
                      {needs
                        ? "Access approval required."
                        : "Available in your sample district context."}
                    </p>
                    <Text
                      onClick={() =>
                        p.open(needs ? "requestAccess" : "handoff", n)
                      }
                    >
                      {needs ? "Request access" : "Preview handoff"}
                    </Text>
                  </div>
                </Card>
              );
            })}
        </div>
        <div className="banner">
          <I name="book" />
          <span>Public coverage information remains on the Fund website.</span>
          <a href="https://www.tasbrmf.org/" target="_blank" rel="noreferrer">
            Visit public site ↗
          </a>
        </div>
      </>
    );
  if (view === "routing") {
    const records = [
      ...(!d.routed
        ? [{ id: "INC-CG-0042", location: "Cedar Grove Elementary" }]
        : []),
      ...d.claims.filter((c) => c.status === "District review"),
    ];
    return (
      <>
        <Head
          eyebrow="WORKERS’ COMPENSATION"
          title="District review queue"
          sub="Campus reports remain district incidents until an authorized coordinator submits them to the Fund."
        />
        <Card title="Awaiting review">
          {records.map((c) => (
            <Row
              key={c.id}
              title={"Campus injury report · " + c.id}
              sub={c.location}
              tag="District review"
              onClick={() => p.open("routeIncident", c.id)}
            />
          ))}
          {!records.length && (
            <p className="pad">No incidents awaiting review.</p>
          )}
        </Card>
      </>
    );
  }
  return (
    <>
      <Head
        eyebrow="MEMBER ACCESS"
        title="Sign in to your workspace"
        sub="Preview the organization sign-in handoff. No credentials are collected."
      />
      <Card title="Enterprise single sign-on">
        <div className="pad-topless">
          <Hint>
            The live portal would verify your identity and apply
            organization-specific permissions before opening protected services.
          </Hint>
          <Btn onClick={() => p.go("dashboard")}>
            Continue as Angela Mitchell
          </Btn>
        </div>
      </Card>
    </>
  );
}
export default function Screens({ view }) {
  switch (view) {
    case "dashboard":
      return <Dashboard />;
    case "tasks":
      return (
        <>
          <Head eyebrow="MY TASKS" title="Your next steps" />
          <TaskCard />
        </>
      );
    case "claims":
      return <Claims />;
    case "report":
      return <ClaimJourney />;
    case "renewals":
      return <Renewal />;
    case "billing":
      return <Billing />;
    case "documents":
      return <Documents />;
    case "resources":
      return <LibraryScreen />;
    case "requirements":
      return <Guide />;
    case "admin":
      return <Admin />;
    default:
      return <Other view={view} />;
  }
}
