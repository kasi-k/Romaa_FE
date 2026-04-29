export const ACCOUNT_TYPES = ["Asset", "Liability", "Equity", "Income", "Expense"];

export const ACCOUNT_SUBTYPES = [
  "Current Asset", "Fixed Asset", "Bank", "Cash",
  "Current Liability", "Long-term Liability", "GST Liability", "TDS Liability",
  "Equity Capital", "Retained Earnings",
  "Direct Income", "Indirect Income",
  "Direct Expense", "Indirect Expense", "Depreciation",
];

export const TAX_TYPES = [
  "None", "CGST_Input", "SGST_Input", "IGST_Input",
  "CGST_Output", "SGST_Output", "IGST_Output", "TDS", "ITC_Reversal",
];

export const TYPE_META = {
  Asset:     { bg: "bg-sky-100 dark:bg-sky-900/30",      text: "text-sky-700 dark:text-sky-300",      border: "border-sky-200 dark:border-sky-800",      dot: "bg-sky-500",      icon: "A" },
  Liability: { bg: "bg-rose-100 dark:bg-rose-900/30",    text: "text-rose-700 dark:text-rose-300",    border: "border-rose-200 dark:border-rose-800",    dot: "bg-rose-500",    icon: "L" },
  Equity:    { bg: "bg-violet-100 dark:bg-violet-900/30",text: "text-violet-700 dark:text-violet-300",border: "border-violet-200 dark:border-violet-800",dot: "bg-violet-500",  icon: "E" },
  Income:    { bg: "bg-emerald-100 dark:bg-emerald-900/30",text: "text-emerald-700 dark:text-emerald-300",border: "border-emerald-200 dark:border-emerald-800",dot: "bg-emerald-500",icon: "I" },
  Expense:   { bg: "bg-amber-100 dark:bg-amber-900/30",  text: "text-amber-700 dark:text-amber-300",  border: "border-amber-200 dark:border-amber-800",  dot: "bg-amber-500",   icon: "X" },
};

export const EMPTY_FORM = {
  account_code: "",
  account_name: "",
  account_type: "Asset",
  account_subtype: "",
  description: "",
  parent_code: "",
  level: "",
  is_group: false,
  is_posting_account: true,
  is_bank_cash: false,
  is_active: true,
  tax_type: "None",
  opening_balance: "",
  opening_balance_type: "Dr",
  opening_balance_date: "",
};
