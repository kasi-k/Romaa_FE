// Asset module — permission key map
// Mirrors RoleModel.permissions.asset and the §4 mapping in
// ASSET_INTEGRATION_GUIDE.txt. Use with `canAccess(MODULE, SUB, ACTION)`.

export const ASSET_MODULE = "asset";

export const ASSET_SUB = {
  CATEGORY_MASTER: "category_master",
  MACHINERY: "machinery",
  MACHINERY_LOGS: "machinery_logs",
  MAINTENANCE: "maintenance",
  FUEL_TELEMETRY: "fuel_telemetry",
  TAGGED_ASSET: "tagged_asset",
  BULK_INVENTORY: "bulk_inventory",
  ISSUANCE: "issuance",
  CALIBRATION: "calibration",
};

export const ASSET_ACTION = {
  READ: "read",
  CREATE: "create",
  EDIT: "edit",
  DELETE: "delete",
};
