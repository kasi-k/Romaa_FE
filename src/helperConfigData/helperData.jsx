 import {  RiDashboardLine } from "react-icons/ri";
import { MapPin, TrendingUp } from "lucide-react";
import { TbAssembly, TbFileDelta, TbListSearch } from "react-icons/tb";
import { LuFileBox, LuUserRoundSearch } from "react-icons/lu";
import { BsCart3 } from "react-icons/bs";
import { HiOutlineClipboardList } from "react-icons/hi";
import { LiaClipboardListSolid } from "react-icons/lia";
import { TbLockDollar } from "react-icons/tb";
import { TbDatabaseDollar } from "react-icons/tb";
import { LuLandPlot } from "react-icons/lu";
import { LuNotebookText } from "react-icons/lu";
import { TbReportMoney } from "react-icons/tb";
import { TbReportAnalytics } from "react-icons/tb";
import { FiSettings } from "react-icons/fi";
import { AiOutlineFileAdd } from "react-icons/ai";
import { RiBankLine } from "react-icons/ri";
import { LuFileUser } from "react-icons/lu";
import { TbDoorExit } from "react-icons/tb";
import { LuScrollText } from "react-icons/lu";
import { TbContract } from "react-icons/tb";
import {
  Quote,
  Scale,
} from "lucide-react";
import { BookUser } from "lucide-react";
import { ScrollText } from "lucide-react";
import { TbReceipt2 } from "react-icons/tb";
import { IoCartOutline } from "react-icons/io5";
import { MdContentPasteSearch } from "react-icons/md";
import { LuGlassWater } from "react-icons/lu";
import { LuWorkflow } from "react-icons/lu";
import { RiBillLine } from "react-icons/ri";
import { TbFileDollar } from "react-icons/tb";
import { TbFileInvoice } from "react-icons/tb";
import { TbFileOrientation } from "react-icons/tb";
import { RiDiscountPercentLine } from "react-icons/ri";
import { PiBoundingBoxBold, PiHash, PiTreeStructureBold } from "react-icons/pi";
import { RiNodeTree } from "react-icons/ri";
import { TbCalendarStats } from "react-icons/tb";
import { AiOutlineFileDone } from "react-icons/ai";
import { GrInProgress } from "react-icons/gr";
import { GiHoneycomb } from "react-icons/gi";
import { RiUserAddLine } from "react-icons/ri";
import { GrGroup } from "react-icons/gr";
import { RiGroupLine } from "react-icons/ri";
import { TbShieldLock } from "react-icons/tb";
import { TbShieldCheckered } from "react-icons/tb";
import { RiShareBoxLine } from "react-icons/ri";
import { HiOutlineCash } from "react-icons/hi";
import { TfiLayoutListThumb } from "react-icons/tfi";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { TbBuildingBank, TbTransferIn, TbExchange, TbReceiptTax, TbAlertCircle, TbRepeat, TbTarget } from "react-icons/tb";
import { LuBookOpen, LuBookMarked } from "react-icons/lu";
import { GitMerge, Clock, FileText as FileText26Q, Package, FileCheck, Truck, Banknote, Shield, ClipboardList, Layers, TrendingDown, ArrowRightLeft, BarChart2, Activity, Star, CheckCircle, Calendar, FileSearch, Lock, Archive, Coins, Webhook, Sliders, FileUp, BookOpen } from "lucide-react";

import { BiShapeSquare } from "react-icons/bi";
import { BsBoxSeam } from "react-icons/bs";
import { RiBox3Line } from "react-icons/ri";
import { CiBoxList } from "react-icons/ci";
import { TbFolderQuestion } from "react-icons/tb";

export const Menus = [
  {
    title: "Dashboard",
    icon: <RiDashboardLine size={23} />,
    to: "/dashboard",
    module: "dashboard", 
  },
  {
    title: "Tender",
    icon: <TbFileDelta size={23} />,
    to: "/tender/customers",
    module: "tender", 
    nested: [
      {
        title: "Clients",
        icon: <LuUserRoundSearch size={23} />,
        to: "/tender/customers",
        subModule: "clients", 
      },
      {
        title: "Tenders",
        icon: <HiOutlineClipboardList size={23} />,
        to: "/tender/tenders",
        subModule: "tenders",
      },
      {
        title: "DLP",
        icon: <TbDatabaseDollar size={23} />,
        to: "/tender/dlp",
        subModule: "dlp",
      },
      {
        title: "EMD",
        icon: <TbLockDollar size={23} />,
        to: "/tender/emd",
        subModule: "emd",
      },
      {
        title: "Security Deposit",
        icon: <TbShieldLock size={23} />,
        to: "/tender/securitydeposit",
        subModule: "security_deposit",
      },
      {
        title: "Project Penalty",
        icon: <TbShieldCheckered size={23} />,
        to: "/tender/projectpenalty",
        subModule: "project_penalty",
      },
    ],
  },
  {
    title: "Projects",
    icon: <HiOutlineClipboardList size={23} />,
    to: "/projects",
    module: "project",
    nested: [
      {
        title: "BOQ Cost",
        icon: <RiDiscountPercentLine size={23} />,
        to: "/projects/zerocost",
        subModule: "boq_cost",
      },
      {
        title: "Detailed Estimate",
        icon: <HiOutlineClipboardList size={23} />,
        to: "/projects/detailestimate",
        subModule: "detailed_estimate",
      },
      {
        title: "Drawing vs BOQ",
        icon: <PiBoundingBoxBold size={23} />,
        to: "/projects/drawingboq",
        subModule: "drawing_boq",
      },
       {
        title: "Site Drawing",
        icon: <PiBoundingBoxBold size={23} />,
        to: "/projects/sitedrawing",
        subModule: "site_drawing",
      },
      {
        title: "WBS",
        icon: <RiNodeTree size={23} />,
        to: "/projects/wbs",
        subModule: "wbs",
      },
      {
        title: "Schedule",
        icon: <TbCalendarStats size={23} />,
        to: "/projects/projectschedule",
        subModule: "schedule",
      },
      {
        title: "WOR / WO issuance",
        icon: <AiOutlineFileDone size={23} />,
        to: "/projects/woissuance",
        subModule: "wo_issuance",
      },
      {
        title: "Client Billing",
        icon: <TbReceipt2 size={23} />,
        to: "/projects/clientbillingprojects",
        subModule: "client_billing",
      },
      {
        title: "Work Progress",
        icon: <GrInProgress size={23} />,
        to: "/projects/workprogressprojects",
        subModule: "work_progress",
      },
      {
        title: "Basic Material Quantity",
        icon: <PiHash size={23} />,
        to: "/projects/projectsmaterialquantity",
        subModule: "material_quantity",
      },
      {
        title: "Stocks",
        icon: <LuFileBox size={23} />,
        to: "/projects/projectsstocks",
        subModule: "stocks",
      },
      {
        title: "Assets",
        icon: <TbAssembly size={23} />,
        to: "/projects/projectsassets",
        subModule: "assets",
      },
    ],
  },
  {
    title: "Purchase",
    icon: <BsCart3 size={23} />,
    to: "/purchase/vendorsupplier",
    module: "purchase",
    nested: [
      {
        title: "Vendor & Supplier",
        icon: <BookUser size={23} />,
        to: "/purchase/vendorsupplier",
        subModule: "vendor_supplier",
      },
      {
        title: "Purchase Requests",
        icon: <AiOutlineFileAdd size={23} />,
        to: "/purchase/request",
        subModule: "request",
      },
      {
        title: "Purchase Enquiry",
        icon: <LiaClipboardListSolid size={23} />,
        to: "/purchase/enquiry",
        subModule: "enquiry",
      },
      {
        title: "Purchase Order",
        icon: <ScrollText size={23} />,
        to: "/purchase/order",
        subModule: "order",
      },
      {
        title: "Goods Receipt",
        icon: <TbReceipt2 size={23} />,
        to: "/purchase/goodsreceipt",
        subModule: "goods_receipt",
      },
      {
        title: "Purchase Bill",
        icon: <IoCartOutline size={23} />,
        to: "/purchase/bill",
        subModule: "bill",
      },
      {
        title: "Machinery Tracking",
        icon: <MdContentPasteSearch size={23} />,
        to: "/purchase/machinerytracking",
        subModule: "machinery_tracking",
      },
      {
        title: "Stocks",
        icon: <LuFileBox size={23} />,
        to: "/purchase/purchasestocks",
        subModule: "stocks",
      },
      {
        title: "Assets",
        icon: <TbAssembly size={23} />,
        to: "/purchase/purchaseassets",
        subModule: "assets",
      },
    ],
  },
  {
    title: "Site",
    icon: <LuLandPlot size={23} />,
    to: "/site",
    module: "site",
    nested: [
      {
        title: "BOQ Site",
        icon: <ScrollText size={23} />,
        to: "/site/boqsite",
        subModule: "boq_site",
      },
      {
        title: "Detailed Estimate ",
        icon: <AiOutlineFileAdd size={23} />,
        to: "/site/detailestimatesite",
        subModule: "detailed_estimate",
      },
      {
        title: "Site Drawing",
        icon: <BiShapeSquare size={23} />,
        to: "/site/sitedrawing",
        subModule: "site_drawing",
      },
      {
        title: "Purchase Request",
        icon: <TbFolderQuestion size={23} />,
        to: "/site/purchaserequestsite",
        subModule: "purchase_request",
      },
      {
        title: "Material Received",
        icon: <BsBoxSeam size={23} />,
        to: "/site/materialrecievedsite",
        subModule: "material_received",
      },
      {
        title: "Material Issued",
        icon: <RiBox3Line size={23} />,
        to: "/site/materialissuedsite",
        subModule: "material_issued",
      },
      {
        title: "Stock Register",
        icon: <CiBoxList size={23} />,
        to: "/site/stockregistersite",
        subModule: "stock_register",
      },
      {
        title: "Work Order Done",
        icon: <TbReceipt2 size={23} />,
        to: "/site/workorderdone",
        subModule: "workorder_done",
      },
      {
        title: "Work Done",
        icon: <TbReceipt2 size={23} />,
        to: "/site/workdone",
        subModule: "work_done",
      },
      {
        title: "Daily Labour Report",
        icon: <TbReportAnalytics size={23} />,
        to: "/site/dialylabourreport",
        subModule: "daily_labour_report",
      },
      {
        title: "Machinery Entry",
        icon: <LuGlassWater size={23} />,
        to: "/site/machineryentry",
        subModule: "machinery_entry",
      },
      {
        title: "Site Assets",
        icon: <TbAssembly size={23} />,
        to: "/site/siteassets",
        subModule: "site_assets",
      },
      {
        title: "Weekly Billing",
        icon: <TbReceipt2 size={23} />,
        to: "/site/weeklybillingsite",
        subModule: "weekly_billing",
      },
      {
        title: "Reconciliation",
        icon: <TbFileOrientation size={23} />,
        to: "/site/reconciliationsite",
        subModule: "reconciliation",
      },
      {
        title: "Planned vs Achieved",
        icon: <Quote size={23} />,
        to: "/site/plannedvsachived",
        subModule: "planned_vs_achieved",
      },
    ],
  },
  {
    title: "HR",
    icon: <LuNotebookText size={23} />,
    to: "/hr/employee",
    module: "hr",
    nested: [
      {
        title: "Employee",
        icon: <AiOutlineFileAdd size={23} />,
        to: "/hr/employee",
        subModule: "employee",
      },
      {
        title: "Attendance",
        icon: <LuFileUser size={23} />,
        to: "/hr/attendance",
        subModule: "attendance",
      },
      {
        title: "Leave",
        icon: <TbDoorExit size={23} />,
        to: "/hr/leave",
        subModule: "leave",
      },
      {
        title: "Payroll",
        icon: <LuScrollText size={23} />,
        to: "/hr/payroll",
        subModule: "payroll",
      },
      {
        title: "Contract & NMR",
        icon: <TbContract size={23} />,
        to: "/hr/contractnmr",
        subModule: "contract_nmr",
      },
      {
        title: "NMR",
        icon: <TbListSearch size={23} />,
        to: "/hr/nmr",
        subModule: "nmr",
      },
      {
        title: "NMR Attendance",
        icon: <TfiLayoutListThumb size={23} />,
        to: "/hr/NMRattendance",
        subModule: "nmr_attendance",
      },
      {
        title: "Geofence",
        icon: <MapPin size={23} />,
        to: "/hr/geofence",
        subModule: "geofence",
      },
      {
        title: "Score Card",
        icon: <TrendingUp size={23} />,
        to: "/hr/scorecard",
        subModule: "scorecard",
      },
    ],
  },
  {
    title: "Finance",
    icon: <TbReportMoney size={23} />,
    to: "/finance/clientbilling",
    module: "finance",
    nested: [
      // ── Core Billing ──
      {
        title: "Client Billing",
        icon: <TbReceipt2 size={23} />,
        to: "/finance/clientbilling",
        subModule: "client_billing",
      },
      {
        title: "Purchase Bills",
        icon: <TbFileInvoice size={23} />,
        to: "/finance/purchasetotalbill",
        subModule: "purchase_bill",
      },
      {
        title: "Contractor Bills",
        icon: <TbFileDollar size={23} />,
        to: "/finance/contractorbill",
        subModule: "contractor_bill",
      },
      {
        title: "Supplier Outstanding",
        icon: <TbAlertCircle size={23} />,
        to: "/finance/supplieroutstanding",
        subModule: "supplier_outstanding",
      },
      // ── Banking & Setup ──
      {
        title: "Chart of Accounts",
        icon: <PiTreeStructureBold size={23} />,
        to: "/finance/banks",
        subModule: "banks",
      },
      {
        title: "Company Banks",
        icon: <RiBankLine size={23} />,
        to: "/finance/companybankdetails",
        subModule: "company_bank_details",
      },
      {
        title: "Bank Transactions",
        icon: <TbBuildingBank size={23} />,
        to: "/finance/banktransaction",
        subModule: "bank_transaction",
      },
      {
        title: "Internal Transfers",
        icon: <TbTransferIn size={23} />,
        to: "/finance/internalbanktransfer",
        subModule: "internal_transfer",
      },
      // ── Ledger & Accounting ──
      {
        title: "Ledger Entries",
        icon: <LuBookOpen size={23} />,
        to: "/finance/ledgerentry",
        subModule: "ledger_entry",
      },
      {
        title: "Journal Entries",
        icon: <LuBookMarked size={23} />,
        to: "/finance/journalentry",
        subModule: "journal_entry",
      },
      {
        title: "Cash Entries",
        icon: <HiOutlineCash size={23} />,
        to: "/finance/cashentry",
        subModule: "cash_entry",
      },
      // ── Adjustments & Compliance ──
      {
        title: "Debit & Credit Notes",
        icon: <TbExchange size={23} />,
        to: "/finance/debitcreditnote",
        subModule: "debit_credit_note",
      },
      {
        title: "Overall Expenses",
        icon: <TbReportAnalytics size={23} />,
        to: "/finance/overallexpenses",
        subModule: "overall_expenses",
      },
      // ── Finance Reports ──
      {
        title: "Trial Balance",
        icon: <Scale size={23} />,
        to: "/finance/trialbalance",
        subModule: "trial_balance",
      },
      {
        title: "Profit & Loss",
        icon: <TrendingUp size={23} />,
        to: "/finance/profitloss",
        subModule: "profit_loss",
      },
      {
        title: "Balance Sheet",
        icon: <LuBookOpen size={23} />,
        to: "/finance/balancesheet",
        subModule: "balance_sheet",
      },
      {
        title: "General Ledger",
        icon: <LuBookMarked size={23} />,
        to: "/finance/generalledger",
        subModule: "general_ledger",
      },
      {
        title: "Cash Flow",
        icon: <TbReportMoney size={23} />,
        to: "/finance/cashflowstatement",
        subModule: "cash_flow",
      },
      {
        title: "GSTR-1",
        icon: <TbFileOrientation size={23} />,
        to: "/finance/gstr1",
        subModule: "gstr1",
      },
      {
        title: "GSTR-2B",
        icon: <TbFileOrientation size={23} />,
        to: "/finance/gstr2b",
        subModule: "gstr2b",
      },
      {
        title: "GSTR-3B",
        icon: <TbFileOrientation size={23} />,
        to: "/finance/gstr3b",
        subModule: "gstr3b",
      },
      {
        title: "ITC Reversal",
        icon: <TbExchange size={23} />,
        to: "/finance/itcreversal",
        subModule: "itc_reversal",
      },
      {
        title: "TDS Register",
        icon: <TbReceiptTax size={23} />,
        to: "/finance/tdsregister",
        subModule: "tds_register",
      },
      // ── Finance Tier 2 ──
      {
        title: "Bank Reconciliation",
        icon: <GitMerge size={23} />,
        to: "/finance/bankreconciliation",
        subModule: "bank_reconciliation",
      },
      {
        title: "Recurring Vouchers",
        icon: <TbRepeat size={23} />,
        to: "/finance/recurringvouchers",
        subModule: "recurring_vouchers",
      },
      {
        title: "Budgets & Variance",
        icon: <TbTarget size={23} />,
        to: "/finance/budgets",
        subModule: "budgets",
      },
      {
        title: "Aging Reports",
        icon: <Clock size={23} />,
        to: "/finance/agingreports",
        subModule: "aging_reports",
      },
      {
        title: "Fixed Assets",
        icon: <Package size={23} />,
        to: "/finance/fixedassets",
        subModule: "fixed_assets",
      },
      {
        title: "Form 26Q",
        icon: <FileText26Q size={23} />,
        to: "/finance/form26q",
        subModule: "form_26q",
      },
      // ── Finance Tier 3 ──
      {
        title: "E-Invoice (IRN)",
        icon: <FileCheck size={23} />,
        to: "/finance/einvoice",
        subModule: "einvoice",
      },
      {
        title: "E-Way Bill",
        icon: <Truck size={23} />,
        to: "/finance/ewaybill",
        subModule: "ewaybill",
      },
      {
        title: "GST 2A/2B Matcher",
        icon: <GitMerge size={23} />,
        to: "/finance/gstmatcher",
        subModule: "gst_matcher",
      },
      {
        title: "Advance Allocation",
        icon: <Banknote size={23} />,
        to: "/finance/advanceallocation",
        subModule: "advance_allocation",
      },
      {
        title: "Retention Ledger",
        icon: <Shield size={23} />,
        to: "/finance/retention",
        subModule: "retention",
      },
      {
        title: "Audit Trail",
        icon: <ClipboardList size={23} />,
        to: "/finance/audittrail",
        subModule: "audit_trail",
      },
      {
        title: "Form 24Q",
        icon: <FileText26Q size={23} />,
        to: "/finance/form24q",
        subModule: "form_24q",
      },
      {
        title: "Form 16",
        icon: <FileText26Q size={23} />,
        to: "/finance/form16",
        subModule: "form_16",
      },
      {
        title: "Form 16A",
        icon: <FileText26Q size={23} />,
        to: "/finance/form16a",
        subModule: "form_16a",
      },
      {
        title: "GSTR-9 (Annual)",
        icon: <FileText26Q size={23} />,
        to: "/finance/gstr9",
        subModule: "gstr9",
      },
      // ── Finance Tier 4 ──
      {
        title: "Consolidation",
        icon: <Layers size={23} />,
        to: "/finance/consolidation",
        subModule: "consolidation",
      },
      {
        title: "Tender Profitability",
        icon: <TrendingUp size={23} />,
        to: "/finance/tenderprofitability",
        subModule: "tender_profitability",
      },
      {
        title: "Cash-Flow Forecast",
        icon: <TrendingDown size={23} />,
        to: "/finance/cashflowforecast",
        subModule: "cash_flow_forecast",
      },
      {
        title: "Fund Flow",
        icon: <ArrowRightLeft size={23} />,
        to: "/finance/fundflow",
        subModule: "fund_flow",
      },
      {
        title: "Ratio Analysis",
        icon: <BarChart2 size={23} />,
        to: "/finance/ratioanalysis",
        subModule: "ratio_analysis",
      },
      {
        title: "Contract POC",
        icon: <Activity size={23} />,
        to: "/finance/contractpoc",
        subModule: "contract_poc",
      },
      {
        title: "Supplier Scorecard",
        icon: <Star size={23} />,
        to: "/finance/supplierscorecard",
        subModule: "supplier_scorecard",
      },
      {
        title: "Approvals",
        icon: <CheckCircle size={23} />,
        to: "/finance/approvals",
        subModule: "approval",
      },
      {
        title: "Statutory Deadlines",
        icon: <Calendar size={23} />,
        to: "/finance/statutorydeadlines",
        subModule: "statutory_deadline",
      },
      {
        title: "Form 26AS",
        icon: <FileSearch size={23} />,
        to: "/finance/form26as",
        subModule: "form_26as",
      },
      {
        title: "Ledger Seal",
        icon: <Lock size={23} />,
        to: "/finance/ledgerseal",
        subModule: "ledger_seal",
      },
      {
        title: "Year-End Close",
        icon: <Archive size={23} />,
        to: "/finance/yearendclose",
        subModule: "year_end_close",
      },
      {
        title: "Currencies",
        icon: <Coins size={23} />,
        to: "/finance/admin/currency",
        subModule: "currency",
      },
      {
        title: "Finance Settings",
        icon: <Sliders size={23} />,
        to: "/finance/admin/settings",
        subModule: "finance_settings",
      },
      {
        title: "Webhooks",
        icon: <Webhook size={23} />,
        to: "/finance/admin/webhooks",
        subModule: "webhooks",
      },
      {
        title: "Bulk Import / Export",
        icon: <FileUp size={23} />,
        to: "/finance/admin/bulk",
        subModule: "bulk_import_export",
      },
      {
        title: "Account Browser",
        icon: <BookOpen size={23} />,
        to: "/finance/admin/accountbrowser",
        subModule: "account_browser",
      },
      {
        title: "Finance Attachments",
        icon: <FileSearch size={23} />,
        to: "/finance/admin/attachments",
        subModule: "finance_attachment",
      },
      {
        title: "Expense Vouchers",
        icon: <TbReceipt2 size={23} />,
        to: "/finance/expensevoucher",
        subModule: "expense_voucher",
      },
    ],
  },
  {
    title: "Reports",
    icon: <TbReportAnalytics size={23} />,
    to: "/reports/projectdashboard",
    module: "report",
    nested: [
      {
        title: "Project Dashboard",
        icon: <HiOutlineClipboardDocumentList size={23} />,
        to: "/reports/projectdashboard",
        subModule: "project_dashboard",
      },
      {
        title: "Work Analysis",
        icon: <LuWorkflow size={23} />,
        to: "/reports/workanalysis",
        subModule: "work_analysis",
      },
      {
        title: "Client Billing",
        icon: <RiBillLine size={23} />,
        to: "/reports/clientbilling",
        subModule: "client_billing",
      },
      {
        title: "Financial Report",
        icon: <TbFileDelta size={23} />,
        to: "/reports/financialreport",
        subModule: "financial_report",
      },
      {
        title: "P&L",
        icon: <TbFileInvoice size={23} />,
        to: "/reports/p&l",
        subModule: "pnl",
      },
      {
        title: "Cash Flow",
        icon: <HiOutlineCash size={23} />,
        to: "/reports/cashflow",
        subModule: "cash_flow",
      },
      {
        title: "Expenses Report",
        icon: <TbFileDollar size={23} />,
        to: "/reports/expensesreport",
        subModule: "expenses_report",
      },
      {
        title: "Vendor Report",
        icon: <TbFileInvoice size={23} />,
        to: "/reports/vendorreport",
        subModule: "vendor_report",
      },
      {
        title: "Reconciliation",
        icon: <TbFileOrientation size={23} />,
        to: "/reports/reconciliation",
        subModule: "reconciliation",
      },
      {
        title: "Actual vs Biller",
        icon: <TbReceipt2 size={23} />,
        to: "/reports/actualvsbilled",
        subModule: "actual_vs_billed",
      },
      {
        title: "Cost to Complete",
        icon: <RiDiscountPercentLine size={23} />,
        to: "/reports/costtocomplete",
        subModule: "cost_to_complete",
      },
      // {
      //   title: "Schedule",
      //   icon: <LuCalendar1 size={23} />,
      //   // to: "/reports/schedule",
      // },
      {
        title: "Planned Vs Actual",
        icon: <Quote size={23} />,
        to: "/reports/plannedvsactual",
        subModule: "planned_vs_actual",
      },
      {
        title: "Labour Productivity",
        icon: <GiHoneycomb size={23} />,
        to: "/reports/labourproductivity",
        subModule: "labour_productivity",
      },
      {
        title: "Machine Productivity",
        icon: <LuGlassWater size={23} />,
        to: "/reports/machineproductivity",
        subModule: "machine_productivity",
      },
      {
        title: "Collection Projection",
        icon: <RiShareBoxLine size={23} />,
        to: "/reports/collectionprojection",
        subModule: "collection_projection",
      },
    ],
  },
  {
    title: "Settings",
    icon: <FiSettings size={23} />,
    to: "/settings/user",
    module: "settings",
    nested: [
      {
        title: "User",
        icon: <RiUserAddLine size={23} />,
        to: "/settings/user",
        subModule: "user",
      },
      {
        title: "Roles",
        icon: <GrGroup size={23} />,
        to: "/settings/roles",
        subModule: "roles",
      },
      {
        title: "Master Data",
        icon: <Layers size={23} />,
        to: "/settings/master",
        subModule: "master",
      },
      {
        title: "HSN Master",
        icon: <TbFileDelta size={23} />,
        to: "/settings/hsnmaster",
        subModule: "hsn_sac",
      },
      {
        title: "Approval Rules",
        icon: <CheckCircle size={23} />,
        to: "/settings/approval-rules",
        subModule: "approval_config",
      },
    ],
  },
  {
    title: "Asset",
    icon: <RiGroupLine size={23} />,
    to: "/asset/category",
    module: "asset",
    nested: [
      {
        title: "Category Master",
        icon: <Layers size={23} />,
        to: "/asset/category",
        subModule: "category_master",
      },
      {
        title: "Machinery",
        icon: <Truck size={23} />,
        to: "/asset/machinery",
        subModule: "machinery",
      },
      {
        title: "Machinery Logs",
        icon: <ClipboardList size={23} />,
        to: "/asset/machinery-logs",
        subModule: "machinery_logs",
      },
      {
        title: "Maintenance",
        icon: <Activity size={23} />,
        to: "/asset/maintenance",
        subModule: "maintenance",
      },
      {
        title: "Fuel Telemetry",
        icon: <MapPin size={23} />,
        to: "/asset/fuel-telemetry",
        subModule: "fuel_telemetry",
      },
      {
        title: "Tagged Assets",
        icon: <Package size={23} />,
        to: "/asset/tagged",
        subModule: "tagged_asset",
      },
      {
        title: "Bulk Inventory",
        icon: <BsBoxSeam size={23} />,
        to: "/asset/bulk-inventory",
        subModule: "bulk_inventory",
      },
      {
        title: "Asset Issuance",
        icon: <ArrowRightLeft size={23} />,
        to: "/asset/issuance",
        subModule: "issuance",
      },
      {
        title: "Calibration",
        icon: <TbTarget size={23} />,
        to: "/asset/calibration",
        subModule: "calibration",
      },
    ],
  },
  {
    title: "Approvals",
    icon: <CheckCircle size={23} />,
    to: "/approval/requests",
    module: "approval",
    nested: [
      {
        title: "Requests",
        icon: <FileSearch size={23} />,
        to: "/approval/requests",
        subModule: "requests",
      },
      {
        title: "My Pending",
        icon: <Clock size={23} />,
        to: "/approval/my-pending",
        subModule: "my_pending",
      },
      {
        title: "Rules",
        icon: <Sliders size={23} />,
        to: "/approval/rules",
        subModule: "rules",
      },
      {
        title: "Simulator",
        icon: <Activity size={23} />,
        to: "/approval/simulator",
        subModule: "simulator",
      },
    ],
  },
  {
    title: "Audit",
    icon: <ClipboardList size={23} />,
    to: "/audit/trail",
    module: "audit",
    nested: [
      {
        title: "Audit Trail",
        icon: <ClipboardList size={23} />,
        to: "/audit/trail",
        subModule: "trail",
      },
    ],
  },
];