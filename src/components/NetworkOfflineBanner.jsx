import React from 'react';
import { IoCloudOffline, IoReload } from 'react-icons/io5';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const NetworkOfflineBanner = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-[9999] animate-slideUp">
      <div className="
        w-full flex items-center justify-between px-6 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]
        
        /* Light Mode Styles */
        bg-white border-t-4 border-red-500 text-gray-800
        
        /* Dark Mode Styles */
        dark:bg-gray-900 dark:border-red-600 dark:text-gray-100
      ">
        <div className="flex items-center gap-4">
          {/* Icon Circle */}
          <div className="p-2 rounded-full bg-red-50 dark:bg-red-900/20">
            <IoCloudOffline className="text-2xl text-red-600 dark:text-red-400 animate-pulse" />
          </div>
          
          {/* Text Content */}
          <div className="flex flex-col">
            <h3 className="font-bold text-sm md:text-base">
              You are currently offline
            </h3>
            <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
              Please check your internet connection.
            </span>
          </div>
        </div>

        <button 
          onClick={() => window.location.reload()} 
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg 
                     text-red-600 bg-red-50 hover:bg-red-100 
                     dark:text-white dark:bg-red-700 dark:hover:bg-red-600 transition-colors"
        >
          <IoReload />
          <span className="hidden sm:inline">Retry</span>
        </button>
      </div>
    </div>
  );
};

export default NetworkOfflineBanner;