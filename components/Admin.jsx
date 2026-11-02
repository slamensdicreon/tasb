"use client";
import { useState } from "react";
import { usePortal } from "./PortalContext";
import { Head, Card, Btn, Text, Tag, Field, Hint, Row, download } from "./UI";
export default function Admin() {
  const p = usePortal(),
    tab = p.adminTab,
    d = p.data,
    [cfg, C] = useState(() => ({ ...d.config }));
  const patch = (x) => C((prev) => ({ ...prev, ...x }));
  const save = () => {
    p.change((s) => ({
      ...s,
      config: { ...cfg },
      audit: [
        {
          action: "Updated " + tab + " configuration",
          detail: "Changed by TASB administrator",
        },
        ...s.audit,
      ],
    }));
    p.toast(
      "Configuration saved. Open the member workspace to see your changes.",
    );
  };
  const check = (label, k) => (
    <label className="check-field" key={k}>
      <input
        type="checkbox"
        checked={cfg[k]}
        onChange={(e) => patch({ [k]: e.target.checked })}
      />
      {label}
    </label>
  );
  const tabs = {
    overview: "Approvals",
    dashboard: "Dashboard",
    forms: "Forms & workflows",
    access: "Roles",
    notifications: "Notifications",
    content: "Content",
    audit: "Audit log",
  };
  return (
    <>
      <Head
        eyebrow="TASB ADMINISTRATION PREVIEW"
        title="Manage the member experience"
        sub="Make a local configuration change, then see what changes for a member."
        action={<Btn onClick={() => p.go("dashboard")}>Member workspace</Btn>}
      />
      <div className="pill-tabs">
        {Object.entries(tabs).map(([k, l]) => (
          <button
            className={tab === k ? "active" : ""}
            onClick={() => p.setAdminTab(k)}
            key={k}
          >
            {l}
          </button>
        ))}
      </div>
      <Card title={tabs[tab]}>
        {tab === "overview" ? (
          <>
            {d.requests.length ? (
              d.requests.map((r) => (
                <Row
                  key={r.id}
                  title={r.type + " · " + r.id}
                  sub={r.detail}
                  tag={r.status}
                  onClick={() => p.open("approve", r.id)}
                />
              ))
            ) : (
              <div className="pad">
                No new requests. Submit a contact change, application access
                request, or consultation request to see it here.
              </div>
            )}
            <div className="pad-topless">
              <Text onClick={() => p.go("contacts")}>
                Open contacts and requests
              </Text>
            </div>
          </>
        ) : tab === "access" ? (
          <>
            {Object.entries(d.roles).map(([n, rs]) => (
              <Row
                key={n}
                title={n + " · " + p.district.name}
                sub={rs.join(", ") || "No roles assigned"}
                onClick={() => p.open("roles", n)}
                icon="users"
              />
            ))}
            <Hint>
              Role changes are recorded in the sample audit log. Production
              authorization is outside the prototype.
            </Hint>
          </>
        ) : tab === "audit" ? (
          <div className="pad">
            {d.audit.length ? (
              d.audit.map((a, i) => (
                <div key={i} className="audit-row">
                  <strong>{a.action}</strong>
                  <small>{a.detail}</small>
                </div>
              ))
            ) : (
              <p>
                Save a configuration or role change to create an audit entry.
              </p>
            )}
            <Text
              onClick={() =>
                download("Audit log", JSON.stringify(d.audit, null, 2))
              }
            >
              Export change history
            </Text>
          </div>
        ) : (
          <div className="pad form-narrow">
            {tab === "dashboard" ? (
              <>
                <Field label="Task section title">
                  <input
                    value={cfg.taskTitle}
                    maxLength={50}
                    onChange={(e) => patch({ taskTitle: e.target.value })}
                  />
                </Field>
                {check("Show claims by program", "insight")}
                {check("Show recommended resources", "resources")}
              </>
            ) : tab === "forms" ? (
              <>
                {check(
                  "Add district reference field to claim intake",
                  "reference",
                )}
                <Field label="Field label">
                  <input
                    value={cfg.fieldLabel}
                    maxLength={60}
                    onChange={(e) => patch({ fieldLabel: e.target.value })}
                  />
                </Field>
                {check("Require district reference", "referenceRequired")}
                {check(
                  "Route campus injury reports through district review",
                  "routed",
                )}
                <Hint>
                  Save, then open Report a claim and continue to incident
                  details to try the field.
                </Hint>
              </>
            ) : tab === "notifications" ? (
              <>
                <p>Renewal reminder intervals before the deadline</p>
                <div className="actions">
                  {["90", "60", "30", "15", "7"].map((v) => (
                    <label key={v}>
                      <input
                        type="checkbox"
                        checked={cfg.intervals.includes(v)}
                        onChange={(e) =>
                          patch({
                            intervals: e.target.checked
                              ? [...cfg.intervals, v]
                              : cfg.intervals.filter((k) => k !== v),
                          })
                        }
                      />
                      {v} days
                    </label>
                  ))}
                </div>
                {check("Email channel", "email")}
                {check("Portal notification channel", "portal")}
                <Text onClick={() => p.open("emailPreview")}>
                  Preview saved reminder
                </Text>
              </>
            ) : (
              <>
                <Field label="Facilities checklist audience">
                  <select
                    value={cfg.audience}
                    onChange={(e) => patch({ audience: e.target.value })}
                  >
                    {[
                      "Property program members",
                      "All Fund members",
                      "Public website",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Hint>
                  Public guidance and protected member records have distinct
                  destinations. This setting changes the sample resource
                  presentation.
                </Hint>
              </>
            )}
            <div className="actions">
              <Btn
                onClick={save}
                disabled={!cfg.taskTitle.trim() || !cfg.fieldLabel.trim()}
              >
                Save configuration
              </Btn>
              {tab === "forms" && (
                <Text onClick={() => p.go("report")}>Preview claim form</Text>
              )}
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
