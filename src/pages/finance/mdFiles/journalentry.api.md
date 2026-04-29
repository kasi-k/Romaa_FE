# Journal Entry — API Reference

**Base URL:** `/journalentry`
**Module:** `finance → journalentry`
**Auth:** JWT cookie or `Authorization: Bearer <token>`

---

## Overview

A **Journal Entry (JE)** is the universal double-entry record for every financial transaction in the system. There are two categories:

| Category | Created by | Who triggers it |
|---|---|---|
| **Manual JE** | Accountant via API | User submits create + approve |
| **Auto-Generated JE** | System on voucher approval | Voucher approve endpoint |

Every JE must balance: **Σ Debit = Σ Credit**. Approved entries are permanently posted and cannot be edited — errors are corrected by creating a **Reversal JE** (Dr↔Cr swapped).

---

## `je_type` Values

### Manual JE Types

| `je_type` | Use Case |
|---|---|
| `Opening Balance` | Enter historical account balances when going live |
| `Depreciation` | Monthly/yearly write-down: Dr Depreciation Exp / Cr Accumulated Depreciation |
| `Bank Reconciliation` | Bank charges, interest from bank statement |
| `Payroll` | Salary: Dr Salary Expense / Cr Bank + PF Payable + TDS Payable |
| `Accrual` | Expense incurred but not yet invoiced (month-end) |
| `Provision` | Dr Bad Debt Expense / Cr Provision for Bad Debts |
| `ITC Reversal` | GST input credit lost: Dr ITC Reversal Liability / Cr CGST/SGST Input |
| `Inter-Account Transfer` | Move funds between bank accounts or cost centres |
| `Reversal` | System-generated mirror of a prior approved JE (Dr↔Cr swapped) |
| `Adjustment` | General period-end or audit adjustment (default) |
| `Other` | Miscellaneous |

### Auto-Generated JE Types (system only — never send in create payload)

These JEs are created automatically when a voucher is approved. They are always `status: "approved"` and `is_posted: true` immediately. The originating voucher stores `je_ref` (ObjectId) and `je_no` (string) pointing back to the JE.

| `je_type` | Triggered by | Dr side | Cr side |
|---|---|---|---|
| `Purchase Invoice` | `PurchaseBill` approval | Material at Site + CGST/SGST/IGST ITC | Vendor AP (`2010-VND-xxx`) |
| `Contractor Bill` | `WeeklyBilling` approval | Subcontract Expense + GST | Retention Payable (`2040`) + Contractor AP (`2020-CTR-xxx`) |
| `Payment` | `PaymentVoucher` approval | Vendor/Contractor AP | TDS Payable (`2140`) + Bank Account |
| `Receipt` | `ReceiptVoucher` approval | Bank Account | Vendor/Contractor AP |
| `Credit Note` | `CreditNote` approval | Vendor/Contractor AP | Cost Account + ITC reversal |
| `Debit Note` | `DebitNote` approval | Vendor/Contractor AP | Penalties Recovered (`4030`) |

---

## Auto-Generated JEs — Frontend Integration

When a voucher is approved, the system auto-creates a JE and stores references on the voucher document:

```json
// On every approved voucher (PurchaseBill, WeeklyBilling, PaymentVoucher, etc.):
{
  "je_ref": "64abc123...",        // ObjectId → JournalEntry._id
  "je_no":  "JE/25-26/0042"      // human-readable JE number
}
```

### Navigate from a Voucher to its JE

```
// Option 1 — look up by je_no (exact match, fast)
GET /journalentry/list?je_no=JE/25-26/0042

// Option 2 — look up by source voucher
GET /journalentry/list?source_type=PurchaseBill&source_no=BILL/25-26/0017

// Option 3 — look up by JE _id stored on voucher
GET /journalentry/<je_ref>
```

`source_type` values that correspond to auto-generated JEs:

| `source_type` | Module |
|---|---|
| `PurchaseBill` | Purchase bill |
| `WeeklyBilling` | Weekly contractor bill |
| `PaymentVoucher` | Payment voucher |
| `ReceiptVoucher` | Receipt voucher |
| `CreditNote` | Credit note |
| `DebitNote` | Debit note |

### Supplier Cross-Posting on Approval

When any JE line references a personal supplier ledger account (e.g. `2010-VND-001` which has `linked_supplier_id` set), the service also posts to `LedgerEntry` automatically. This keeps the supplier payables register accurate for all transaction types.

---

## Endpoints

### 1. Get Next JE Number

```
GET /journalentry/next-no
```

Returns the `je_no` that will be assigned to the next journal entry. Call before opening the create form.

**Auth required:** `finance > journalentry > read`

**Success Response `200`**

```json
{
  "status": true,
  "je_no": "JE/25-26/0001",
  "is_first": true
}
```

| Field | Description |
|---|---|
| `je_no` | Next JE number — pass as-is in the create payload |
| `is_first` | `true` if no JEs exist yet in this financial year |

> Format: `JE/<FY>/<4-digit seq>` — e.g. `JE/25-26/0042`. FY resets every April 1 (Indian Apr–Mar year). Read-only preview — does not reserve anything.

---

### 2. List Journal Entries

```
GET /journalentry/list
```

**Auth required:** `finance > journalentry > read`

**Query Parameters**

| Param | Type | Description |
|---|---|---|
| `je_type` | `string` | Filter by type — see type enum above |
| `status` | `string` | `draft` / `pending` / `approved` |
| `tender_id` | `string` | Filter by tender |
| `financial_year` | `string` | e.g. `25-26` |
| `is_reversal` | `boolean` | `true` = only reversal entries |
| `je_no` | `string` | Exact match on JE number |
| `account_code` | `string` | All JEs that touched a specific account |
| `source_type` | `string` | Auto-JE source model — e.g. `PurchaseBill`, `PaymentVoucher` |
| `source_no` | `string` | Auto-JE source document number — e.g. `BILL/25-26/0017` |
| `from_date` | `YYYY-MM-DD` | `je_date ≥ from_date` |
| `to_date` | `YYYY-MM-DD` | `je_date ≤ to_date` (time set to 23:59:59) |
| `page` | `number` | Page number (1-based). Default: `1` |
| `limit` | `number` | Records per page (max 100). Default: `20` |

**Example Requests**

```
GET /journalentry/list
GET /journalentry/list?je_type=Depreciation&financial_year=25-26
GET /journalentry/list?account_code=1040&from_date=2025-04-01
GET /journalentry/list?status=pending
GET /journalentry/list?tender_id=TND-001&page=1&limit=20
GET /journalentry/list?source_type=PurchaseBill&source_no=BILL/25-26/0017
GET /journalentry/list?je_type=Payment&financial_year=25-26
GET /journalentry/list?is_reversal=true
```

**Success Response `200`**

```json
{
  "status": true,
  "data": [
    {
      "_id": "64abc123...",
      "je_no": "JE/25-26/0001",
      "je_date": "2026-03-31T00:00:00.000Z",
      "financial_year": "25-26",
      "je_type": "Depreciation",
      "narration": "Monthly depreciation on Plant & Machinery — March 2026",
      "lines": [
        {
          "account_code": "5420",
          "account_name": "Depreciation — Plant & Machinery",
          "account_type": "Expense",
          "dr_cr": "Dr",
          "debit_amt": 12500,
          "credit_amt": 0,
          "narration": ""
        },
        {
          "account_code": "1145",
          "account_name": "Accumulated Depreciation — Plant & Machinery",
          "account_type": "Asset",
          "dr_cr": "Cr",
          "debit_amt": 0,
          "credit_amt": 12500,
          "narration": ""
        }
      ],
      "total_debit": 12500,
      "total_credit": 12500,
      "tender_id": "",
      "tender_name": "",
      "is_reversal": false,
      "reversal_of": null,
      "reversal_of_no": "",
      "auto_reverse_date": null,
      "auto_reversed": false,
      "source_ref": null,
      "source_type": "",
      "source_no": "",
      "status": "approved",
      "is_posted": true,
      "approved_by": "64employee...",
      "approved_at": "2026-03-31T18:00:00.000Z",
      "createdAt": "2026-03-31T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 54,
    "pages": 3
  }
}
```

---

### 3. Get Journal Entry by ID

```
GET /journalentry/:id
```

**Auth required:** `finance > journalentry > read`

**Success Response `200`**

```json
{
  "status": true,
  "data": {
    "_id": "64abc123...",
    "je_no": "JE/25-26/0001",
    "je_type": "Purchase Invoice",
    "source_ref": "64bill456...",
    "source_type": "PurchaseBill",
    "source_no": "BILL/25-26/0017",
    "status": "approved",
    "is_posted": true,
    "..."
  }
}
```

**Error Responses**

| Status | Condition | Message |
|---|---|---|
| `404` | `id` not found | `"Journal entry not found"` |

---

### 4. Create Journal Entry

```
POST /journalentry/create
Content-Type: application/json
```

**Auth required:** `finance > journalentry > create`

> Use this endpoint for **manual JEs only**. Auto-generated JEs are created internally by voucher approval flows.

**Request Body**

```json
{
  "je_no":      "JE/25-26/0001",
  "je_date":    "2026-03-31",
  "je_type":    "Depreciation",
  "narration":  "Monthly depreciation on Plant & Machinery — March 2026",
  "lines": [
    {
      "account_code": "5420",
      "dr_cr":        "Dr",
      "debit_amt":    12500,
      "credit_amt":   0,
      "narration":    "Depreciation expense"
    },
    {
      "account_code": "1145",
      "dr_cr":        "Cr",
      "debit_amt":    0,
      "credit_amt":   12500,
      "narration":    "Accumulated depreciation"
    }
  ],
  "tender_id":         "TND-001",
  "tender_name":       "INFRA Road Project Phase 1",
  "auto_reverse_date": "2026-04-01",
  "status":            "pending"
}
```

**Request Fields**

| Field | Type | Required | Description |
|---|---|---|---|
| `je_no` | `string` | **Yes** | From `GET /next-no` |
| `je_date` | `date` | No | Defaults to today |
| `je_type` | `string` | No | See manual type enum. Default: `Adjustment` |
| `narration` | `string` | **Yes** | Required for audit trail — cannot be blank |
| `lines` | `array` | **Yes** | Min 2 lines. Must balance (Σ Dr = Σ Cr) |
| `tender_id` | `string` | No | Link to tender for project-scoped reporting |
| `tender_ref` | `ObjectId` | No | MongoDB `_id` of the tender |
| `tender_name` | `string` | No | Snapshot of tender name |
| `auto_reverse_date` | `date` | No | Set for accrual entries — reversal JE auto-created on this date |
| `status` | `string` | No | `draft` / `pending` / `approved`. Default: `pending` |
| `created_by` | `ObjectId` | No | Employee `_id` who created the entry |

**`lines[]` fields**

| Field | Type | Required | Description |
|---|---|---|---|
| `account_code` | `string` | **Yes** | Must exist in AccountTree as a posting account (`is_group: false`, `is_posting_account: true`) |
| `dr_cr` | `"Dr" \| "Cr"` | No | Auto-derived from `debit_amt`/`credit_amt` if omitted |
| `debit_amt` | `number` | Yes (Dr lines) | Amount on debit side. Set to `0` for Cr lines |
| `credit_amt` | `number` | Yes (Cr lines) | Amount on credit side. Set to `0` for Dr lines |
| `narration` | `string` | No | Per-line description (useful for split entries) |

> **Server-auto-enriched (do not send):** `account_name`, `account_type`, `supplier_id`, `supplier_type`, `supplier_ref` — read from AccountTree on the server.

**Validation Rules**
- At least 2 lines required
- Each line: exactly one of `debit_amt` or `credit_amt` must be > 0 (not both, not neither)
- Entry must balance: Σ `debit_amt` = Σ `credit_amt`
- Each `account_code` must be a non-group posting account in AccountTree
- `narration` is required and cannot be blank

**Success Response `201`**

```json
{
  "status": true,
  "message": "Journal entry created",
  "data": {
    "_id": "64abc123...",
    "je_no": "JE/25-26/0001",
    "je_date": "2026-03-31T00:00:00.000Z",
    "financial_year": "25-26",
    "je_type": "Depreciation",
    "narration": "Monthly depreciation on Plant & Machinery — March 2026",
    "lines": [
      {
        "account_code": "5420",
        "account_name": "Depreciation — Plant & Machinery",
        "account_type": "Expense",
        "dr_cr": "Dr",
        "debit_amt": 12500,
        "credit_amt": 0,
        "narration": "Depreciation expense"
      },
      {
        "account_code": "1145",
        "account_name": "Accumulated Depreciation — Plant & Machinery",
        "account_type": "Asset",
        "dr_cr": "Cr",
        "debit_amt": 0,
        "credit_amt": 12500,
        "narration": "Accumulated depreciation"
      }
    ],
    "total_debit": 12500,
    "total_credit": 12500,
    "auto_reverse_date": "2026-04-01T00:00:00.000Z",
    "source_ref": null,
    "source_type": "",
    "source_no": "",
    "status": "pending",
    "is_posted": false,
    "createdAt": "2026-03-31T10:00:00.000Z"
  }
}
```

**Error Responses**

| Status | Condition | Message |
|---|---|---|
| `400` | `je_no` missing | `"je_no is required"` |
| `400` | `narration` blank | `"narration is required — explain the purpose of this journal entry"` |
| `400` | Fewer than 2 lines | `"A journal entry must have at least 2 lines (1 Dr + 1 Cr)"` |
| `400` | `account_code` not found | `"Line 1: account 'XXXX' not found in Chart of Accounts"` |
| `400` | Account is a group | `"Line 1: account '5000' is a group account — transactions cannot be posted to group accounts"` |
| `400` | Both Dr and Cr > 0 | `"Line 2: both debit_amt and credit_amt are > 0. A line must be either Dr or Cr."` |
| `400` | Both Dr and Cr = 0 | `"Line 2: both debit_amt and credit_amt are 0. Line has no value."` |
| `400` | Entry unbalanced | `"Journal entry does not balance: total Debit ₹12500 ≠ total Credit ₹11000. Difference: ₹1500"` |

---

### 5. Approve Journal Entry

```
PATCH /journalentry/approve/:id
```

Approves and posts the JE (`is_posted: true`). Supplier personal ledger lines also auto-post to `LedgerEntry`. `AccountTree.available_balance` updated for all touched accounts.

**Auth required:** `finance > journalentry > edit`

**Request Body:** None

**Success Response `200`**

```json
{
  "status": true,
  "message": "Journal entry approved and posted",
  "data": {
    "je_no": "JE/25-26/0001",
    "status": "approved",
    "is_posted": true,
    "approved_by": "64employee...",
    "approved_at": "2026-03-31T18:00:00.000Z"
  }
}
```

**Error Responses**

| Status | Condition | Message |
|---|---|---|
| `400` | `id` not found | `"Journal entry not found"` |
| `400` | Already approved | `"Already approved"` |
| `400` | No narration | `"Cannot approve a journal entry without a narration"` |

---

### 6. Reverse Journal Entry

```
POST /journalentry/reverse/:id
Content-Type: application/json
```

Creates a **Reversal JE** — mirror image of the original (Dr↔Cr swapped on every line). This is the only way to correct an approved JE. The reversal is immediately approved and posted — no separate approve call needed.

**Auth required:** `finance > journalentry > edit`

**Request Body**

```json
{
  "reversal_date": "2026-04-01",
  "narration": "Reversing March accrual — invoice received from ABC Contractors"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `reversal_date` | `date` | No | Date of the reversal JE. Defaults to today |
| `narration` | `string` | No | Custom narration. Defaults to `"Reversal of <je_no> — <original_narration>"` |

**Success Response `201`**

```json
{
  "status": true,
  "message": "Reversal journal entry created and posted",
  "data": {
    "_id": "64rev789...",
    "je_no": "JE/25-26/0002",
    "je_type": "Reversal",
    "is_reversal": true,
    "reversal_of": "64abc123...",
    "reversal_of_no": "JE/25-26/0001",
    "status": "approved",
    "is_posted": true,
    "lines": [
      {
        "account_code": "5420",
        "dr_cr": "Cr",
        "debit_amt": 0,
        "credit_amt": 12500
      },
      {
        "account_code": "1145",
        "dr_cr": "Dr",
        "debit_amt": 12500,
        "credit_amt": 0
      }
    ]
  }
}
```

**Error Responses**

| Status | Condition | Message |
|---|---|---|
| `400` | `id` not found | `"Journal entry not found"` |
| `400` | Not yet approved | `"Only approved journal entries can be reversed"` |
| `400` | Reversing a reversal | `"A reversal entry cannot itself be reversed"` |
| `400` | Already reversed | `"Already reversed — see JE JE/25-26/0002"` |

---

### 7. Process Auto-Reversals

```
POST /journalentry/process-auto-reversals
```

Processes all JEs with `auto_reverse_date ≤ today` that haven't been reversed yet. Called by the daily cron at 01:00 UTC or manually by an admin.

**Auth required:** `finance > journalentry > edit`
**Request Body:** None

**Success Response `200`**

```json
{
  "status": true,
  "results": [
    {
      "original": "JE/25-26/0005",
      "reversal": "JE/26-27/0001",
      "status": "ok"
    },
    {
      "original": "JE/25-26/0006",
      "status": "error",
      "message": "Already reversed — see JE JE/25-26/0009"
    }
  ]
}
```

| Field | Description |
|---|---|
| `original` | JE number of the original accrual |
| `reversal` | JE number of the newly created reversal (`status: "ok"` only) |
| `status` | `"ok"` or `"error"` |
| `message` | Error reason (`status: "error"` only) |

---

### 8. Update Journal Entry

```
PATCH /journalentry/update/:id
Content-Type: application/json
```

**Auth required:** `finance > journalentry > edit`

Only `draft` or `pending` JEs can be updated. **Approved JEs are immutable** — use Reverse instead.

**Updatable fields:** `je_date`, `je_type`, `narration`, `tender_id`, `tender_ref`, `tender_name`, `auto_reverse_date`

> If `lines[]` is sent, the array is fully replaced: each line is re-enriched from AccountTree (`account_name`, `account_type`, supplier fields), balance is re-validated, and `financial_year` is recomputed from `je_date`.

**Success Response `200`**

```json
{
  "status": true,
  "message": "Journal entry updated",
  "data": { "...updated JE fields..." }
}
```

**Error Responses**

| Status | Condition | Message |
|---|---|---|
| `400` | JE is approved | `"Cannot edit an approved journal entry — create a reversal instead"` |
| `400` | `id` not found | `"Journal entry not found"` |

---

### 9. Delete Draft Journal Entry

```
DELETE /journalentry/delete/:id
```

**Auth required:** `finance > journalentry > delete`

Only `draft` or `pending` JEs can be deleted. Approved JEs cannot be deleted — use Reverse instead.

**Success Response `200`**

```json
{
  "status": true,
  "message": "Journal entry deleted",
  "data": { "deleted": true, "je_no": "JE/25-26/0001" }
}
```

**Error Responses**

| Status | Condition | Message |
|---|---|---|
| `400` | JE is approved | `"Cannot delete an approved journal entry — create a reversal instead"` |
| `400` | `id` not found | `"Journal entry not found"` |

---

## Workflows

### Standard Manual JE (e.g. Depreciation)

```
1. GET  /journalentry/next-no          → pre-fill je_no in form

2. GET  /accounttree/list?is_posting_account=true
                                       → populate account dropdowns

3. POST /journalentry/create           → save as "pending"
   { je_no, je_date, je_type, narration, lines: [...] }

4. Review in approval queue

5. PATCH /journalentry/approve/:id     → post to GL
   → status: "approved", is_posted: true
   → LedgerEntry cross-posted for any supplier account lines
   → AccountTree.available_balance updated for all touched accounts
```

### Accrual Entry with Auto-Reversal

```
1–5. Same as above, but include in the create body:
   { "auto_reverse_date": "2026-04-01" }

6. On April 1, cron (01:00 UTC) or admin calls:
   POST /journalentry/process-auto-reversals
   → Reversal JE created and approved automatically
   → auto_reversed: true set on original
```

### Correcting a Posted JE

```
Approved JEs are immutable — never edited directly.

1. POST /journalentry/reverse/:id
   { "reversal_date": "today", "narration": "Correction: wrong account code used" }
   → Reversal JE created immediately (Dr↔Cr swapped), status: "approved"
   → Net effect on ledger = zero (original + reversal cancel out)

2. POST /journalentry/create   → enter the corrected entry
3. PATCH /journalentry/approve/:id
```

### Viewing JE for a Voucher (Frontend)

```
// When user clicks "View Journal Entry" on a PurchaseBill detail page:

// Preferred — use je_no stored on the voucher
GET /journalentry/list?je_no=JE/25-26/0042

// Or use source identifiers
GET /journalentry/list?source_type=PurchaseBill&source_no=BILL/25-26/0017

// Or use the je_ref ObjectId stored on the voucher
GET /journalentry/64abc123...
```

---

## Financial Year

JEs are filed under the Indian Apr–Mar financial year. `financial_year` is **auto-computed** from `je_date` — never send it in the payload.

| `je_date` | `financial_year` |
|---|---|
| Any date Apr 1 2025 – Mar 31 2026 | `25-26` |
| Any date Apr 1 2026 – Mar 31 2027 | `26-27` |

JE numbering resets at the start of each FY (April 1).

---

## Double-Entry Examples

### Bank Reconciliation — Bank Charge

```
Dr  Bank Charges (5310)             ₹500
Cr  HDFC Current Account (1020)     ₹500
```

### Salary Disbursement (Payroll)

```
Dr  Salary Expense (5200)           ₹1,50,000
Cr  HDFC Current Account (1020)     ₹1,30,000   ← net pay
Cr  PF & ESI Payable (2130)           ₹15,000   ← PF/ESI deducted
Cr  TDS Payable (2140)                 ₹5,000   ← TDS deducted
```

### Accrual — Contractor Invoice Expected

```
Dr  Subcontract Expense (5030)      ₹50,000
Cr  Accrued Liabilities (2160)      ₹50,000
← set auto_reverse_date to first of next month
```

### ITC Reversal (GST input credit lost)

```
Dr  ITC Reversal Liability (2150)    ₹1,800
Cr  CGST Input ITC (1080-CGST)         ₹900
Cr  SGST Input ITC (1080-SGST)         ₹900
```

### Opening Balance (go-live)

```
Dr  HDFC Current Account (1020)    ₹5,00,000
Cr  Opening Balance Equity (3020)  ₹5,00,000
```

---

## JE Response Fields Reference

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | MongoDB document ID |
| `je_no` | string | `JE/<FY>/<seq>` — unique identifier |
| `je_date` | Date | Transaction date |
| `financial_year` | string | e.g. `25-26` — auto-computed, read-only |
| `je_type` | string | See type enum |
| `narration` | string | Mandatory explanation |
| `lines` | array | Dr/Cr entry lines |
| `total_debit` | number | Σ debit amounts (auto-computed) |
| `total_credit` | number | Σ credit amounts (auto-computed) |
| `tender_id` | string | Linked tender (optional) |
| `tender_name` | string | Snapshot of tender name |
| `is_reversal` | boolean | `true` if this JE was auto-created to reverse another |
| `reversal_of` | ObjectId | `_id` of the original JE being reversed |
| `reversal_of_no` | string | `je_no` of the original JE (snapshot) |
| `auto_reverse_date` | Date | Date when a reversal will be auto-created (accruals) |
| `auto_reversed` | boolean | `true` once the auto-reversal has been created |
| `source_ref` | ObjectId | `_id` of the originating voucher (auto-JEs only) |
| `source_type` | string | Model name of originating voucher (auto-JEs only) |
| `source_no` | string | Document number of originating voucher (auto-JEs only) |
| `status` | string | `draft` / `pending` / `approved` |
| `is_posted` | boolean | `true` once approved and ledger updated |
| `approved_by` | ObjectId | Employee who approved (manual approvals) |
| `approved_at` | Date | Approval timestamp |
| `createdAt` | Date | Creation timestamp |

### `lines[]` Response Fields

| Field | Type | Description |
|---|---|---|
| `account_code` | string | Account code from Chart of Accounts |
| `account_name` | string | Snapshot of account name at time of posting |
| `account_type` | string | `Asset` / `Liability` / `Expense` / `Income` / `Equity` |
| `dr_cr` | `"Dr"` \| `"Cr"` | Debit or Credit side |
| `debit_amt` | number | Amount on debit side (0 for Cr lines) |
| `credit_amt` | number | Amount on credit side (0 for Dr lines) |
| `narration` | string | Per-line description |
| `supplier_id` | string | Populated if this line is a personal supplier ledger account |
| `supplier_type` | string | `"Vendor"` or `"Contractor"` (if supplier line) |
| `supplier_ref` | ObjectId | Supplier document `_id` (if supplier line) |
