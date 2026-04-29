import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  FiChevronDown, 
  FiCheck, 
  FiShield, 
  FiInfo,
  FiSave,
  FiX,
  FiGrid,
  FiCheckSquare,

} from "react-icons/fi";
import { Menus } from "../../../helperConfigData/helperData";
import { useRoleDetails, useUpdateRole } from "./hooks/useRoles";
import Loader from "../../../components/Loader";


// --- Constants ---
const ACTIONS = [
  { key: "read", label: "Read", color: "bg-blue-50 text-blue-600 border-blue-200" },
  { key: "create", label: "Create", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  { key: "edit", label: "Edit", color: "bg-amber-50 text-amber-600 border-amber-200" },
  { key: "delete", label: "Delete", color: "bg-rose-50 text-rose-600 border-rose-200" },
];

const EditRoles = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const roleIdFromState = location.state?.item?.role_id;
  
  // Local Form State
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState({});
  const [expandedModules, setExpandedModules] = useState({});

  // --- TanStack Query Hooks ---
  const { data: roleData, isLoading: fetching } = useRoleDetails(roleIdFromState);
  const { mutateAsync: updateRole, isPending: loading } = useUpdateRole(roleIdFromState);

  // --- 1. Transform Menus to Module Config ---
  const MODULES_CONFIG = useMemo(() => {
    return Menus.map(menu => ({
        key: menu.module,
        label: menu.title,
        icon: menu.icon,
        hasSubModules: !!menu.nested && menu.nested.length > 0,
        subModules: menu.nested ? menu.nested.map(sub => ({
            key: sub.subModule,
            label: sub.title
        })) : []
    }));
  }, []);

  // --- 2. Sync Fetched Data to Local State ---
  useEffect(() => {
    if (!roleIdFromState) {
        toast.error("Invalid Role ID");
        navigate("/settings/roles");
        return;
    }
    
    if (roleData) {
      setRoleName(roleData.roleName || "");
      setDescription(roleData.description || "");
      setPermissions(roleData.permissions || {});
    }
  }, [roleData, roleIdFromState, navigate]);

  // --- 3. Logic Helpers ---
  const toggleModuleExpand = (moduleKey) => {
    setExpandedModules((prev) => ({ ...prev, [moduleKey]: !prev[moduleKey] }));
  };

  const isChecked = (moduleKey, subModuleKey, actionKey) => {
    if (subModuleKey) {
      return permissions[moduleKey]?.[subModuleKey]?.[actionKey] === true;
    }
    return permissions[moduleKey]?.[actionKey] === true;
  };

  const handlePermissionChange = (moduleKey, subModuleKey, actionKey) => {
    setPermissions((prev) => {
      const updatedModule = { ...(prev[moduleKey] || {}) };

      if (subModuleKey) {
        const updatedSubModule = { ...(updatedModule[subModuleKey] || {}) };
        updatedSubModule[actionKey] = !updatedSubModule[actionKey];
        updatedModule[subModuleKey] = updatedSubModule;
      } else {
        if (moduleKey === 'dashboard' && actionKey !== 'read') return prev;
        updatedModule[actionKey] = !updatedModule[actionKey];
      }

      return { ...prev, [moduleKey]: updatedModule };
    });
  };

  const isModuleFullySelected = (module) => {
    const modPerms = permissions[module.key];
    if (!modPerms) return false;

    if (module.hasSubModules) {
      return module.subModules.every(sub => {
         return ACTIONS.every(act => modPerms[sub.key]?.[act.key] === true);
      });
    } else {
      if(module.key === 'dashboard') return modPerms['read'] === true;
      return ACTIONS.every(act => modPerms[act.key] === true);
    }
  };

  const toggleFullModuleAccess = (module) => {
    const isFull = isModuleFullySelected(module);
    const targetState = !isFull; 

    setPermissions((prev) => {
      const updatedModule = { ...(prev[module.key] || {}) };
      const actionsObj = {};
      ACTIONS.forEach(a => actionsObj[a.key] = targetState);

      if (module.hasSubModules) {
        module.subModules.forEach(sub => {
          updatedModule[sub.key] = actionsObj;
        });
      } else {
        if(module.key === 'dashboard') {
             updatedModule['read'] = targetState;
        } else {
             Object.assign(updatedModule, actionsObj);
        }
      }

      return { ...prev, [module.key]: updatedModule };
    });
  };

  // --- 4. Submit Handler ---
  const handleUpdate = async () => {
    if (!roleName.trim()) {
        toast.error("Role Name is required");
        return;
    }
    
    const payload = { roleName, description, permissions };
    
    // Mutation handles the try/catch, loading state, and redirects
    await updateRole(payload);
  };

  // --- Stats Logic ---
  const stats = useMemo(() => {
    let totalPerms = 0;
    let modulesWithAccess = 0;

    Object.keys(permissions).forEach(modKey => {
      const mod = permissions[modKey];
      let hasAccess = false;
      const countTrue = (obj) => {
        if(!obj) return;
        Object.values(obj).forEach(val => {
          if (val === true) {
            totalPerms++;
            hasAccess = true;
          } else if (typeof val === 'object') {
            countTrue(val);
          }
        });
      };
      countTrue(mod);
      if (hasAccess) modulesWithAccess++;
    });

    return { totalPerms, modulesWithAccess };
  }, [permissions]);

    if (fetching) return <Loader />;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-overall_bg-dark font-layout-font">
      
      {/* Sticky Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white/80 dark:bg-layout-dark/90 backdrop-blur-md border-b dark:border-gray-800 flex flex-wrap justify-between items-center gap-3 z-20 sticky top-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
           <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400 shrink-0">
             <FiShield size={20} />
           </div>
           <div className="min-w-0">
             <h1 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white leading-tight truncate">Edit Role: {roleName}</h1>
             <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">Modify access for {MODULES_CONFIG.length} modules</p>
           </div>
        </div>

        <div className="flex gap-2 sm:gap-3 shrink-0">
          <button onClick={() => navigate("/settings/roles")} disabled={loading} className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium flex items-center gap-1.5 sm:gap-2 disabled:opacity-50">
            <FiX /> Cancel
          </button>
          <button onClick={handleUpdate} disabled={loading} className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm text-white shadow-md shadow-amber-500/20 transition-all font-medium flex items-center gap-1.5 sm:gap-2 ${loading ? "bg-gray-400" : "bg-darkest-blue hover:bg-blue-900 active:scale-95"}`}>
            {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : <FiSave />}
            <span>Update<span className="hidden sm:inline"> Changes</span></span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">

          {/* Form & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-layout-dark p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Role Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            placeholder="e.g. Site Manager"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Description</label>
                        <input
                            type="text"
                            placeholder="Responsibilities..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-darkest-blue to-blue-900 p-5 rounded-xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><FiShield size={80} /></div>
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="text-sm font-medium opacity-80 uppercase tracking-wider flex items-center gap-2">Modules Access</h3>
                        <div className="mt-1 text-3xl font-bold flex items-baseline gap-1">
                            {stats.modulesWithAccess} <span className="text-sm font-normal opacity-60">/ {MODULES_CONFIG.length}</span>
                        </div>
                    </div>
                    <div className="text-right">
                         <h3 className="text-sm font-medium opacity-80 uppercase tracking-wider">Total Perms</h3>
                        <div className="mt-1 text-3xl font-bold">{stats.totalPerms}</div>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs opacity-80">
                   <FiInfo /> Editing existing role configuration
                </div>
            </div>
          </div>

          {/* Permissions Grid */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
                 <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                    <FiGrid /> Permissions Configuration
                 </h3>
             </div>

             <div className="grid grid-cols-1 gap-4">
                {MODULES_CONFIG.map((module) => {
                  const isFullySelected = isModuleFullySelected(module);
                  return (
                    <div key={module.key} className={`bg-white dark:bg-layout-dark rounded-xl border transition-all duration-200 ${
                      expandedModules[module.key] ? "border-blue-300 dark:border-blue-800 shadow-md ring-1 ring-blue-500/20" : "border-gray-100 dark:border-gray-800 hover:border-gray-300"
                    }`}>
                      
                      {/* Module Header */}
                      <div 
                          className="p-3 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-t-xl"
                          onClick={() => toggleModuleExpand(module.key)}
                      >
                          <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg transition-colors ${expandedModules[module.key] ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                  {module.icon ? <span className="text-lg">{module.icon}</span> : <FiShield />}
                              </div>
                              <span className="font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base">{module.label}</span>
                          </div>

                          <div className="flex items-center gap-3">
                              <button 
                                  onClick={(e) => { e.stopPropagation(); toggleFullModuleAccess(module); }}
                                  className={`text-[10px] sm:text-xs font-semibold px-3 py-1.5 rounded transition-all flex items-center gap-1.5
                                    ${isFullySelected 
                                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                                    }`}
                              >
                                  {isFullySelected ? (
                                      <><FiCheckSquare /> Unselect All</>
                                  ) : (
                                      <><span className="w-3 h-3 border border-gray-400 rounded-sm"></span> Select All</>
                                  )}
                              </button>
                              <FiChevronDown className={`text-gray-400 transition-transform duration-300 ${expandedModules[module.key] ? 'rotate-180' : ''}`} />
                          </div>
                      </div>

                      {/* Permissions Body */}
                      {(!module.hasSubModules || expandedModules[module.key]) && (
                          <div className="border-t border-gray-100 dark:border-gray-800 p-3 sm:p-4 bg-gray-50/30 dark:bg-overall_bg-dark/20 overflow-x-auto">

                              <div className="grid grid-cols-12 gap-2 mb-2 px-3 min-w-[480px]">
                                  <div className="col-span-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sub-Module</div>
                                  {ACTIONS.map(action => (
                                      <div key={action.key} className="col-span-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">{action.label}</div>
                                  ))}
                              </div>

                              <div className="space-y-1">
                                  {module.hasSubModules ? (
                                      module.subModules.map((sub) => (
                                          <PermissionRow 
                                              key={sub.key} 
                                              label={sub.label} 
                                              moduleKey={module.key} 
                                              subModuleKey={sub.key}
                                              isChecked={isChecked}
                                              onChange={handlePermissionChange}
                                          />
                                      ))
                                  ) : (
                                      <PermissionRow 
                                          label={module.label} 
                                          moduleKey={module.key} 
                                          subModuleKey={null}
                                          isChecked={isChecked}
                                          onChange={handlePermissionChange}
                                          isDashboard={module.key === 'dashboard'} 
                                      />
                                  )}
                              </div>
                          </div>
                      )}
                    </div>
                  );
                })}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Row Component
const PermissionRow = ({ label, moduleKey, subModuleKey, isChecked, onChange, isDashboard }) => (
    <div className="grid grid-cols-12 gap-2 items-center py-2 px-3 bg-white dark:bg-layout-dark rounded-md border border-gray-100 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all group min-w-[480px]">
        <div className="col-span-4 text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-darkest-blue dark:group-hover:text-blue-300 truncate pr-2">
            {label}
        </div>
        
        {ACTIONS.map((action) => {
            if (isDashboard && action.key !== 'read') {
                return <div key={action.key} className="col-span-2"></div>;
            }

            const active = isChecked(moduleKey, subModuleKey, action.key);
            return (
                <div key={action.key} className="col-span-2 flex justify-center">
                    <div 
                        onClick={() => onChange(moduleKey, subModuleKey, action.key)}
                        className={`
                            w-5 h-5 sm:w-6 sm:h-6 rounded cursor-pointer flex items-center justify-center transition-all duration-200 border
                            ${active 
                                ? `${action.color} border-transparent shadow-sm scale-105` 
                                : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-gray-300"
                            }
                        `}
                    >
                        {active && <FiCheck className="text-xs sm:text-sm" strokeWidth={3} />}
                    </div>
                </div>
            )
        })}
    </div>
);

export default EditRoles;