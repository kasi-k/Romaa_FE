import React, { Suspense, useState } from "react";
import Headers from "./Headers";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menus } from "../helperConfigData/helperData";
import Loader from "../components/Loader";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
// import Ai from "../components/Ai";

const LayOut = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subSidebarOpen, setSubSidebarOpen] = useState(true);
  const [ripple, setRipple] = useState(null);

  // --- Permission Checker ---
  const checkAccess = (module, subModule) => {
    if (!user || !user.role || !user.role.permissions) return false;
    const modulePerms = user.role.permissions[module];
    if (!modulePerms) return false;
    if (subModule) return modulePerms[subModule] && modulePerms[subModule].read === true;
    return modulePerms.read === true;
  };

  // --- Filter Parent Menus ---
  // Sub-items may override the parent's `module` (e.g. an audit item nested under Settings
  // that should be gated by the `audit.trail.read` permission, not `settings.*`).
  const visibleMenus = Menus.filter((menu) => {
    if (!menu.nested) return checkAccess(menu.module, null);
    return menu.nested.some((child) => checkAccess(child.module || menu.module, child.subModule));
  });

  // --- Active State Logic ---
  const isMenuActive = (menu) => {
    if (location.pathname.startsWith(menu.to)) return true;
    if (menu.nested && menu.nested.some((item) => location.pathname.startsWith(item.to))) return true;
    return false;
  };

  // --- Sub Sidebar URL Visibility Logic ---
  // Derive the URL prefix from the menu's `to` rather than the title — titles
  // can be plural ("Approvals") while paths are singular ("/approval"), so
  // matching on title silently drops the sub-sidebar.
  const isNestedSidebarVisible = (menu, pathname) => {
    if (menu.title === "Projects") return pathname.startsWith("/projects/") && pathname !== "/projects";
    if (menu.title === "Site") return pathname.startsWith("/site/") && pathname !== "/site";
    const prefix = (menu.to || "").split("/").slice(0, 2).join("/");
    return !!prefix && pathname.startsWith(prefix);
  };

  // --- Active menu that should show sub sidebar ---
  const activeNestedMenu = visibleMenus.find(
    (menu) =>
      menu.nested &&
      isNestedSidebarVisible(menu, location.pathname) &&
      isMenuActive(menu)
  );

  // --- Click main sidebar: ripple + navigate + auto-open sub sidebar ---
  const handleMenuClick = (e, menu, index) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipple({ x, y, index });
    setTimeout(() => setRipple(null), 500);
    if (menu.nested) setSubSidebarOpen(true);
    navigate(menu.to);
  };

  return (
    <div className="font-roboto-flex w-full h-screen flex flex-col overflow-hidden">
      <Headers />
      <div className="flex-1 h-0 flex dark:bg-overall_bg-dark bg-light-blue dark:text-white">

        {/* --- MAIN SIDEBAR --- */}
        <div className="flex-shrink-0 flex flex-col dark:bg-overall_bg-dark bg-light-blue overflow-y-auto overflow-x-hidden no-scrollbar px-4">

          {/* Panel button */}
          <button
            onClick={() => setSubSidebarOpen((prev) => !prev)}
            className="flex items-center justify-center h-10 mt-3 mx-auto dark:text-white text-darkest-blue opacity-40 hover:opacity-100 transition-all duration-200 hover:scale-110"
            title={subSidebarOpen ? "Hide sub menu" : "Show sub menu"}
          >
            {subSidebarOpen
              ? <PanelLeftClose className="size-5" />
              : <PanelLeftOpen className="size-5" />
            }
          </button>

          <ul>
            {visibleMenus.map((menu, index) => {
              const active = isMenuActive(menu);
              return (
                <li
                  key={index}
                  onClick={(e) => handleMenuClick(e, menu, index)}
                  className={`
                    relative overflow-hidden w-[80px] text-sm font-extralight
                    flex flex-col items-center gap-1 px-3 py-3 my-4
                    border rounded-xl cursor-pointer select-none
                    transition-all duration-200
                    ${active
                      ? "text-white bg-darkest-blue border-darkest-blue shadow-lg shadow-darkest-blue/30 scale-[1.04]"
                      : "dark:text-white text-darkest-blue dark:border-border-dark-grey border-border-sidebar hover:scale-[1.04] hover:shadow-md hover:border-darkest-blue/40"
                    }
                  `}
                >
                  {/* Ripple effect */}
                  {ripple && ripple.index === index && (
                    <span
                      className="absolute rounded-full bg-white/30 animate-ping"
                      style={{
                        width: 60,
                        height: 60,
                        top: ripple.y - 30,
                        left: ripple.x - 30,
                        pointerEvents: "none",
                      }}
                    />
                  )}

                  {/* Icon with bounce on active */}
                  <span className={`transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-110"}`}>
                    {menu.icon}
                  </span>
                  <p className="text-center leading-tight">{menu.title}</p>

                  {/* Active indicator dot */}
                  {active && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-white/70" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* --- SUB SIDEBAR --- */}
        {activeNestedMenu && (
          <div
            className={`flex-shrink-0 transition-all duration-300 ease-in-out ${
              subSidebarOpen ? "w-56 mx-0 opacity-100" : "w-0 mx-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="text-sm my-4 rounded-lg dark:bg-layout-dark bg-white overflow-auto no-scrollbar py-6 h-full min-w-[224px]">
              <ul>
                {activeNestedMenu.nested.map((item, subIndex) => {
                  if (!checkAccess(item.module || activeNestedMenu.module, item.subModule)) return null;
                  const isActive = location.pathname.startsWith(item.to);
                  return (
                    <li key={subIndex} className="mb-1">
                      <NavLink to={item.to}>
                        <div
                          className={`
                            w-full flex items-center gap-2 py-3 px-3 cursor-pointer
                            transition-all duration-150
                            ${isActive
                              ? "dark:bg-overall_bg-dark bg-select-subbar dark:text-white text-darkest-blue border-r-4 border-r-darkest-blue translate-x-0"
                              : "dark:text-white text-darkest-blue hover:translate-x-1"
                            }
                          `}
                        >
                          <span className={`transition-transform duration-150 ${isActive ? "scale-110" : ""}`}>
                            {item.icon}
                          </span>
                          <p>{item.title}</p>
                        </div>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {/* --- MAIN CONTENT AREA --- */}
        <div id="romaa-page-content" className="flex-1 h-full px-2 py-4 overflow-hidden flex flex-col ">
          <Suspense fallback={<Loader fullScreen={false} />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
      {/* <Ai /> */}
    </div>
  );
};

export default LayOut;
