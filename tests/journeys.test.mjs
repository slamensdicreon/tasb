import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  newStore,
  freshData,
  validate,
  newClaim,
  taskList,
  resolveTarget,
  scopeAllows,
  routes,
} from "../lib/model.mjs";

function storm() {
  const district = freshData();
  Object.assign(district.draft, {
    campus: "Cedar Grove Elementary",
    date: "2026-10-14",
    description: "Hail damaged the west classroom wing.",
    files: ["Roof photos.jpg"],
  });
  return district;
}

test("a complete storm report produces a claim receipt and preserves the attachment list", () => {
  const d = storm();
  assert.equal(validate(d.draft, d.config), "");
  const claim = newClaim(d);
  assert.match(claim.id, /^PROP-2026-/);
  assert.equal(claim.status, "Received");
  d.draft.files.length = 0;
  assert.deepEqual(claim.files, ["Roof photos.jpg"]);
});

test("an injury report enters district review only when the routing rule is active", () => {
  const d = storm();
  d.draft.type = "Workers’ compensation";
  assert.equal(newClaim(d).status, "District review");
  assert.match(newClaim(d).id, /^INC-/);
  d.config.routed = false;
  assert.equal(newClaim(d).status, "Received");
  assert.match(newClaim(d).id, /^WC-/);
});

test("report validation respects a configured field, reporting date and contact", () => {
  const d = storm();
  Object.assign(d.config, {
    reference: true,
    referenceRequired: true,
    fieldLabel: "Work order",
  });
  assert.match(validate(d.draft, d.config), /work order/);
  d.draft.reference = "WO-205";
  assert.equal(validate(d.draft, d.config), "");
  assert.match(validate({ ...d.draft, date: "2026-10-16" }, d.config), /date/);
  assert.match(
    validate({ ...d.draft, email: "not-an-address" }, d.config),
    /email/,
  );
});

test("completed work changes the right district’s task list and respects the second role", () => {
  const {
    districts: { cedar, pine },
  } = newStore();
  cedar.wages = true;
  assert.equal(
    taskList(cedar, "cedar").some(([key]) => key === "wages"),
    false,
  );
  assert.equal(
    taskList(pine, "pine").some(([key]) => key === "wages"),
    true,
  );
  assert.equal(scopeAllows("pine", "admin"), false);
  assert.equal(scopeAllows("pine", "billing"), true);
});

test("the 45 ordered requirements each point to a real application screen", () => {
  const rows = JSON.parse(
    readFileSync(new URL("../lib/requirements.json", import.meta.url), "utf8"),
  );
  assert.deepEqual(
    rows.map(([id]) => id),
    Array.from({ length: 45 }, (_, i) => i + 1),
  );
  for (const [id, , , target] of rows)
    assert.ok(
      routes[resolveTarget(target)[0]],
      "Missing screen for requirement " + id,
    );
});
