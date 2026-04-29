import React, { useState, useEffect } from "react";
import Title from "../../../components/Title";
import Profile_Tab from "./profile/Profile_Tab";
import Leave from "./leave/Leave"; // Assumes Leave has h-full and internal scrolling
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { FiLogOut, FiUser, FiCalendar, FiFileText } from "react-icons/fi";
import { toast } from "react-toastify";
import { API } from "../../../constant";
import Attendance from "./attendance/Attendance";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  // --- 1. Load User Data ---
  useEffect(() => {
    const storedUser = localStorage.getItem("crm_user");
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  // --- 2. Tab Configuration ---
  const tabs = [
    { id: "profile", label: "Profile Overview", icon: <FiUser /> },
    { id: "leave", label: "Leave Management", icon: <FiCalendar /> },
    {id:"attendance",label:"Attendance",icon:<FiCalendar />},
    { id: "document", label: "Documents", icon: <FiFileText /> },
  ];


  // --- 3. Logout Logic ---
  const handleLogout = async () => {
    try {
      await axios.post(`${API}/employee/logout`, {}, { withCredentials: true });
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout warning:", error);
    } finally {
      localStorage.removeItem("crm_user");
      logout();
      navigate("/");
    }
  };

  // --- 4. Content Renderer ---
  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        // Profile usually needs a scrollable container as it's a long form
        return (
          <div className="h-full overflow-y-auto custom-scrollbar p-4">
            <Profile_Tab user={userData} />
          </div>
        );
      case "leave":
        // Leave component (from previous redesign) has its own internal layout/scrolling.
        // We pass 'h-full' implicitly by letting it fill this flex container.
        return (
          <div className="h-full p-2 md:p-4">
            <Leave />
          </div>
        );
      case "attendance":
        return (
          <div className="h-full overflow-y-auto custom-scrollbar p-2 md:p-4">
             {/* We pass userData if needed, though the component fetches its own stats */}
            <Attendance />
          </div>
        );
      case "document":
        return (
          <div className="h-full p-4">
             <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <FiFileText size={40} className="mb-2 opacity-50"/>
              <p>Document module coming soon</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!userData) return <div className="p-10 text-center text-gray-500">Loading Profile...</div>;

  return (
    // MAIN CONTAINER: Flex Column, Full Height
    <div className="flex flex-col h-full w-full font-layout-font bg-gray-50/50">
      
      {/* --- HEADER SECTION (Fixed Height / Non-growing) --- */}
      <div className="flex-none bg-white border-b border-gray-200 shadow-sm ">
        
        {/* Top Bar */}
        <div className="flex justify-between items-center py-3 px-6">
          <Title
            title="Dashboard"
            sub_title="My Account"
          />
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-100"
          >
            <FiLogOut /> <span className="hidden md:inline">Logout</span>
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="px-6 pb-0">
          <div className="flex gap-6 border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 pb-3 text-sm font-medium transition-all relative
                  ${activeTab === tab.id ? "text-darkest-blue" : "text-gray-500 hover:text-gray-700"}
                `}
              >
                {tab.icon}
                {tab.label}
                
                {/* Active Tab Indicator Line */}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-darkest-blue rounded-t-full"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- CONTENT SECTION (Flexible Height) --- */}
      {/* flex-1: Fills remaining space. min-h-0: Prevents overflow issues in flex children */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {renderContent()}
      </div>

    </div>
  );
};

export default Profile;