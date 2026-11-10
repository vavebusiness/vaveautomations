import test from "node:test";
import assert from "node:assert/strict";
import { reviewBatch, approveForManualExport } from "./intake.mjs";
const valid = (override = {}) => ({
  eventId: "evt-001", clientRef: "DEMO-ACME",
  filename: "masked-invoice.pdf", fileHash: "aabbccdd00112233",
  documentType: "invoice", receivedAt: "2026-11-10T10:00:00Z",
  ...override
});
test("valid synthetic document stays pending human approval", () => {
  const out = reviewBatch([valid()]);
  assert.equal(out.counts.needs_human_approval, 1);
  assert.equal(out.results[0].status, "needs_human_approval");
});
test("same event id does not get processed twice", () => {
  const out = reviewBatch([valid(), valid({ fileHash: "11223344aabbccdd" })]);
  assert.equal(out.results[1].status, "duplicate");
  assert.deepEqual(out.results[1].reasons, ["event_seen"]);
});
test("different event with same file hash for same client is a duplicate", () => {
  const out = reviewBatch([valid(), valid({ eventId: "evt-002" })]);
  assert.equal(out.results[1].status, "duplicate");
  assert.deepEqual(out.results[1].reasons, ["file_seen_for_client"]);
});
test("same file fingerprint across different clients is not automatically a duplicate", () => {
  const out = reviewBatch([valid(), valid({ eventId: "evt-002", clientRef: "DEMO-BETA" })]);
  assert.equal(out.counts.needs_human_approval, 2);
});
test("incomplete input goes to review, not downstream output", () => {
  const out = reviewBatch([valid({ clientRef: "" })]);
  assert.equal(out.results[0].status, "needs_review");
  assert.ok(out.results[0].reasons.includes("missing_required_field"));
});
test("unsupported file type is held for review", () => {
  const out = reviewBatch([valid({ filename: "malicious.exe" })]);
  assert.equal(out.results[0].status, "needs_review");
  assert.ok(out.results[0].reasons.includes("unsupported_extension"));
});
test("invalid hash and malformed timestamp are held for review", () => {
  const out = reviewBatch([valid({ fileHash: "x", receivedAt: "yesterday" })]);
  assert.equal(out.results[0].status, "needs_review");
  assert.equal(out.results[0].reasons.length, 2);
});
test("missing or invalid document objects are handled safely", () => {
  const out = reviewBatch([null, [], valid({ documentType: "custom_unknown" })]);
  assert.equal(out.counts.needs_review, 3);
});
test("approval is manual and requires reviewer identity", () => {
  const entry = reviewBatch([valid()]).results[0];
  assert.throws(() => approveForManualExport(entry, ""), /reviewer/i);
  const approved = approveForManualExport(entry, "Synthetic Reviewer");
  assert.equal(approved.status, "approved_for_manual_export");
  assert.equal(approved.approvedBy, "Synthetic Reviewer");
  assert.equal(entry.status, "needs_human_approval");
});
test("duplicate and incomplete documents cannot be approved", () => {
  const out = reviewBatch([valid(), valid(), valid({ eventId: "evt-003", fileHash: "" })]);
  assert.throws(() => approveForManualExport(out.results[1], "Reviewer"), /Only reviewed/);
  assert.throws(() => approveForManualExport(out.results[2], "Reviewer"), /Only reviewed/);
});
test("past fingerprints prevent reprocessing across batches when passed in", () => {
  const previous = reviewBatch([valid()]);
  const next = reviewBatch([valid({ eventId: "evt-098" })], {
    seenEventIds: previous.seenEventIds,
    seenFileKeys: previous.seenFileKeys
  });
  assert.equal(next.results[0].status, "duplicate");
});
test("case and whitespace normalization prevent duplicate IDs", () => {
  const out = reviewBatch([valid(), valid({eventId:"  EVT-001 " , fileHash:"ffffffff12341234"})]);
  assert.equal(out.counts.duplicate, 1);
});
test("does not mutate source records", () => {
  const original = valid();
  const snapshot = structuredClone(original);
  reviewBatch([original]);
  assert.deepEqual(original, snapshot);
});
