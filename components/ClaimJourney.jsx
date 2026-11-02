"use client";
import { useState } from "react";
import { usePortal } from "./PortalContext";
import { programs, validate, newClaim, freshDraft } from "../lib/model.mjs";
import { I, Btn, Head, Card, Field, Hint, Text, Tag } from "./UI";
export default function ClaimJourney() {
  const p = usePortal(),
    d = p.data.draft,
    [error, E] = useState(""),
    [confirmed, C] = useState(false),
    [receipt, R] = useState(null);
  const patch = (x) => p.change((s) => ({ ...s, draft: { ...s.draft, ...x } }));
  function next() {
    E("");
    if (d.step === 2) {
      const msg = validate(d, p.data.config);
      if (msg) return E(msg);
    }
    if (d.step < 4) {
      patch({ step: d.step + 1 });
      return;
    }
    if (!confirmed) return E("Confirm that you reviewed the report.");
    const msg = validate(d, p.data.config);
    if (msg) {
      patch({ step: 2 });
      return E(msg);
    }
    const c = newClaim(p.data);
    p.change((s) => ({
      ...s,
      claims: [c, ...s.claims],
      draft: freshDraft(),
      read: false,
    }));
    R(c);
  }
  function example() {
    const desc = {
      Property:
        "A hailstorm damaged the roof above the west classroom wing. Facilities staff documented water intrusion in two rooms and secured the affected area.",
      Auto: "A district bus sustained body damage in a low-speed collision. The transportation supervisor documented the incident.",
      "Workers’ compensation":
        "A campus employee reported an injury while moving classroom supplies. The district coordinator has received the initial report.",
      Liability:
        "A visitor incident was reported on district property. Staff documented the location and initial details.",
      Cyber:
        "The district technology team detected suspicious account activity and secured the affected account.",
    };
    patch({
      campus: p.district.campus,
      date: "2026-10-14",
      description: desc[d.type],
      reference: "CG-FAC-1042",
    });
    E("");
  }
  function files(list) {
    let added = [],
      fail = [];
    for (const f of list) {
      if (
        f.size > 200 * 1024 * 1024 ||
        !/\.(pdf|jpe?g|png|webp|docx?|xlsx?|csv|txt|mov|mp4)$/i.test(f.name)
      )
        fail.push(f.name);
      else if (!d.files.includes(f.name) && !added.includes(f.name))
        added.push(f.name);
    }
    patch({ files: [...d.files, ...added] });
    E(fail.length ? "Unsupported or over 200 MB: " + fail.join(", ") : "");
  }
  if (receipt)
    return (
      <Card cls="success-card">
        <div className="success-icon">
          <I name="check" size={30} />
        </div>
        <div className="eyebrow">REPORT CONFIRMATION</div>
        <h1>
          {receipt.status === "District review"
            ? "Your incident is with the district coordinator."
            : "Your claim has been received."}
        </h1>
        <p>
          {receipt.id} · {receipt.location}
        </p>
        <Tag color="green">{receipt.status}</Tag>
        <div className="hint">
          {receipt.status === "District review"
            ? "The coordinator reviews the incident before sending a Fund claim."
            : "Your Fund team will review the details. Updates appear in your workspace."}
        </div>
        <div className="button-row">
          <Btn onClick={() => p.open("claim", receipt.id)}>
            View report details
          </Btn>
          <Btn secondary onClick={() => p.go("dashboard")}>
            Return to dashboard
          </Btn>
        </div>
        <p className="fine">Demonstration only. No claim was sent.</p>
      </Card>
    );
  return (
    <div className="workflow-shell">
      <Head
        eyebrow="CLAIM REPORTING"
        title="Report an incident"
        sub="Tell us what happened. Your progress is saved in this browser."
        action={
          <Text
            onClick={() => {
              p.go("dashboard");
              p.toast("Draft saved. Resume it from your dashboard.");
            }}
          >
            Save & finish later
          </Text>
        }
      />
      <ol className="stepper">
        {["Coverage", "Incident details", "Documents", "Review"].map((s, i) => (
          <li
            key={s}
            className={
              d.step === i + 1 ? "active" : d.step > i + 1 ? "complete" : ""
            }
          >
            <span className="step-number">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      <div className="workflow-grid">
        <section className="card form-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              next();
            }}
            noValidate
          >
            {d.step === 1 ? (
              <>
                <h2>What would you like to report?</h2>
                <p className="intro">
                  Choose one of your district’s participating coverage programs.
                </p>
                <div className="claim-types">
                  {programs.map((t, i) => (
                    <button
                      type="button"
                      className={
                        "claim-type " + (t === d.type ? "selected" : "")
                      }
                      onClick={() => patch({ type: t })}
                      aria-pressed={t === d.type}
                      key={t}
                    >
                      <span className="type-icon">
                        <I
                          name={
                            ["building", "heart", "car", "shield", "lock"][i]
                          }
                        />
                      </span>
                      <strong>{t}</strong>
                    </button>
                  ))}
                </div>
              </>
            ) : d.step === 2 ? (
              <>
                <h2>Tell us about the incident.</h2>
                <p className="intro">
                  Provide the details you have so the right team can follow up.
                </p>
                <Text onClick={example}>
                  Use example {d.type === "Property" ? "storm damage " : ""}
                  details
                </Text>
                <div className="form-row">
                  <Field label="Campus or location">
                    <select
                      value={d.campus}
                      onChange={(e) => patch({ campus: e.target.value })}
                    >
                      <option value="">Select a location</option>
                      {[
                        p.district.campus,
                        "Cedar Grove Middle School",
                        "Cedar Grove High School",
                        "District administration",
                        "Transportation services",
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Incident date">
                    <input
                      type="date"
                      max="2026-10-15"
                      value={d.date}
                      onChange={(e) => patch({ date: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="What happened?">
                  <textarea
                    value={d.description}
                    onChange={(e) => patch({ description: e.target.value })}
                    maxLength={3000}
                  />
                </Field>
                <div className="form-row">
                  {[
                    ["contact", "Contact name"],
                    ["email", "Email address"],
                  ].map(([k, l]) => (
                    <Field key={k} label={l}>
                      <input
                        value={d[k]}
                        type={k === "email" ? "email" : "text"}
                        onChange={(e) => patch({ [k]: e.target.value })}
                      />
                    </Field>
                  ))}
                </div>
                {p.data.config.reference && (
                  <Field
                    label={
                      p.data.config.fieldLabel +
                      (p.data.config.referenceRequired
                        ? " (required)"
                        : " (optional)")
                    }
                  >
                    <input
                      value={d.reference}
                      onChange={(e) => patch({ reference: e.target.value })}
                    />
                  </Field>
                )}
                {d.type === "Workers’ compensation" && p.data.config.routed && (
                  <Hint>
                    Your district coordinator reviews this incident before it
                    becomes a Fund claim.
                  </Hint>
                )}
              </>
            ) : d.step === 3 ? (
              <>
                <h2>Add supporting documents.</h2>
                <p>
                  Photos and reports are optional. Use sample files during your
                  presentation.
                </p>
                <Field label="Choose files (up to 200 MB each)">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => files(Array.from(e.target.files || []))}
                  />
                </Field>
                <div className="actions">
                  {[
                    "Incident report.pdf",
                    d.type === "Property"
                      ? "Roof damage photos.jpg"
                      : "Incident photos.jpg",
                  ].map((n) => (
                    <Btn
                      key={n}
                      secondary
                      onClick={() => files([{ name: n, size: 5000 }])}
                    >
                      Add sample {n}
                    </Btn>
                  ))}
                </div>
                {d.files.map((n) => (
                  <div className="file-item" key={n}>
                    <I name="file" />
                    <strong>{n}</strong>
                    <button
                      type="button"
                      aria-label={"Remove " + n}
                      onClick={() =>
                        patch({ files: d.files.filter((v) => v !== n) })
                      }
                    >
                      <I name="x" />
                    </button>
                  </div>
                ))}
                <Hint>
                  Only attachment names are retained. No files are uploaded.
                </Hint>
              </>
            ) : (
              <>
                <h2>Review your report</h2>
                <dl className="review-dl">
                  {[
                    ["District", p.district.name],
                    ["Program", d.type],
                    ["Location", d.campus],
                    ["Incident date", d.date],
                    ["Description", d.description],
                    ["Contact", d.contact + " · " + d.email],
                    ...(p.data.config.reference
                      ? [
                          [
                            p.data.config.fieldLabel,
                            d.reference || "Not supplied",
                          ],
                        ]
                      : []),
                    ["Documents", d.files.join(", ") || "None included"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                <Text onClick={() => patch({ step: 2 })}>
                  Edit incident details
                </Text>
                <label className="check-field">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => C(e.target.checked)}
                  />
                  I have reviewed this demonstration report.
                </label>
                <Hint>No claim or information is sent to TASB.</Hint>
              </>
            )}
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
            <div className="workflow-bottom">
              {d.step > 1 ? (
                <Btn
                  secondary
                  onClick={() => {
                    patch({ step: d.step - 1 });
                    E("");
                  }}
                >
                  Back
                </Btn>
              ) : (
                <span>{p.district.name}</span>
              )}
              <Btn type="submit" icon={d.step === 4 ? "check" : "arrow"}>
                {d.step === 4 ? "Submit demo report" : "Continue"}
              </Btn>
            </div>
          </form>
        </section>
        <aside className="card workflow-aside">
          <img src="/assets/campus.jpg" alt="School campus" />
          <div className="eyebrow">YOUR DISTRICT</div>
          <h3>{p.district.name}</h3>
          <Tag color="green">{d.type}</Tag>
          <p>
            Your program and reporting responsibilities determine where this
            report goes next.
          </p>
          <Text onClick={() => p.open("support")}>Contact your Fund team</Text>
        </aside>
      </div>
    </div>
  );
}
