window.HQ_DATA = {
  "lastReviewed": "2026-11-02",
  "sourceAsOf": "2026-11-02",
  "confidentiality": "Public-safe operational overview. No contact details, private client correspondence or credentials.",
  "organization": {
    "name": "Vave Automations",
    "mission": "Identify costly, repetitive work and build custom workflow automations and integrations tailored to verified requirements.",
    "offering": "Custom Make, n8n, API, AI and Google Workspace integration work; not a fixed one-size-fits-all package.",
    "northStar": "First verified, successfully delivered paid client project.",
    "integrity": "Do not count research as demand, messages as clients, or prototypes as customer deployments."
  },
  "links": {
    "crm": "https://docs.google.com/spreadsheets/d/1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c/edit",
    "prototype": "https://docs.google.com/document/d/1EbjnZrpm35dSd9IOccpnFjrpxUOx3dozcZmEx8I-r8Q/edit",
    "pilot": "https://docs.google.com/document/d/1LUhI5zGGrZk-i4SelQBEOPazphIzHi1MF0WbY18V6kk/edit",
    "qa": "https://docs.google.com/document/d/1fHRhk858xgoHnDW5lw89yQ7nJiv1zx62nGbMsO8osG0/edit",
    "aam": "https://docs.google.com/document/d/13tgAneS04GTacWGEomQ9gXPHH4XLMe4TUkVX-Pd9lfE/edit",
    "make": "https://eu2.make.com/",
    "github": "https://github.com/vavebusiness/vaveautomations"
  },
  "datasets": [
    {
      "name": "Dashboard",
      "gid": 2070423,
      "purpose": "Executive KPIs, funnel counts, priority actions",
      "owner": "Command Center",
      "kind": "Google Sheets"
    },
    {
      "name": "Opportunities",
      "gid": 2070421,
      "purpose": "Opportunity status, source evidence, next action",
      "owner": "Client Acquisition / Sales",
      "kind": "Google Sheets"
    },
    {
      "name": "Sent Outreach",
      "gid": 1369675266,
      "purpose": "Send log, follow-ups, delivery status",
      "owner": "Client Acquisition",
      "kind": "Google Sheets"
    },
    {
      "name": "No Contact",
      "gid": 2070425,
      "purpose": "Suppression ledger for addresses and domains",
      "owner": "Operations",
      "kind": "Google Sheets"
    },
    {
      "name": "Safety Audit",
      "gid": 2070426,
      "purpose": "High-risk controls, exceptions and checkpoints",
      "owner": "Operations",
      "kind": "Google Sheets"
    },
    {
      "name": "First Client Sprint",
      "gid": 2070424,
      "purpose": "Priority deal and buyer-action queue",
      "owner": "Sales",
      "kind": "Google Sheets"
    },
    {
      "name": "Master Checklist",
      "gid": 2070427,
      "purpose": "Operating tasks, owners, status and evidence",
      "owner": "Command Center",
      "kind": "Google Sheets"
    },
    {
      "name": "Sales Playbook",
      "gid": 2070422,
      "purpose": "Discovery, pricing, proposals and follow-ups",
      "owner": "Sales",
      "kind": "Google Sheets"
    },
    {
      "name": "200 Lead Launch Board",
      "gid": 196261030,
      "purpose": "Research slots; not a verified buyer roster",
      "owner": "Client Acquisition",
      "kind": "Google Sheets"
    }
  ],
  "kpis": [
    {
      "key": "acceptedMessages",
      "label": "Accepted Gmail messages",
      "value": 183,
      "sub": "Includes follow-ups and responses"
    },
    {
      "key": "distinctRecipients",
      "label": "Distinct recipients",
      "value": 179,
      "sub": "Historical contact addresses"
    },
    {
      "key": "awaitingReply",
      "label": "Awaiting response",
      "value": 158,
      "sub": "CRM stage count"
    },
    {
      "key": "positiveConversations",
      "label": "Positive conversations",
      "value": 2,
      "sub": "Neither is a paid engagement"
    },
    {
      "key": "opportunityRecords",
      "label": "Opportunity records",
      "value": 252,
      "sub": "Many are research-only"
    },
    {
      "key": "researchOnly",
      "label": "Explicit research-only",
      "value": 176,
      "sub": "Not confirmed buyer demand"
    },
    {
      "key": "bouncedAddresses",
      "label": "Historical bounces",
      "value": 8,
      "sub": "Suppress before all outreach"
    },
    {
      "key": "verifiedPayingClients",
      "label": "Paying clients",
      "value": 0,
      "sub": "Only verified revenue counts"
    }
  ],
  "pipeline": [
    {
      "id": "OP-01",
      "account": "Accounting document-intake buyer",
      "type": "Direct buyer",
      "stage": "Replied",
      "priority": "P0",
      "signal": "Explicit manual document sorting + completeness problem",
      "last": "2026-10-26",
      "next": "Await buyer response; obtain tools, volume, exceptions and budget",
      "owner": "Sales",
      "confidence": "Confirmed need; scope unknown",
      "privateRef": "First Client Sprint"
    },
    {
      "id": "OP-02",
      "account": "Regional web/integration agency",
      "type": "Potential partner",
      "stage": "Nurture",
      "priority": "P1",
      "signal": "Requested accurate prototype explanation; no project offered",
      "last": "2026-10-22",
      "next": "Await inbound opportunity; no pressure",
      "owner": "Partnerships",
      "confidence": "Conversation confirmed, no purchase",
      "privateRef": "Opportunities"
    },
    {
      "id": "OP-03",
      "account": "Make Community troubleshooting buyer",
      "type": "Direct buyer",
      "stage": "Contacted",
      "priority": "P1",
      "signal": "Public request to pay for Make troubleshooting",
      "last": "2026-10-19",
      "next": "Wait for response to existing public reply",
      "owner": "Acquisition",
      "confidence": "Public demand; buyer engagement unverified",
      "privateRef": "Opportunities"
    },
    {
      "id": "OP-04",
      "account": "Make Community content integration buyer",
      "type": "Direct buyer",
      "stage": "Contacted",
      "priority": "P1",
      "signal": "Keyword-to-WordPress automation request",
      "last": "2026-10-19",
      "next": "Wait for response; no duplicate pitch",
      "owner": "Acquisition",
      "confidence": "Public demand; buyer engagement unverified",
      "privateRef": "Opportunities"
    },
    {
      "id": "OP-05",
      "account": "ERP implementation agency",
      "type": "Potential partner",
      "stage": "Lost",
      "priority": "Hold",
      "signal": "Confirmed internal team and no current subcontract need",
      "last": "2026-10-23",
      "next": "No further outreach",
      "owner": "Partnerships",
      "confidence": "Closed by verified response",
      "privateRef": "Opportunities"
    },
    {
      "id": "OP-06",
      "account": "Automation white-label opportunity",
      "type": "Potential partner",
      "stage": "Research",
      "priority": "Hold",
      "signal": "Portfolio requirements exceed verified work",
      "last": "2026-10-19",
      "next": "Do not overstate experience or bypass forum access",
      "owner": "Partnerships",
      "confidence": "Not contacted",
      "privateRef": "Opportunities"
    }
  ],
  "workflows": [
    {
      "id": "WF-01",
      "name": "RentRoll PDF Underwriter",
      "system": "Make",
      "scenarioId": 9888191,
      "status": "Inactive",
      "category": "Company prototype",
      "lastEdit": "2026-10-01",
      "trigger": "Google Drive polling",
      "steps": [
        "Watch Google Drive folder",
        "Download PDF files",
        "Gemini structured extraction",
        "Parse JSON",
        "Iterate extracted units",
        "Write rows to Google Sheets"
      ],
      "validation": "CRM notes four successful prototype runs on 1 Oct; no verified production accuracy.",
      "risk": "Financial document integrity, missing pages, duplicates and exception handling",
      "next": "Test only with approved samples after scoped client need; no activation now",
      "lastCredits": 407
    },
    {
      "id": "WF-02",
      "name": "RentRoll Resource Setup",
      "system": "Make",
      "scenarioId": 9888170,
      "status": "Inactive",
      "category": "Prototype helper",
      "lastEdit": "2026-09-29",
      "trigger": "On demand",
      "steps": [
        "Prepare spreadsheet headers",
        "Drive folder setup modules currently disabled"
      ],
      "validation": "Configuration inspected; not run during this audit.",
      "risk": "Do not accidentally overwrite client-owned destinations",
      "next": "Retain inactive; use only during approved setup",
      "lastCredits": null
    },
    {
      "id": "WF-03",
      "name": "RentRoll Test File Uploader",
      "system": "Make",
      "scenarioId": 9888199,
      "status": "Inactive",
      "category": "QA helper",
      "lastEdit": "2026-09-30",
      "trigger": "On demand",
      "steps": [
        "Accept test-file input",
        "Upload sample to Drive"
      ],
      "validation": "Inactive in Make inventory; no test tonight.",
      "risk": "Use synthetic/anonymized files only",
      "next": "Do not run unless test budget and scope approved",
      "lastCredits": null
    }
  ],
  "integrations": [
    {
      "name": "Google Sheets master CRM",
      "access": "Connected to ChatGPT",
      "website": "Snapshot only",
      "security": "Private; do not expose rows via Pages",
      "action": "Set up authenticated server-side read-only connector"
    },
    {
      "name": "Gmail sales inbox",
      "access": "Connected to ChatGPT",
      "website": "Not connected",
      "security": "Private message data and consent restrictions",
      "action": "Server-side OAuth + suppression check before any actions"
    },
    {
      "name": "Make scenarios",
      "access": "Connected to ChatGPT",
      "website": "Inventory snapshot only",
      "security": "Do not publish connection IDs, webhook URLs or keys",
      "action": "Authenticated status sync, scoped to verified company scenarios"
    },
    {
      "name": "GitHub repository",
      "access": "Write access verified",
      "website": "Published static files",
      "security": "Public source code and data",
      "action": "Use this for versioned frontend and public-safe JSON"
    },
    {
      "name": "Protected application backend",
      "access": "Not configured",
      "website": "Not connected",
      "security": "Required for CRM records, login and writing",
      "action": "Select provider, add auth and server-side secrets"
    }
  ],
  "tasks": [
    {
      "id": "HQ-001",
      "department": "Command Center",
      "title": "Reconcile latest CRM dashboard with verified Gmail and pipeline",
      "priority": "P0",
      "status": "In progress",
      "due": "Daily",
      "evidence": "Dashboard + Sent Outreach",
      "note": "Never change headline numbers without source checks."
    },
    {
      "id": "HQ-002",
      "department": "Command Center",
      "title": "Publish department ownership and operational definitions",
      "priority": "P1",
      "status": "Ready",
      "due": "This sprint",
      "evidence": "Company playbook",
      "note": "Clear handoff from prospecting to sales to delivery."
    },
    {
      "id": "HQ-003",
      "department": "Client Acquisition",
      "title": "Check current buyer requests; verify posting recency and contact rules",
      "priority": "P0",
      "status": "Recurring",
      "due": "Daily",
      "evidence": "Opportunities",
      "note": "Only evidence-based needs; no forum rule circumvention."
    },
    {
      "id": "HQ-004",
      "department": "Client Acquisition",
      "title": "Verify suppressions and historic sends before new outreach",
      "priority": "P0",
      "status": "Recurring",
      "due": "Every send",
      "evidence": "No Contact / Sent Outreach",
      "note": "Bounces and declines remain suppressed."
    },
    {
      "id": "HQ-005",
      "department": "Client Acquisition",
      "title": "Requalify research-only shortlist against actual unmet manual work",
      "priority": "P1",
      "status": "Backlog",
      "due": "This week",
      "evidence": "200 Lead Launch Board",
      "note": "No assumption that existing cloud systems need replacing."
    },
    {
      "id": "HQ-006",
      "department": "Sales & Conversations",
      "title": "Await buyer response on accounting-document intake",
      "priority": "P0",
      "status": "Waiting",
      "due": "On inbound",
      "evidence": "First Client Sprint",
      "note": "Last check-in already sent; no additional chase."
    },
    {
      "id": "HQ-007",
      "department": "Sales & Conversations",
      "title": "Scope client input/output, exceptions and budget after buyer engagement",
      "priority": "P0",
      "status": "Waiting",
      "due": "On qualifying reply",
      "evidence": "Discovery & paid pilot",
      "note": "Do not propose a price without these details."
    },
    {
      "id": "HQ-008",
      "department": "Sales & Conversations",
      "title": "Prepare accurate bounded pilot and acceptance checklist",
      "priority": "P1",
      "status": "Ready",
      "due": "Before proposal",
      "evidence": "Client QA runbook",
      "note": "Use anonymized representative samples."
    },
    {
      "id": "HQ-009",
      "department": "Automation Development",
      "title": "Maintain Make rent-roll scenario inactive until approved",
      "priority": "P0",
      "status": "Controlled",
      "due": "Continuous",
      "evidence": "Make scenario inventory",
      "note": "Avoid unapproved spend and production changes."
    },
    {
      "id": "HQ-010",
      "department": "Automation Development",
      "title": "Document data schema, retry/idempotency and manual exception path",
      "priority": "P1",
      "status": "Ready",
      "due": "Before client pilot",
      "evidence": "Prototype technical brief",
      "note": "No accuracy or deployment claims without tests."
    },
    {
      "id": "HQ-011",
      "department": "Automation Development",
      "title": "Validate extraction accuracy against approved test set",
      "priority": "P1",
      "status": "Blocked",
      "due": "After approved tests",
      "evidence": "QA runbook",
      "note": "Requires client sample or synthetic fixtures and budget."
    },
    {
      "id": "HQ-012",
      "department": "Partnerships",
      "title": "Monitor future-partner response without repeated follow-up",
      "priority": "P1",
      "status": "Waiting",
      "due": "On inbound",
      "evidence": "Opportunities",
      "note": "No active subcontract assignment."
    },
    {
      "id": "HQ-013",
      "department": "Partnerships",
      "title": "Screen integration agencies for live overflow rather than generic fit",
      "priority": "P1",
      "status": "Recurring",
      "due": "Weekly",
      "evidence": "Opportunities",
      "note": "Verify capability overlap and buyer need."
    },
    {
      "id": "HQ-014",
      "department": "Portfolio & Assets",
      "title": "Keep prototype claims supported by actual QA evidence",
      "priority": "P0",
      "status": "Controlled",
      "due": "Every proposal",
      "evidence": "Technical brief",
      "note": "No client testimonials or made-up deployments."
    },
    {
      "id": "HQ-015",
      "department": "Portfolio & Assets",
      "title": "Prepare anonymized architecture and before/after process diagram",
      "priority": "P1",
      "status": "Ready",
      "due": "This sprint",
      "evidence": "Portfolio brief",
      "note": "Use real architecture, synthetic content."
    },
    {
      "id": "HQ-016",
      "department": "Strategy & Operations",
      "title": "Finish public-safe HQ information architecture and navigation",
      "priority": "P0",
      "status": "In progress",
      "due": "Tonight",
      "evidence": "GitHub repository",
      "note": "All seven departments and system subpages."
    },
    {
      "id": "HQ-017",
      "department": "Strategy & Operations",
      "title": "Configure private backend, login and least-privilege permissions",
      "priority": "P0",
      "status": "Blocked",
      "due": "After hosting authorization",
      "evidence": "Integration architecture",
      "note": "Cannot securely access private sheets from public JS."
    },
    {
      "id": "HQ-018",
      "department": "Strategy & Operations",
      "title": "Build read-only CRM sync with freshness/error indicators",
      "priority": "P0",
      "status": "Blocked",
      "due": "After private backend",
      "evidence": "Integration architecture",
      "note": "No public row-level contact exports."
    },
    {
      "id": "HQ-019",
      "department": "Strategy & Operations",
      "title": "Connect Gmail thread reconciliation and suppression logic",
      "priority": "P1",
      "status": "Blocked",
      "due": "After secure OAuth",
      "evidence": "Integration architecture",
      "note": "Draft/sent/accepted/replied remain distinct."
    },
    {
      "id": "HQ-020",
      "department": "Strategy & Operations",
      "title": "Add audit-logged CRM write-back and safe Make status sync",
      "priority": "P1",
      "status": "Backlog",
      "due": "After read-only QA",
      "evidence": "Integration architecture",
      "note": "No automated sending or scenario activation."
    }
  ],
  "departments": [
    {
      "id": "command",
      "number": "00",
      "name": "Command Center",
      "short": "Company-wide decisions and reporting",
      "owner": "Company operations",
      "purpose": "Make the right decisions using reliable status across every specialist team.",
      "outcome": "Accurate, current executive operating picture.",
      "views": [
        [
          "overview",
          "Executive overview"
        ],
        [
          "playbook",
          "Reporting SOP"
        ],
        [
          "work",
          "Priority desk"
        ],
        [
          "metrics",
          "KPIs & evidence"
        ]
      ],
      "focus": [
        "First verified paying client, not gross outreach volume",
        "Real opportunities and next actions",
        "Inter-department handoffs",
        "Truthful reporting and evidence"
      ],
      "metrics": [
        "Verified revenue and paid clients",
        "Qualified buyer conversations",
        "Proposal-to-decision progress",
        "Data freshness and blockers"
      ],
      "process": [
        [
          "Collect",
          "Review CRM Dashboard, Sent Outreach, Opportunities, Gmail, relevant Make executions and automation reports."
        ],
        [
          "Reconcile",
          "Separate accepted sends from distinct recipients, and replies from buyer-qualified conversations."
        ],
        [
          "Decide",
          "Rank opportunities based on verified pain, contact permission, urgency, feasibility and potential commercial impact."
        ],
        [
          "Assign",
          "Give each action a responsible department, evidence link and appropriate review date."
        ],
        [
          "Close the loop",
          "Record only verified updates; note exceptions, unavailable data and commitments that remain unresolved."
        ]
      ],
      "decisions": [
        "Keep direct buyer requests higher priority than generic research",
        "Hold buyer follow-up where last useful check-in has already been sent",
        "Keep Make production scenarios inactive until approval and testing"
      ],
      "handoffs": [
        "Acquisition → Sales when verified buyer interest arrives",
        "Sales → Development when a clear paid pilot is approved",
        "Development → Operations on delivery evidence and support risks"
      ],
      "resources": [
        "Dashboard",
        "Master Checklist",
        "First Client Sprint",
        "Safety Audit"
      ]
    },
    {
      "id": "acquisition",
      "number": "01",
      "name": "Client Acquisition",
      "short": "Research, qualification and respectful outreach",
      "owner": "Prospecting",
      "purpose": "Identify businesses with actual, evidence-backed automation demand and a legitimate contact route.",
      "outcome": "Buyer-quality leads and booked discovery, not arbitrary send counts.",
      "views": [
        [
          "overview",
          "Market intelligence"
        ],
        [
          "playbook",
          "Prospecting SOP"
        ],
        [
          "work",
          "Research queue"
        ],
        [
          "metrics",
          "Acquisition metrics"
        ]
      ],
      "focus": [
        "Direct Make/n8n project requests with explicit scope",
        "Accounting document intake where friction is actually evidenced",
        "Integration agency overflow and subcontract demand",
        "Verified contact route and safe suppression handling"
      ],
      "metrics": [
        "Qualified-to-contacted ratio",
        "Positive reply rate by channel",
        "Accepted and bounced sends separately",
        "Recent buyer requests versus stale listings"
      ],
      "process": [
        [
          "Source",
          "Find a recent, explicit work request or documented manual process in a reachable business."
        ],
        [
          "Verify",
          "Check source date, organization, tools, gap, buyer role and whether demand remains open."
        ],
        [
          "Deduplicate",
          "Compare organization, domain, recipient and prior thread against Opportunities, Sent Outreach and No Contact."
        ],
        [
          "Score",
          "Consider pain evidence, scope fit, urgency, accessible contact and risk before allocating outreach."
        ],
        [
          "Contact responsibly",
          "Ask one grounded question through an allowed route; track accepted delivery versus rejected attempt."
        ],
        [
          "Handoff",
          "Log the exact source, conversation evidence, current status and next date for Sales."
        ]
      ],
      "decisions": [
        "Do not assume online document exchange is inefficient",
        "Do not write prohibited AI-authored forum posts",
        "Never retry suppressed or bounced addresses"
      ],
      "handoffs": [
        "Research → Qualification → Contacted → Reply verified",
        "Qualified buyer reply → Sales discovery",
        "Negative or bounce → Operations suppression"
      ],
      "resources": [
        "Opportunities",
        "Sent Outreach",
        "200 Lead Launch Board",
        "No Contact"
      ]
    },
    {
      "id": "sales",
      "number": "02",
      "name": "Sales & Conversations",
      "short": "Discovery, proposals, negotiations and decisions",
      "owner": "Sales",
      "purpose": "Translate specific buyer problems into feasible scopes and transparent commercial decisions.",
      "outcome": "A customer-approved, bounded paid project with clear acceptance.",
      "views": [
        [
          "overview",
          "Sales desk"
        ],
        [
          "playbook",
          "Discovery & close SOP"
        ],
        [
          "work",
          "Conversation queue"
        ],
        [
          "metrics",
          "Funnel health"
        ]
      ],
      "focus": [
        "Accounting document sorting buyer: awaiting reply, no more unsolicited check-in",
        "Potential integration partner: future collaboration, no current project",
        "Make forum buyer requests: posted responses, awaiting buyer",
        "Formal scope only after systems, volume, exceptions and budget confirmed"
      ],
      "metrics": [
        "Qualified buyer replies",
        "Discovery calls/messages completed",
        "Proposals accepted or declined",
        "Confirmed collected revenue"
      ],
      "process": [
        [
          "Classify",
          "Decide whether an answer is a genuine project inquiry, decline, partner discussion or simple acknowledgment."
        ],
        [
          "Discover",
          "Capture current process, apps, data format, actual time loss, failure modes, owner, budget and deadline."
        ],
        [
          "Design",
          "Define one small outcome, boundaries, human review, sample input, output and test criteria."
        ],
        [
          "Quote",
          "Estimate integration, exception handling, QA, handover and support. Separate any client-owned API costs."
        ],
        [
          "Agree",
          "Exchange clear written scope, deliverables, price, timeline and acceptance checkpoints before work."
        ],
        [
          "Transfer",
          "Move approved requirements and permissions to Development; record financial milestones in CRM."
        ]
      ],
      "decisions": [
        "No unsupported customer-project claims",
        "A reply does not automatically advance to Discovery",
        "Do not promise 100% extraction accuracy or guaranteed savings"
      ],
      "handoffs": [
        "Buyer response from Acquisition → Sales",
        "Approved technical scope → Development",
        "Won payment and delivery evidence → Command Center"
      ],
      "resources": [
        "Opportunities",
        "First Client Sprint",
        "Sales Playbook",
        "Sent Outreach"
      ]
    },
    {
      "id": "development",
      "number": "03",
      "name": "Automation Development",
      "short": "Architecture, testing, delivery and maintenance",
      "owner": "Engineering",
      "purpose": "Build safe workflows around verified requirements, prove their behavior, and deliver with ownership and recovery paths.",
      "outcome": "Client-accepted, documented automation with monitored exceptions.",
      "views": [
        [
          "overview",
          "Build portfolio"
        ],
        [
          "playbook",
          "Delivery SOP"
        ],
        [
          "work",
          "Build & QA queue"
        ],
        [
          "metrics",
          "Engineering scorecard"
        ]
      ],
      "focus": [
        "RentRoll PDF Underwriter is an independent, inactive prototype",
        "Google Drive → PDF → Gemini → Parse JSON → Iterator → Sheets",
        "Four successful historical prototype runs do not prove extraction accuracy",
        "No expensive testing or activation without permission"
      ],
      "metrics": [
        "Test cases passed and failed",
        "Document accuracy by required field",
        "Duplicate processing incidents",
        "Error detection and recovery coverage"
      ],
      "process": [
        [
          "Requirements",
          "Record current and target process, source schemas, access boundaries, exceptions and expected user action."
        ],
        [
          "Blueprint",
          "Specify triggers, transformations, validations, fallbacks, idempotency keys and destination ownership."
        ],
        [
          "Prototype",
          "Use synthetic or client-approved anonymized examples and minimal permissions."
        ],
        [
          "Test",
          "Compare output to source, verify duplicates, failures, retries, missing fields and safe recovery."
        ],
        [
          "Roll out",
          "Secure client-owned connections, monitoring, alerts, acceptance and rollback."
        ],
        [
          "Handover",
          "Provide operating notes, support window, ownership, export and recovery instructions."
        ]
      ],
      "decisions": [
        "Do not activate inactive scenarios for dashboard integration",
        "Never expose API keys or sensitive source files in a public repo",
        "Document actual test results, not inferred results"
      ],
      "handoffs": [
        "Sales scope → Engineering build",
        "Engineering acceptance evidence → Sales/client",
        "Deployment / failures → Operations monitoring"
      ],
      "resources": [
        "Safety Audit",
        "Sales Playbook",
        "Master Checklist"
      ]
    },
    {
      "id": "partnerships",
      "number": "04",
      "name": "Partnerships",
      "short": "White-label, referrals and collaboration",
      "owner": "Partner development",
      "purpose": "Build credible relationships with teams that actually need technical capacity or referral help.",
      "outcome": "Specific commercial collaboration with clear scope and responsibilities.",
      "views": [
        [
          "overview",
          "Partner desk"
        ],
        [
          "playbook",
          "Partner SOP"
        ],
        [
          "work",
          "Partner queue"
        ],
        [
          "metrics",
          "Partner outcomes"
        ]
      ],
      "focus": [
        "Potential future integration partner: waiting",
        "ERP agency: verified no current external need",
        "White-label posting: portfolio mismatch, hold",
        "No signed paid partner engagements"
      ],
      "metrics": [
        "Verified partner interest",
        "Subcontract requests with clear scopes",
        "Referral deals accepted",
        "Paid and delivered partner work"
      ],
      "process": [
        [
          "Identify",
          "Verify agencies offering adjacent services or publishing concrete overflow requests."
        ],
        [
          "Assess",
          "Check whether demand is current, technical fit is credible, and an allowed contact route exists."
        ],
        [
          "Introduce",
          "Describe actual skills and independently tested work without invented customer references."
        ],
        [
          "Define",
          "Clarify client ownership, confidentiality, commercial handoffs, expectations and payment."
        ],
        [
          "Pilot",
          "Accept only bounded tasks with access, test cases and clear approval."
        ],
        [
          "Review",
          "Track real referrals and outcomes rather than generic networking metrics."
        ]
      ],
      "decisions": [
        "No fake case studies or testimonials",
        "Respect confirmed internal delivery teams and declines",
        "Do not bypass forum posting restrictions"
      ],
      "handoffs": [
        "Partner requirement → Sales qualification",
        "Approved subcontract task → Development",
        "Referral and paid result → Command Center"
      ],
      "resources": [
        "Opportunities",
        "Sales Playbook",
        "Sent Outreach"
      ]
    },
    {
      "id": "portfolio",
      "number": "05",
      "name": "Portfolio & Assets",
      "short": "Verified evidence, technical materials and reusable internal assets",
      "owner": "Sales enablement",
      "purpose": "Help buyers understand capabilities through truthful technical examples and clear documentation.",
      "outcome": "Consistent, evidence-backed materials that shorten discovery and delivery.",
      "views": [
        [
          "overview",
          "Asset library"
        ],
        [
          "playbook",
          "Asset standards"
        ],
        [
          "work",
          "Production queue"
        ],
        [
          "metrics",
          "Readiness"
        ]
      ],
      "focus": [
        "Rent roll/document-processing prototype evidence",
        "Discovery and paid pilot template",
        "Delivery QA and handover runbook",
        "No unrelated product-store projects"
      ],
      "metrics": [
        "Verified prototype evidence",
        "Current technical briefs",
        "Reusable approved diagrams",
        "Published customer case studies: none"
      ],
      "process": [
        [
          "Inventory",
          "Separate private prototypes, finished internal documents and actual customer projects."
        ],
        [
          "Validate",
          "Read the real scenario, execution history and QA notes before describing capabilities."
        ],
        [
          "Document",
          "Create input/output diagram, scope boundaries, setup requirements and known limitations."
        ],
        [
          "Sanitize",
          "Use synthetic examples; remove secrets, customer documents, personal identifiers and contact data."
        ],
        [
          "Approve",
          "Ensure sales claims exactly match evidence and don't imply a customer deployment."
        ],
        [
          "Maintain",
          "Version each public or buyer-facing asset and note review dates."
        ]
      ],
      "decisions": [
        "Never treat unrelated product workflows as Vave Automations projects",
        "No published success claim without acceptance evidence",
        "No credentials, client data or private screenshots in public assets"
      ],
      "handoffs": [
        "Development QA → Portfolio technical brief",
        "Portfolio proof → Sales proposals",
        "User feedback → Asset revisions"
      ],
      "resources": [
        "Master Checklist",
        "Sales Playbook",
        "Safety Audit"
      ]
    },
    {
      "id": "operations",
      "number": "06",
      "name": "Strategy & Operations",
      "short": "Systems, data integrity, governance and execution",
      "owner": "Operations",
      "purpose": "Keep the business coherent, secure, auditable and commercially focused.",
      "outcome": "One reliable source of truth and predictable operational execution.",
      "views": [
        [
          "overview",
          "Operating model"
        ],
        [
          "playbook",
          "Controls & governance"
        ],
        [
          "work",
          "Systems queue"
        ],
        [
          "metrics",
          "Operational health"
        ]
      ],
      "focus": [
        "Nine-tab Google Sheets master CRM is initial authoritative source",
        "Public Pages frontend must not access private Gmail or CRM directly",
        "No duplicate outreach or unsupported stage moves",
        "Use gated, audited backend writes only after read-only verification"
      ],
      "metrics": [
        "Source freshness and errors",
        "Suppression compliance",
        "Sync validation and audit coverage",
        "Tool spending and unapproved runs"
      ],
      "process": [
        [
          "Govern",
          "Maintain definitions and owners for CRM, departments, outreach and delivery."
        ],
        [
          "Observe",
          "Reconcile Gmail, Sheets and Make from authenticated providers without silent overwrites."
        ],
        [
          "Protect",
          "Apply suppression, least privilege, secret storage, privacy controls and backup discipline."
        ],
        [
          "Automate",
          "Start with read-only sync; test on sample data before enabling audited write-back."
        ],
        [
          "Validate",
          "Check data counts, IDs, conflict resolution, missing rows and retries."
        ],
        [
          "Review",
          "Escalate spending, access, identity and data-integrity exceptions with clear next actions."
        ]
      ],
      "decisions": [
        "Public repo code is never a secure credential store",
        "Do not claim live sync just because ChatGPT connectors work",
        "Preserve old records and link all updates to evidence"
      ],
      "handoffs": [
        "Every workstream → shared authoritative records",
        "Safety exceptions → stop and investigate",
        "Verified milestones → Command Center reporting"
      ],
      "resources": [
        "Dashboard",
        "No Contact",
        "Safety Audit",
        "Master Checklist"
      ]
    }
  ]
};
