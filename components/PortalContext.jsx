"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import claimsSeed from "../lib/claims.json";
import { newStore, districts, resolveTarget } from "../lib/model.mjs";
const C = createContext(null),
  key = "tasb-next-workspace-v2";
export function PortalProvider({ children }) {
  const router = useRouter(),
    [store, setStore] = useState(newStore),
    [ready, setReady] = useState(false),
    [dialog, setDialog] = useState(null),
    [message, setMessage] = useState(""),
    [adminTab, setAdminTab] = useState("overview"),
    [resourceTab, setResourceTab] = useState("recommended");
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(key));
      if (s?.districts?.cedar?.config && s?.districts?.pine && districts[s.org])
        setStore(s);
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(key, JSON.stringify(store));
      } catch {}
  }, [store, ready]);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 3300);
    return () => clearTimeout(t);
  }, [message]);
  const org = store.org,
    data = store.districts[org],
    district = districts[org];
  const change = (fn) =>
    setStore((s) => ({
      ...s,
      districts: { ...s.districts, [s.org]: fn(s.districts[s.org]) },
    }));
  const open = (type, arg = "") => setDialog({ type, arg, key: Math.random() });
  const go = (v) => {
    setDialog(null);
    router.push(v === "dashboard" ? "/" : "/" + v + "/");
  };
  const switchOrg = (v) => {
    setStore((s) => ({ ...s, org: v }));
    go("dashboard");
  };
  const allClaims =
    org === "cedar"
      ? [
          ...data.claims,
          ...claimsSeed.map((c) =>
            c.id === "WC-2026-0284" && data.docReceived
              ? { ...c, status: "In review" }
              : c,
          ),
        ]
      : [];
  const request = (type, detail, route, extra = {}) => {
    const id = "SR-" + (105 + data.requests.length);
    change((d) => ({
      ...d,
      requests: [
        { id, type, detail, route, status: "With the Fund", ...extra },
        ...d.requests,
      ],
    }));
    setMessage("Request " + id + " recorded.");
    return id;
  };
  const target = (t) => {
    const [view, act, arg] = resolveTarget(t);
    if (org === "pine" && view !== "requirements")
      setStore((s) => ({ ...s, org: "cedar" }));
    go(view);
    if (act === "tab") setAdminTab(arg);
    else if (act === "history") setResourceTab("history");
    else if (act) open(act, arg);
  };
  const reset = () => {
    setStore(newStore());
    setAdminTab("overview");
    setResourceTab("recommended");
    go("dashboard");
    setMessage("Demo restored to its starting state.");
  };
  return (
    <C.Provider
      value={{
        org,
        data,
        district,
        allClaims,
        change,
        go,
        open,
        dialog,
        close: () => setDialog(null),
        message,
        toast: setMessage,
        switchOrg,
        request,
        target,
        reset,
        adminTab,
        setAdminTab,
        resourceTab,
        setResourceTab,
      }}
    >
      {children}
    </C.Provider>
  );
}
export const usePortal = () => useContext(C);
