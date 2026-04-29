import * as yup from "yup";

// ── Preliminary Process Templates ──────────────────────────────────────────────
export const preliminarySiteWorkTemplate = [
  { label: "Site Visit & Reconnaissance", key: "site_visit_reconnaissance" },
  { label: "Site Approach & Accessibility", key: "site_approach_accessibility" },
  { label: "Site Hurdles Identification", key: "site_hurdles_identification" },
  { label: "Labour Shed Location and Feasibility", key: "labour_shed_location_feasibility" },
  { label: "Temporary EB Connection", key: "temporary_eb_connection" },
  { label: "Water Source Identification & Connection", key: "water_source_identification_connection" },
  { label: "Office, Labour and Materials Shed Setup", key: "office_labour_materials_shed_setup" },
  { label: "Yard for Steel and Bulk Materials", key: "yard_steel_bulk_materials" },
  { label: "Office Setup & Facilities", key: "office_setup_facilities" },
  { label: "Sub Contractors Identification", key: "sub_contractors_identification" },
  { label: "Vendor Identification", key: "vendor_identification" },
];

export const getPreliminaryStepSchema = () =>
  yup.object().shape({ notes: yup.string().required("Notes are required") });

// ── Tender Process Templates ───────────────────────────────────────────────────
export const tenderProcessDataTemplate = [
  { label: "Site Investigation", key: "site_investigation" },
  { label: "Pre bid Meeting", key: "pre_bid_meeting" },
  { label: "Bid Submit", key: "bid_submission" },
  { label: "Technical Bid Opening", key: "technical_bid_opening" },
  { label: "Commercial Bid Opening", key: "commercial_bid_opening" },
  { label: "Negotiations", key: "negotiation" },
  { label: "Work Order", key: "work_order" },
  { label: "Agreement", key: "agreement" },
];

export const getTenderStepSchema = () =>
  yup.object().shape({
    notes: yup.string().required("Notes are required"),
    date: yup.string().required("Date is required")
      .test("not-future", "Future dates not allowed", (v) =>
        !v || new Date(v).setHours(0,0,0,0) <= new Date().setHours(0,0,0,0)
      ),
    time: yup.string().required("Time is required"),
  });

export const getWorkOrderSchema = () =>
  yup.object().shape({
    workOrder_id: yup.string().required("Work Order ID is required"),
    workOrder_issued_date: yup.string().required("Work Order Issued Date is required")
      .test("not-future", "Future dates not allowed", (v) =>
        !v || new Date(v).setHours(0,0,0,0) <= new Date().setHours(0,0,0,0)
      ),
  });

export const getAgreementSchema = () =>
  yup.object().shape({
    agreement_id: yup.string().required("Agreement ID is required"),
    agreement_value: yup.number().typeError("Must be a number").required("Agreement Value is required"),
    agreement_issued_date: yup.string().required("Agreement Issued Date is required")
      .test("not-future", "Future dates not allowed", (v) =>
        !v || new Date(v).setHours(0,0,0,0) <= new Date().setHours(0,0,0,0)
      ),
  });
