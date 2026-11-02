"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { usePortal } from "./PortalContext";
import { navItems, routes, scopeAllows, taskList } from "../lib/model.mjs";
import { I } from "./UI";
import Dialogs from "./Dialogs";
export default function Shell({ children }) {
  const p = usePortal(),
    path = usePathname(),
    view = path.split("/")[1] || "dashboard",
    [menu, setMenu] = useState(false);
  useEffect(() => {
    setMenu(false);
  }, [path]);
  useEffect(() => {
    const fn = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        p.open("search");
      }
      if (e.key === "Escape") setMenu(false);
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [p]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {menu && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={"sidebar " + (menu ? "open" : "")}>
        <Link className="brand" href="/">
          <img src="/assets/tasb-logo.svg" alt="TASB Risk Management Fund" />
          <span>MEMBER WORKSPACE</span>
        </Link>
        <button className="organization" onClick={() => p.open("org")}>
          <span className="org-icon">
            <I name="building" />
          </span>
          <span>
            <strong>{p.district.name}</strong>
            <small>{p.district.role}</small>
          </span>
          <I name="chevrons" size={13} />
        </button>
        <nav aria-label="Member workspace">
          {navItems
            .filter(([v]) => scopeAllows(p.org, v))
            .map(([v, ic]) => (
              <Link
                key={v}
                className={view === v ? "active" : ""}
                aria-current={view === v ? "page" : undefined}
                href={v === "dashboard" ? "/" : "/" + v + "/"}
              >
                <I name={ic} />
                {routes[v]}
                {v === "tasks" && (
                  <span className="count">
                    {taskList(p.data, p.org).length}
                  </span>
                )}
              </Link>
            ))}
        </nav>
        <div className="present-links">
          <small>PRESENTATION TOOLS</small>
          {p.org === "cedar" && (
            <Link href="/admin/">Administration preview</Link>
          )}
          <Link href="/requirements/">
            Requirements guide <b>45</b>
          </Link>
        </div>
      </aside>
      <div className="app-shell">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            onClick={() => setMenu(!menu)}
            aria-label="Open navigation"
          >
            <I name="menu" />
          </button>
          <div className="breadcrumb">
            <span>My Fund</span>
            <I name="chevron" size={12} />
            <strong>{routes[view] || "Workspace"}</strong>
          </div>
          <div className="header-actions">
            <button
              className="search-trigger"
              aria-label="Search workspace"
              onClick={() => p.open("search")}
            >
              <I name="search" />
              <span>Search your workspace</span>
              <kbd>⌘ K</kbd>
            </button>
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              onClick={() => p.open("notices")}
            >
              <I name="bell" />
              {!p.data.read && <i />}
            </button>
            <button
              className="profile"
              onClick={() => p.open("org")}
              aria-label="Angela Mitchell, view district context"
            >
              AM
            </button>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          {scopeAllows(p.org, view) ? (
            children
          ) : (
            <div className="card pad">
              <h1>This area is outside your district role.</h1>
              <button
                className="btn btn-primary"
                onClick={() => p.go("dashboard")}
              >
                Open your workspace
              </button>
            </div>
          )}
        </main>
        <footer className="page-footer">
          <span>TASB Risk Management Fund · Experience concept</span>
          <span>Illustrative district data · October 15, 2026</span>
          <button onClick={() => p.open("reset")}>Reset demo</button>
        </footer>
      </div>
      {p.dialog && <Dialogs key={p.dialog.key} />}
      <div role="status" className={"toast " + (p.message ? "visible" : "")}>
        {p.message}
      </div>
    </>
  );
}
