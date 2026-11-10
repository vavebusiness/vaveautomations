/**
 * Vave Automations: synthetic-only document-intake review gate.
 * No network, file uploads, email, customer data, or production integration.
 */
const supportedExtensions = new Set(["pdf", "png", "jpg", "jpeg"]);
const supportedTypes = new Set(["invoice", "receipt", "other"]);
const clean = (value) => typeof value === "string" ? value.trim() : "";
const validUTC = value => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().replace(".000Z", "Z") === value;

export function reviewBatch(records, { seenEventIds = [], seenFileKeys = [] } = {}) {
  if (!Array.isArray(records)) throw new TypeError("records must be an array");
  const eventIds = new Set([...seenEventIds].map(x => clean(x).toLowerCase()));
  const fileKeys = new Set([...seenFileKeys].map(x => clean(x).toLowerCase()));
  const results = [];
  for (const [index, record] of records.entries()) {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      results.push({ index, status: "needs_review", reasons: ["record_not_object"] });
      continue;
    }
    const eventId = clean(record.eventId).toLowerCase();
    const clientRef = clean(record.clientRef).toLowerCase();
    const filename = clean(record.filename);
    const fileHash = clean(record.fileHash).toLowerCase();
    const documentType = clean(record.documentType).toLowerCase();
    const receivedAt = clean(record.receivedAt);
    const reasons = [];
    if (!eventId || !clientRef || !filename || !fileHash || !documentType || !receivedAt) reasons.push("missing_required_field");
    if (filename && !supportedExtensions.has(filename.split(".").pop().toLowerCase())) reasons.push("unsupported_extension");
    if (fileHash && !/^[a-f0-9]{8,64}$/.test(fileHash)) reasons.push("invalid_file_fingerprint");
    if (documentType && !supportedTypes.has(documentType)) reasons.push("unsupported_document_type");
    if (receivedAt && !validUTC(receivedAt)) reasons.push("invalid_received_timestamp");
    if (reasons.length) {
      results.push({ index, eventId: eventId || null, status: "needs_review", reasons });
      continue;
    }
    const fileKey = clientRef + "::" + fileHash;
    if (eventIds.has(eventId) || fileKeys.has(fileKey)) {
      results.push({ index, eventId, status: "duplicate", reasons: [eventIds.has(eventId) ? "event_seen" : "file_seen_for_client"] });
      continue;
    }
    eventIds.add(eventId);
    fileKeys.add(fileKey);
    results.push({ index, eventId, clientRef, filename, documentType, receivedAt, status: "needs_human_approval", reasons: [] });
  }
  const counts = Object.fromEntries(["needs_human_approval", "needs_review", "duplicate"].map(s => [s, results.filter(r => r.status === s).length]));
  return { results, counts, seenEventIds: [...eventIds], seenFileKeys: [...fileKeys] };
}
export function approveForManualExport(item, reviewerId) {
  if (!item || item.status !== "needs_human_approval") throw new Error("Only reviewed, nonduplicate records may be approved");
  if (!clean(reviewerId)) throw new Error("A named reviewer is required");
  return { ...item, status: "approved_for_manual_export", approvedBy: clean(reviewerId) };
}
