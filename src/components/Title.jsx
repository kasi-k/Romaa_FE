import React from "react";
import { ChevronRight } from "lucide-react";

const Title = ({ title, sub_title, page_title, active_title }) => {
  // 1. Filter out any missing props so we only render valid breadcrumbs
  const breadcrumbs = [title, sub_title, active_title].filter(Boolean);

  return (
    <div className="font-roboto-flex flex flex-col gap-1.5 mb-2">
      
      {/* 2. Semantic Navigation for Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center text-[13px] font-medium text-gray-500 dark:text-gray-400">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return (
              <React.Fragment key={index}>
                {/* Highlight the last item in the breadcrumb trail */}
                <span className={`transition-colors ${isLast ? "text-brand font-bold dark:text-brand-contrast" : "hover:text-gray-700 dark:hover:text-gray-200"}`}>
                  {crumb}
                </span>
                
                {/* Don't render a chevron after the last item */}
                {!isLast && <ChevronRight size={14} className="mx-1 opacity-40 shrink-0" />}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* 3. Semantic H1 for the Page Title */}
      {page_title && (
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          {page_title} 
          {/* Prevent repeating the active_title if it's already in the breadcrumb */}
          {active_title && !breadcrumbs.includes(page_title) && (
            <span className="text-brand font-semibold text-xl">
              {active_title}
            </span>
          )}
        </h1>
      )}
      
    </div>
  );
};

export default Title;