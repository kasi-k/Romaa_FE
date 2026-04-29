/* Maps audit `entity_type` → front-end deep-link URL.
   Most detail pages in the app read the record from React Router `location.state`,
   so a bare `<a href>` can't pass the full object — we fall back to the list page
   for those entities and only link to path-param detail pages directly. */

export const ENTITY_LINK = {
  // Tender
  Tender:                 (id) => `/tender/tenders/viewtender/${id}`,
  Client:                 ()   => `/tender/customers`,
  DLP:                    ()   => `/tender/dlp`,
  EMD:                    ()   => `/tender/emd`,
  Penalty:                ()   => `/tender/projectpenalty`,
  BOQ:                    ()   => `/projects/zerocost`,
  Bid:                    ()   => `/tender/tenders`,
  Material:               ()   => `/tender/tenders`,
  MaterialTransaction:    ()   => `/tender/tenders`,
  RateAnalysis:           ()   => `/projects/zerocost`,
  RateAnalysisQuantity:   ()   => `/projects/zerocost`,
  DetailedEstimate:       ()   => `/projects/detailestimate`,
  SiteOverhead:           ()   => `/projects/zerocost`,
  TenderContractWorker:   ()   => `/tender/tenders`,
  TenderDocument:         ()   => `/tender/tenders`,

  // Project
  Schedule:               ()   => `/projects/projectschedule`,
  ScheduleLite:           ()   => `/projects/projectschedule`,
  Task:                   ()   => `/projects/projectschedule`,
  WorkOrderRequest:       ()   => `/projects/woissuance`,
  DrawingVsBOQ:           ()   => `/projects/drawingboq`,
  BillingEstimate:        ()   => `/projects/clientbillingprojects`,
  SteelEstimate:          ()   => `/projects/detailestimate`,
  WorkOrderDocument:      ()   => `/projects/woissuance`,
  SiteDrawing:            ()   => `/projects/sitedrawing`,

  // Purchase / Site
  Vendor:                 (id) => `/purchase/vendorsupplier/viewvendorsupplier/${id}`,
  PurchaseRequest:        ()   => `/purchase/request`,
  WorkDone:               ()   => `/site/workdone`,
  WorkOrderDone:          ()   => `/site/workorderdone`,

  // Assets
  MachineryAsset:         (id) => `/settings/assets/details/${id}`,
  MachineryLog:           ()   => `/site/machineryentry`,
  MaintenanceLog:         ()   => `/settings/assets`,

  // HR
  Employee:               ()   => `/hr/employee`,
  LeaveRequest:           ()   => `/hr/leave`,
  LeaveBalanceHistory:    ()   => `/hr/leave`,
  Payroll:                ()   => `/hr/payroll`,
  Holiday:                ()   => `/hr/leave`,
  Geofence:               ()   => `/hr/geofence`,
  Contractor:             ()   => `/hr/contractnmr`,
  ContractEmployee:       ()   => `/hr/nmr`,
  NmrAttendance:          ()   => `/hr/NMRattendance`,
  UserAttendance:         ()   => `/hr/attendance`,

  // Identity / Master / Approval
  Role:                   ()   => `/settings/roles`,
  User:                   ()   => `/settings/user`,
  Notification:           ()   => null,
  HsnSac:                 ()   => `/settings/hsnmaster`,
  ApprovalRule:           ()   => `/settings/approval-rules`,
  ApprovalRequest:        ()   => `/finance/approvals`,
};

export const buildEntityLink = (row) => {
  const fn = ENTITY_LINK[row.entity_type];
  if (!fn) return null;
  const url = fn(row.entity_id);
  return url || null;
};

// Grouped for <select> — from §6 of the audit guide (finance entities live elsewhere).
export const ENTITY_OPTIONS = [
  { group: "HR", items: [
    "Employee", "LeaveRequest", "LeaveBalanceHistory", "Payroll", "Holiday",
    "Geofence", "Contractor", "ContractEmployee", "NmrAttendance", "UserAttendance",
  ]},
  { group: "Tender", items: [
    "Tender", "BOQ", "Bid", "EMD", "Material", "MaterialTransaction",
    "RateAnalysis", "RateAnalysisQuantity", "Penalty", "DetailedEstimate",
    "SiteOverhead", "TenderContractWorker",
  ]},
  { group: "Project", items: [
    "Schedule", "ScheduleLite", "Task", "WorkOrderRequest",
    "DrawingVsBOQ", "BillingEstimate", "SteelEstimate",
  ]},
  { group: "Purchase / Site / Assets / Docs", items: [
    "Vendor", "PurchaseRequest", "WorkDone", "WorkOrderDone", "DLP",
    "MachineryAsset", "MachineryLog", "MaintenanceLog",
    "TenderDocument", "WorkOrderDocument", "SiteDrawing",
  ]},
  { group: "Identity / Master / Approval", items: [
    "Role", "User", "Client", "Notification", "HsnSac",
    "ApprovalRule", "ApprovalRequest",
  ]},
];

export const ALL_ENTITIES = ENTITY_OPTIONS.flatMap((g) => g.items);
