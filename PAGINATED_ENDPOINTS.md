# Romaa — Paginated API Endpoints Reference

> **Frontend status: COMPLETE** — All 36 list endpoints on the frontend now pass the standard 5 params and consume `{ data, totalPages, currentPage, totalCount }`.
> 
> **Backend work required** — See the section below for every endpoint that still needs backend pagination implemented.

---

## Standard Contract

### Query params every list endpoint MUST accept

| Param      | Type   | Default | Description                          |
|------------|--------|---------|--------------------------------------|
| `page`     | number | `1`     | Page number (1-based)                |
| `limit`    | number | `10`    | Records per page                     |
| `search`   | string | `""`    | Text search across key fields        |
| `fromdate` | string | `""`    | Filter from date (ISO 8601)          |
| `todate`   | string | `""`    | Filter to date (ISO 8601)            |

### Response shape every list endpoint MUST return

```json
{
  "data": [...],
  "totalPages": 8,
  "currentPage": 1,
  "totalCount": 75
}
```

---

## ⚠️ BACKEND IMPLEMENTATION REQUIRED

These endpoints are **called with full pagination params from the frontend** but the backend has NOT yet implemented the paginated response. The frontend will silently fall back to showing all records until these are implemented.

### Priority 1 — Core lists (high traffic)

#### `GET /employee/list`
- Add `page`, `limit`, `search` (across `name`, `employeeId`, `designation`, `department`), `fromdate`/`todate` on `joining_date`

#### `GET /contractor/contractorlist`
- Add `page`, `limit`, `search` (across `contractor_name`, `company_name`, `contractor_id`), `fromdate`/`todate` on `createdAt`

#### `GET /tender/gettenders`
- Add `page`, `limit`, `search` (across `tender_name`, `tender_id`, `tender_location`), `fromdate`/`todate` on `tender_start_date`

#### `GET /tender/gettendersemdsd`
- Add `page`, `limit`, `search` (across `tender_name`, `tender_id`), `fromdate`/`todate` on `tender_start_date`

#### `GET /tender/gettendersworkorder`
- Add `page`, `limit`, `search` (across `tender_name`, `tender_project_name`, `tender_id`), `fromdate`/`todate` on `tender_start_date`

#### `GET /client/getclients`
- Add `page`, `limit`, `search` (across `client_name`, `client_id`, `contact_person`), `fromdate`/`todate` on `createdAt`

---

### Priority 2 — Finance endpoints (all need full pagination)

#### `GET /journalentry/list`
- Add `page`, `limit`, `search` (across `je_no`, `description`, `narration`), `fromdate`/`todate` on `je_date`
- Extra: `status` filter (optional), `je_type` filter (optional)

#### `GET /creditnote/list`
- Add `page`, `limit`, `search` (across `cn_no`, `supplier_name`, `tender_name`), `fromdate`/`todate` on `cn_date`
- Extra: `status` filter (optional)

#### `GET /creditnote/by-supplier/:supplierId`
- Add `page`, `limit`, `search` (across `cn_no`), `fromdate`/`todate` on `cn_date`

#### `GET /creditnote/by-tender/:tenderId`
- Add `page`, `limit`, `search` (across `cn_no`, `supplier_name`), `fromdate`/`todate` on `cn_date`

#### `GET /debitnote/list`
- Add `page`, `limit`, `search` (across `dn_no`, `supplier_name`, `tender_name`), `fromdate`/`todate` on `dn_date`
- Extra: `status` filter (optional)

#### `GET /debitnote/by-supplier/:supplierId`
- Add `page`, `limit`, `search` (across `dn_no`), `fromdate`/`todate` on `dn_date`

#### `GET /debitnote/by-tender/:tenderId`
- Add `page`, `limit`, `search` (across `dn_no`, `supplier_name`), `fromdate`/`todate` on `dn_date`

#### `GET /paymentvoucher/list/cash`
- Add `page`, `limit`, `search` (across `pv_no`, `supplier_name`, `tender_id`), `fromdate`/`todate` on `pv_date`
- Extra: `status` filter (optional)

#### `GET /receiptvoucher/list/cash`
- Add `page`, `limit`, `search` (across `rv_no`, `supplier_name`, `tender_id`), `fromdate`/`todate` on `rv_date`
- Extra: `status` filter (optional)

#### `GET /paymentvoucher/list/bank`
- Add `page`, `limit`, `search` (across `pv_no`, `supplier_name`, `tender_id`), `fromdate`/`todate` on `pv_date`
- Extra: `status` filter (optional)

#### `GET /receiptvoucher/list/bank`
- Add `page`, `limit`, `search` (across `rv_no`, `supplier_name`, `tender_id`), `fromdate`/`todate` on `rv_date`
- Extra: `status` filter (optional)

#### `GET /banktransfer/list`
- Add `page`, `limit`, `search` (across `transfer_no`, `from_account_name`, `to_account_name`, `tender_id`), `fromdate`/`todate` on `transfer_date`
- Extra: `status` filter (optional)

#### `GET /accounttree/list`
- Add `page`, `limit`, `search` (across `account_name`, `account_code`), `fromdate`/`todate` on `createdAt`
- Extra: `parent_code` filter (optional), `is_posting_account` boolean (optional)

---

### Priority 3 — HR endpoints

#### `GET /nmrattendance/api/list/:projectId`
- **Breaking change:** rename old `from`/`to` params → `fromdate`/`todate`
- Add `page`, `limit`, `search` (across `contractor_id`)
- Extra: `contractor_id` filter (optional)

#### `GET /attendance/get-monthly-report`
- Replace old `month`/`year` with `fromdate`/`todate`
- Add `page`, `limit`, `search` (across `employee_name`, `employeeId`)

#### `GET /attendance/get-daily-report`
- Replace old single `date` param with `fromdate`/`todate`
- Add `page`, `limit`, `search` (across `employee_name`, `employeeId`)

#### `GET /attendance/regularization-list`
- Add `page`, `limit`, `search` (across `employee_name`, `employeeId`), `fromdate`/`todate`

#### `GET /leave/all-pending`
- Add `page`, `limit`, `search` (across `employee_name`, `leaveType`), `fromdate`/`todate` on `fromDate`
- Extra: `status` filter (optional: `Pending`, `Manager Approved`, etc.)

#### `GET /payroll/monthly-run`
- Add `page`, `limit`, `search` (across `employee_name`, `employeeId`), `fromdate`/`todate`
- **Keep:** `month`, `year` as primary filters alongside standard params

#### `GET /payroll/employee/:employeeId`
- Add `page`, `limit`, `fromdate`/`todate`
- **Keep:** `year` filter

#### `GET /geofence/list`
- Add `page`, `limit`, `search` (across `name`, `description`, `project_name`), `fromdate`/`todate` on `createdAt`
- Extra: `isActive` boolean filter (optional)

#### `GET /contractworker/getcontractworker`
- Add `page`, `limit`, `search` (across `worker_name`, `worker_id`, `contractor_id`), `fromdate`/`todate` on `createdAt`

---

### Priority 4 — Site & Purchase endpoints

#### `GET /workdone/api/list/:tenderId`
- Add `page`, `limit`, `search` (across `report_date`, `contractor_name`), `fromdate`/`todate` on `report_date`

#### `GET /workorderdone/api/list/:tenderId`
- Add `page`, `limit`, `search` (across `report_date`), `fromdate`/`todate` on `report_date`

#### `GET /dlp/api/list/:projectId`
- Add `page`, `limit`, `search` (across `report_date`, `contractor_name`), `fromdate`/`todate` on `report_date`

#### `GET /weeklybilling/api/list/:tenderId`
- Add `page`, `limit`, `search` (across `bill_no`, `status`), `fromdate`/`todate` on `bill_date`

#### `GET /purchasebill/summary-all`
- Add `page`, `limit`, `search` (across `bill_no`, `vendor_name`, `tender_name`), `fromdate`/`todate` on `bill_date`

#### `GET /purchasebill/by-tender/:tenderId`
- Add `page`, `limit`, `search` (across `bill_no`, `vendor_name`), `fromdate`/`todate` on `bill_date`

#### `GET /boq/items/:tenderId`
- Add `page`, `limit`, `search` (across `item_code`, `description`)
- Date field: none needed

---

## Complete Endpoint List

### Endpoints with pagination (no backend work needed)

| # | Method | Endpoint | Module | Frontend Status |
|---|--------|----------|--------|-----------------|
| 1 | GET | `/notification/my` | Notifications | ✅ Done |

> **Note:** As backends are implemented, move them from the table above to this table.

---

### All 36 endpoints — full reference

| # | Method | Endpoint | Module | Backend Status |
|---|--------|----------|--------|----------------|
| 1  | GET | `/tender/gettenders` | Tender | 🔧 Needs pagination |
| 2  | GET | `/tender/gettendersemdsd` | Tender/EMD | 🔧 Needs pagination |
| 3  | GET | `/tender/gettendersworkorder` | Projects | 🔧 Needs pagination |
| 4  | GET | `/client/getclients` | Clients | 🔧 Needs pagination |
| 5  | GET | `/boq/items/:tenderId` | BOQ | 🔧 Needs pagination |
| 6  | GET | `/employee/list` | HR Employee | 🔧 Needs pagination |
| 7  | GET | `/contractor/contractorlist` | HR Contractor | 🔧 Needs pagination |
| 8  | GET | `/contractworker/getcontractworker` | HR NMR Workers | 🔧 Needs pagination |
| 9  | GET | `/nmrattendance/api/list/:projectId` | HR NMR Attend. | 🔧 + rename params |
| 10 | GET | `/attendance/get-monthly-report` | HR Attendance | 🔧 + replace params |
| 11 | GET | `/attendance/get-daily-report` | HR Attendance | 🔧 + replace params |
| 12 | GET | `/attendance/regularization-list` | HR Attendance | 🔧 Needs pagination |
| 13 | GET | `/leave/all-pending` | HR Leave | 🔧 Needs pagination |
| 14 | GET | `/payroll/monthly-run` | HR Payroll | 🔧 Needs pagination |
| 15 | GET | `/payroll/employee/:employeeId` | HR Payroll | 🔧 Needs pagination |
| 16 | GET | `/geofence/list` | HR Geofence | 🔧 Needs pagination |
| 17 | GET | `/workdone/api/list/:tenderId` | Site Work Done | 🔧 Needs pagination |
| 18 | GET | `/workorderdone/api/list/:tenderId` | Site WO Done | 🔧 Needs pagination |
| 19 | GET | `/dlp/api/list/:projectId` | Site DLP | 🔧 Needs pagination |
| 20 | GET | `/weeklybilling/api/list/:tenderId` | Site Billing | 🔧 Needs pagination |
| 21 | GET | `/purchasebill/summary-all` | Purchase Bill | 🔧 Needs pagination |
| 22 | GET | `/purchasebill/by-tender/:tenderId` | Purchase Bill | 🔧 Needs pagination |
| 23 | GET | `/journalentry/list` | Finance JE | 🔧 Needs pagination |
| 24 | GET | `/creditnote/list` | Finance CN | 🔧 Needs pagination |
| 25 | GET | `/creditnote/by-supplier/:id` | Finance CN | 🔧 Needs pagination |
| 26 | GET | `/creditnote/by-tender/:id` | Finance CN | 🔧 Needs pagination |
| 27 | GET | `/debitnote/list` | Finance DN | 🔧 Needs pagination |
| 28 | GET | `/debitnote/by-supplier/:id` | Finance DN | 🔧 Needs pagination |
| 29 | GET | `/debitnote/by-tender/:id` | Finance DN | 🔧 Needs pagination |
| 30 | GET | `/paymentvoucher/list/cash` | Finance Cash PV | 🔧 Needs pagination |
| 31 | GET | `/receiptvoucher/list/cash` | Finance Cash RV | 🔧 Needs pagination |
| 32 | GET | `/paymentvoucher/list/bank` | Finance Bank PV | 🔧 Needs pagination |
| 33 | GET | `/receiptvoucher/list/bank` | Finance Bank RV | 🔧 Needs pagination |
| 34 | GET | `/banktransfer/list` | Finance Transfer | 🔧 Needs pagination |
| 35 | GET | `/accounttree/list` | Finance COA | 🔧 Needs pagination |
| 36 | GET | `/notification/my` | Notifications | ✅ Already done |

---

## Backend Implementation Checklist (copy for Jira/Notion)

```
[ ] /tender/gettenders
[ ] /tender/gettendersemdsd
[ ] /tender/gettendersworkorder
[ ] /client/getclients
[ ] /boq/items/:tenderId
[ ] /employee/list
[ ] /contractor/contractorlist
[ ] /contractworker/getcontractworker
[ ] /nmrattendance/api/list/:projectId   ← also rename from/to → fromdate/todate
[ ] /attendance/get-monthly-report       ← replace month+year with fromdate/todate
[ ] /attendance/get-daily-report         ← replace single date with fromdate/todate
[ ] /attendance/regularization-list
[ ] /leave/all-pending
[ ] /payroll/monthly-run
[ ] /payroll/employee/:employeeId
[ ] /geofence/list
[ ] /workdone/api/list/:tenderId
[ ] /workorderdone/api/list/:tenderId
[ ] /dlp/api/list/:projectId
[ ] /weeklybilling/api/list/:tenderId
[ ] /purchasebill/summary-all
[ ] /purchasebill/by-tender/:tenderId
[ ] /journalentry/list
[ ] /creditnote/list
[ ] /creditnote/by-supplier/:id
[ ] /creditnote/by-tender/:id
[ ] /debitnote/list
[ ] /debitnote/by-supplier/:id
[ ] /debitnote/by-tender/:id
[ ] /paymentvoucher/list/cash
[ ] /receiptvoucher/list/cash
[ ] /paymentvoucher/list/bank
[ ] /receiptvoucher/list/bank
[ ] /banktransfer/list
[ ] /accounttree/list
```
