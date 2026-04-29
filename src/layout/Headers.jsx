import { useState } from "react";
import LOGO from "../assets/images/romaa logo.png";
import { Search, History } from "lucide-react";
import { HiOutlineBell } from "react-icons/hi";
import { useSearch } from "../context/SearchBar";
import ThemeToggle from "../components/ThemeToggle";
import { HiOutlineTicket } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import LOGO_D from "../assets/images/romaadark.png";
import { useAuth } from "../context/AuthContext";
import { useUnreadCount } from "../hooks/useNotifications";
import NotificationPanel from "../components/NotificationPanel";

const Headers = () => {
  const { searchTerm, setSearchTerm } = useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.unread || 0;

  return (
    <div className=" w-full z-10 font-roboto-flex flex justify-between items-center dark:bg-layout-dark   pt-2 px-2 h-1/12">
      <div className="flex gap-4  ">
        <img src={LOGO} alt="logo" className="w-36 ml-8 -mt-1 dark:hidden " />
        <img
          src={LOGO_D}
          alt="logo"
          className="hidden w-36 ml-8 -mt-1 dark:block "
        />

        <div className="flex items-center gap-2 px-2 h-10 rounded-md dark:bg-overall_bg-dark bg-light-blue">
          <Search className="size-5  dark:text-white text-darkest-blue" />
          <input
            type="text"
            className="w-56 placeholder:text-darkest-blue dark:placeholder:text-white outline-0"
            id="search"
            name="search"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-center lg:p-2 md:p-2 p-1.5 lg:gap-3 md:gap-2 gap-1.5  items-center text-center  rounded-full">
        <div className=" flex  items-center gap-2 text-sm font-extralight text-nowrap  dark:text-white text-darkest-blue ">
          {user?.name}
          <div className="">
            <button
              className=" dark:bg-overall_bg-dark bg-light-blue  dark:text-white text-darkest-blue font-medium w-9 h-9 text-sm rounded-full flex items-center justify-center"
              onClick={() => {
                navigate("/dashboard/profile");
              }}
            >
              {user?.name.charAt(0).toUpperCase()}
            </button>
          </div>
        </div>
        <button
          className="relative dark:bg-overall_bg-dark bg-light-blue w-9 h-9 lg:p-2 md:p-2 p-1.5 rounded-full"
          onClick={() => setNotifOpen((prev) => !prev)}
        >
          <HiOutlineBell className="size-5 dark:text-white text-darkest-blue" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
        <NotificationPanel
          open={notifOpen}
          onClose={() => setNotifOpen(false)}
        />
        <p
          className="dark:bg-overall_bg-dark bg-light-blue  w-9 h-9 lg:p-2 md:p-2 p-1.5 rounded-full"
          onClick={() => {
            navigate("/dashboard/tickets");
          }}
        >
          <HiOutlineTicket className=" size-5  dark:text-white  text-darkest-blue" />
        </p>

        <button
          title="My Activity"
          className="dark:bg-overall_bg-dark bg-light-blue w-9 h-9 lg:p-2 md:p-2 p-1.5 rounded-full flex items-center justify-center"
          onClick={() => navigate("/me/activity")}
        >
          <History className="size-5 dark:text-white text-darkest-blue" />
        </button>

        <div className="pb-0.5  ">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default Headers;
