# Leave Module Documentation

**Location:** `src/pages/dashboard/profile/leave/`
**Accessed via:** Dashboard > Profile > "Leave Management" tab

---

## File Structure

```
src/pages/dashboard/profile/leave/
  |- Leave.jsx              # Main leave page (list + filters + tabs)
  |- ApplyLeaveModal.jsx    # Modal form to apply for a new leave
  |- LeaveActionModal.jsx   # Modal for managers to approve/reject requests
```

---

## 1. Leave.jsx — Main Leave Page

### Purpose
The primary leave management view for employees. It serves **two roles** via tabs:
- **My History** — Employee views their own leave records
- **Team Requests** — Manager views pending leave requests from their team

### State Management

| State | Type | Purpose |
|-------|------|---------|
| `activeTab` | `"my-leaves"` / `"team-requests"` | Controls which tab is active |
| `leaves` | `Array` | Raw leave records from API |
| `loading` | `Boolean` | Loading spinner state |
| `filterStatus` | `String` | Filter by status (All/Pending/Approved/Rejected/Cancelled) |
| `filterType` | `String` | Filter by leave type (All/CL/SL/PL/LWP/CompOff/Permission) |
| `dateRange` | `{ start, end }` | Date range filter |
| `searchQuery` | `String` | Search by reason or employee name |
| `isApplyModalOpen` | `Boolean` | Controls ApplyLeaveModal visibility |
| `isActionModalOpen` | `Boolean` | Controls LeaveActionModal visibility |
| `selectedRequest` | `Object / null` | The leave request selected for manager review |

### Data Flow

```
1. Component mounts / tab changes
      |
2. fetchLeaves() called
      |
3. API endpoint chosen based on activeTab:
      - "my-leaves"      -> GET /leave/my-history?employeeId={userId}
      - "team-requests"  -> GET /leave/team-pending?managerId={userId}
      |
4. Response stored in `leaves` state
      |
5. Client-side filtering applied via `filteredLeaves` (useMemo)
      - Status filter
      - Leave type filter
      - Date range overlap check
      - Search query (reason + employee name)
      |
6. Filtered data rendered in table
```

### API Endpoints Used

| Action | Method | Endpoint | Payload |
|--------|--------|----------|---------|
| Fetch own leaves | GET | `/leave/my-history?employeeId={id}` | — |
| Fetch team pending | GET | `/leave/team-pending?managerId={id}` | — |
| Cancel own leave | POST | `/leave/cancel` | `{ leaveRequestId, cancelledBy }` |

### User Actions
- **Apply Leave** (My History tab only) — Opens `ApplyLeaveModal`
- **Cancel Leave** — Available on own "Pending" leaves; calls `/leave/cancel` after confirmation
- **Download** — Button shown on "Approved" leaves (UI only, no handler yet)
- **Review** (Team Requests tab only) — Opens `LeaveActionModal` for pending requests

### Sub-Components (defined in same file)

| Component | Purpose |
|-----------|---------|
| `TabButton` | Styled tab switcher button |
| `StatWidget` | Leave balance card (shows used/total with progress bar) |
| `StatusBadge` | Color-coded status pill (Pending/Approved/Manager Approved/Rejected/Cancelled) |
| `TypeIcon` | Small colored icon showing leave type abbreviation |
| `SkeletonRow` | Animated placeholder row during loading |

### Leave Balance Display (My History tab)
Shows 4 stat widgets from `user.leaveBalance`:

| Widget | Balance Key | Default Total |
|--------|-------------|---------------|
| Casual Leave | `CL` | 12 |
| Sick Leave | `SL` | 10 |
| Privilege Leave | `PL` | 15 |
| Comp Offs | `compOffCount` | Shows count taken, no total |

---

## 2. ApplyLeaveModal.jsx — Apply Leave Form

### Purpose
A split-panel modal for submitting a new leave request. Left side has the form, right side shows a mini calendar with holiday highlighting.

### Form Fields

| Field | Name | Type | Notes |
|-------|------|------|-------|
| Leave Type | `leaveType` | Select | CL, SL, PL, LWP, CompOff, Permission |
| Request Duration | `requestType` | Select | Full Day, First Half, Second Half, Short Leave |
| From Date | `fromDate` | Date | Required |
| To Date | `toDate` | Date | Required; disabled for Short Leave |
| From Time | `fromTime` | Time | Only shown for Short Leave |
| To Time | `toTime` | Time | Only shown for Short Leave |
| Reason | `reason` | Textarea | Required |
| Total Days | `totalDays` | Calculated | Auto-computed, read-only display |

### Special Leave Type Rules

| Leave Type | Behavior |
|------------|----------|
| **Permission** | Forces `requestType` to "Short Leave"; locks duration dropdown; `toDate` = `fromDate`; requires time inputs; max 2 hours; no balance deduction |
| **CompOff** | Forces `requestType` to "Full Day"; locks duration dropdown |
| **LWP** | No balance check (Loss of Pay) |
| **CL / SL / PL** | Standard flow; balance is checked before submit |

### Smart Day Calculation Logic (`calculateSmartDays`)

```
Input: fromDate, toDate, requestType
Output: { days: Number, holidaysFound: Array }

1. If requestType is "Short Leave" -> return 0 days
2. If fromDate > toDate -> show error, return 0
3. Loop through each day in range:
   - If day exists in holidaysMap -> skip (add to holidaysFound list)
   - If "Full Day" -> count += 1
   - If "First Half" or "Second Half" -> count += 0.5
4. Return { days: count, holidaysFound }
```

Holidays are automatically excluded from the day count and shown as warnings.

### Time Validation (`validateTime`) — For Short Leave / Permission

```
1. Parse fromTime and toTime into minutes
2. Calculate difference
3. If diff <= 0 -> "End time must be after Start time"
4. If diff > 120 -> "Permission cannot exceed 2 Hours"
```

### Holiday Calendar Integration
- Fetches holidays from `GET /calendar/listall?year={year}`
- Builds a `Map<dateString, holidayName>` for O(1) lookups
- Mini calendar on the right highlights:
  - **Red** — Holiday
  - **Blue** — Selected leave days
  - **Orange** — Days that overlap (selected + holiday = excluded)

### Submit Validation Chain

```
1. Check dateError or timeError exist -> block submit
2. If Short Leave:
   a. fromTime and toTime must be filled
   b. fromDate must NOT be a holiday
3. If regular leave (not Short Leave, not LWP, not Permission):
   a. totalDays must not exceed available balance
4. All checks pass -> POST /leave/apply
```

### API Call on Submit

| Method | Endpoint | Payload |
|--------|----------|---------|
| POST | `/leave/apply` | `{ employeeId, leaveType, requestType, fromDate, toDate, totalDays, reason, shortLeaveTime: { from, to } or null }` |

### On Success
1. Shows success toast
2. Calls `onSuccess()` (parent refetches leave list)
3. Resets form to initial state
4. Closes modal

---

## 3. LeaveActionModal.jsx — Manager Approve/Reject

### Purpose
A compact modal for managers to review and take action on a team member's pending leave request.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | Boolean | Controls visibility |
| `onClose` | Function | Closes the modal |
| `onSuccess` | Function | Callback to refresh the leave list |
| `request` | Object | The leave request being reviewed |
| `user` | Object | The logged-in manager |

### Displayed Information
- Employee name and avatar initial
- Leave type and total days
- Date range (fromDate — toDate)
- Reason (quoted, italic)

### Manager Input
- **Remarks** (textarea, required) — Manager must provide comments before any action

### Actions

| Button | Action Value | API Call |
|--------|-------------|----------|
| Reject | `"Reject"` | POST `/leave/action` |
| Approve Leave | `"Approve"` | POST `/leave/action` |

### API Call

| Method | Endpoint | Payload |
|--------|----------|---------|
| POST | `/leave/action` | `{ leaveRequestId, actionBy, role: "Manager", action: "Approve"/"Reject", remarks }` |

### Validation
- Remarks field is mandatory. If empty, shows a warning toast and blocks submission.

### On Success
1. Shows toast: "Leave {action}d Successfully"
2. Calls `onSuccess()` to refresh parent list
3. Closes modal

---

## Overall Leave Flow

```
                         EMPLOYEE                                    MANAGER
                            |                                           |
                   Opens Profile Page                                   |
                   Clicks "Leave Management" tab                        |
                            |                                           |
                  +--------------------+                                |
                  |   Leave.jsx        |                                |
                  |   (My History tab) |                                |
                  +--------------------+                                |
                            |                                           |
                  Clicks "Apply Leave"                                  |
                            |                                           |
                  +----------------------+                              |
                  | ApplyLeaveModal.jsx  |                              |
                  | - Selects leave type |                              |
                  | - Picks dates        |                              |
                  | - Enters reason      |                              |
                  | - Smart day calc     |                              |
                  +----------------------+                              |
                            |                                           |
                  POST /leave/apply                                     |
                            |                                           |
                  Status = "Pending"                                    |
                            |                                           |
                            +------ Appears in Manager's -------->     |
                                    "Team Requests" tab                 |
                                                                        |
                                                              +------------------------+
                                                              |  Leave.jsx             |
                                                              |  (Team Requests tab)   |
                                                              +------------------------+
                                                                        |
                                                              Clicks "Review"
                                                                        |
                                                              +------------------------+
                                                              | LeaveActionModal.jsx   |
                                                              | - Reviews details      |
                                                              | - Enters remarks       |
                                                              | - Approve / Reject     |
                                                              +------------------------+
                                                                        |
                                                              POST /leave/action
                                                                        |
                                                              Status = "Approved" or "Rejected"
                                                                        |
                            <------- Reflected in Employee's -----+
                                     "My History" tab
                                     (with rejection reason if rejected)
```

---

## API Endpoints Summary

| # | Method | Endpoint | Used By | Purpose |
|---|--------|----------|---------|---------|
| 1 | GET | `/leave/my-history?employeeId={id}` | Leave.jsx | Fetch employee's own leaves |
| 2 | GET | `/leave/team-pending?managerId={id}` | Leave.jsx | Fetch team's pending requests |
| 3 | POST | `/leave/apply` | ApplyLeaveModal.jsx | Submit new leave request |
| 4 | POST | `/leave/cancel` | Leave.jsx | Cancel a pending leave |
| 5 | POST | `/leave/action` | LeaveActionModal.jsx | Manager approve/reject |
| 6 | GET | `/calendar/listall?year={year}` | ApplyLeaveModal.jsx | Fetch holidays for calendar |

---

## Leave Types

| Code | Full Name | Balance Tracked | Notes |
|------|-----------|----------------|-------|
| CL | Casual Leave | Yes (default: 12) | Standard leave |
| SL | Sick Leave | Yes (default: 10) | Medical leave |
| PL | Privilege Leave | Yes (default: 15) | Planned/earned leave |
| LWP | Loss of Pay | No | No balance deduction, unpaid |
| CompOff | Compensatory Off | Tracked as count | Forced to "Full Day" request type |
| Permission | Permission | No | Forced to "Short Leave"; max 2hrs; max 3/month |

## Leave Statuses

| Status | Color | Description |
|--------|-------|-------------|
| Pending | Yellow | Awaiting manager review |
| Approved | Green | Fully approved |
| Manager Approved | Blue | Approved by manager (may need further approval) |
| Rejected | Red | Declined by manager (shows rejection reason) |
| Cancelled | Gray | Cancelled by employee |

---

## HR Admin Leave View

**Location:** `src/pages/Hr/leave/`

| File | Purpose |
|------|---------|
| `LeaveManagement.jsx` | Tab container with "Leave Requests", "Holiday Calendar", "Leave Policy" (coming soon) |
| `Leave.jsx` | Simple table view using shared `Table` component with static `Leavedata` |
| `Calendar.jsx` | Holiday calendar management |
| `UploadCalendar.jsx` | Upload holidays via Excel |

The HR admin view (`/hr/leave` route) is a separate, simpler interface for viewing all employee leaves in a table format, distinct from the employee self-service view in the profile/dashboard.
