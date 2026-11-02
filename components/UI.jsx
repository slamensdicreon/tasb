"use client";
import icons from "../lib/icons.json";
export function I({ name, size = 18 }) {
  return (
    <svg
      className="icon"
      style={{ width: size, height: size }}
      viewBox="0 0 24 24"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icons[name] || icons.file }}
    />
  );
}
export function Btn({
  children,
  icon,
  onClick,
  secondary = false,
  disabled = false,
  type = "button",
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={"btn " + (secondary ? "btn-secondary" : "btn-primary")}
      onClick={onClick}
    >
      {icon && <I name={icon} size={16} />} {children}
    </button>
  );
}
export function Text({ children, onClick }) {
  return (
    <button type="button" className="text-button" onClick={onClick}>
      {children} <I name="arrow" size={13} />
    </button>
  );
}
export function Head({ eyebrow, title, sub, action }) {
  return (
    <div className="page-title">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {action}
    </div>
  );
}
export function Card({ title, sub, action, children, cls = "" }) {
  return (
    <section className={"card " + cls}>
      {title && (
        <div className="card-head">
          <div>
            <h2>{title}</h2>
            {sub && <p>{sub}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function Tag({ children, color = "gray" }) {
  return <span className={"tag " + color}>{children}</span>;
}
export function Row({ title, sub, icon = "file", tag, onClick }) {
  return (
    <button className="row" type="button" onClick={onClick}>
      <span className="task-symbol">
        <I name={icon} />
      </span>
      <span className="task-content">
        <strong>{title}</strong>
        <small>{sub}</small>
      </span>
      {tag && <Tag>{tag}</Tag>}
      <I name="chevron" size={14} />
    </button>
  );
}
export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Hint({ children }) {
  return (
    <div className="hint">
      <I name="info" size={16} />
      <span>{children}</span>
    </div>
  );
}
export function download(name, body) {
  const a = document.createElement("a"),
    url = URL.createObjectURL(
      new Blob(
        [
          "ILLUSTRATIVE SAMPLE · NOT VALID FOR OFFICIAL USE\nTASB member experience prototype\n\n" +
            name +
            "\n\n" +
            body +
            "\n\nNo transaction took place.",
        ],
        { type: "text/plain;charset=utf-8" },
      ),
    );
  a.href = url;
  a.download = "DEMO-" + name.replace(/[^a-z0-9]+/gi, "-") + ".txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
