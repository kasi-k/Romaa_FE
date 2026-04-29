import { useState, useEffect, useLayoutEffect, useRef } from "react";

const MESSAGES = [
  "Loading project data...",
  "Fetching site reports...",
  "Syncing tender records...",
  "Preparing your workspace...",
];

const Loader = ({ fullScreen = true, message }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const wrapperRef = useRef(null);

  // Inject styles BEFORE first paint so the entrance animation triggers without flashing
  useLayoutEffect(() => {
    if (!document.getElementById("romaa-loader-styles")) {
      const style = document.createElement("style");
      style.id = "romaa-loader-styles";
      style.innerHTML = `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.92); filter: blur(10px); }
          to { opacity: 1; transform: scale(1); filter: blur(0px); }
        }
        @keyframes bgFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-bg-fade { animation: bgFadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes building {
          0%, 100% { height: 40%; opacity: 0.5; }
          50% { height: 100%; opacity: 1; }
        }
        .animate-building-1 { animation: building 1.5s ease-in-out infinite 0s; }
        .animate-building-2 { animation: building 1.5s ease-in-out infinite 0.3s; }
        .animate-building-3 { animation: building 1.5s ease-in-out infinite 0.6s; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (wrapperRef.current) {
        // Clone the element right before it gets destroyed by React
        const clone = wrapperRef.current.cloneNode(true);

        // Disable interactions on the ghost clone
        clone.style.pointerEvents = "none";

        // Strip the CSS fade-in classes so they don't fight our JS fade-out animation
        clone.classList.remove("animate-bg-fade");
        const innerFade = clone.querySelector(".animate-fade-in") || clone;
        if (innerFade) innerFade.classList.remove("animate-fade-in");

        // If not fixed (e.g., inline loader), freeze its exact coordinates on screen
        if (
          !clone.classList.contains("fixed") &&
          !clone.classList.contains("absolute")
        ) {
          const rect = wrapperRef.current.getBoundingClientRect();
          clone.style.position = "fixed";
          clone.style.top = `${rect.top}px`;
          clone.style.left = `${rect.left}px`;
          clone.style.width = `${rect.width}px`;
          clone.style.height = `${rect.height}px`;
          clone.style.margin = "0";
          clone.style.zIndex = "9998";
        }

        document.body.appendChild(clone);

        // Sync the running animations from the original DOM so it doesn't jump or freeze
        if (typeof wrapperRef.current.getAnimations === "function") {
          const origAnims = wrapperRef.current.getAnimations({ subtree: true });
          const cloneAnims = clone.getAnimations({ subtree: true });
          // Match play states
          origAnims.forEach((anim, i) => {
            if (cloneAnims[i]) cloneAnims[i].currentTime = anim.currentTime;
          });
        }

        // 1. Snappily dissolve the loader text and spinner alone (300ms)
        const innerContent = clone.querySelector(".animate-fade-in");
        if (innerContent) {
          innerContent.animate(
            [{ opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(4px)" }],
            { duration: 400, easing: "ease-out", fill: "forwards" }
          );
        }

        // 2. Majestically melt the glassy backdrop itself (1.5s)
        const fadeAnim = clone.animate(
          [
            { opacity: 1, backdropFilter: "blur(6px)" },
            { opacity: 0, backdropFilter: "blur(0px)" }
          ],
          {
            duration: 1500,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            fill: "forwards",
          }
        );

        // Clean up precisely when animation finishes
        fadeAnim.onfinish = () => {
          if (document.body.contains(clone)) {
            clone.remove();
          }
        };

        // 3. Reveal page content — blur lifts, content rises in sync with backdrop dissolve
        if (fullScreen) {
          const contentEl = document.getElementById("romaa-page-content");
          if (contentEl) {
            contentEl.animate(
              [
                { opacity: 0, transform: "translateY(12px) scale(0.99)", filter: "blur(8px)" },
                { opacity: 1, transform: "translateY(0)  scale(1)",      filter: "blur(0px)" },
              ],
              {
                duration: 900,
                delay: 150,
                easing: "cubic-bezier(0.16, 1, 0.3, 1)",
                fill: "forwards",
              }
            );
          }
        }
      }
    };
  }, []);

  useEffect(() => {
    if (message) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
        setVisible(true);
      }, 400); // fade out duration
    }, 3000); // display duration
    return () => clearInterval(id);
  }, [message]);

  const displayMessage = message ?? MESSAGES[msgIndex];

  const content = (
    <div
      ref={!fullScreen ? wrapperRef : null}
      className={`flex flex-col items-center justify-center gap-8 min-w-[280px] animate-fade-in ${!fullScreen ? "p-4" : ""}`}
    >
      {/* Animated Structural Logo / Spinner */}
      <div className="relative flex items-center justify-center w-20 h-20">
        {/* Outer Ring */}
        <svg
          className="absolute w-full h-full animate-spin-slow"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-200 dark:text-gray-800"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="text-blue-600 dark:text-blue-500"
            strokeDasharray="80 200"
          />
        </svg>

        {/* Inner Building Blocks (Animated) */}
        <div className="flex items-end justify-center gap-1.5 h-8 w-10">
          <div className="w-2 bg-blue-600 dark:bg-blue-400 rounded-sm animate-building-1"></div>
          <div className="w-2 bg-blue-700 dark:bg-blue-300 rounded-sm animate-building-2"></div>
          <div className="w-2 bg-blue-500 dark:bg-blue-500 rounded-sm animate-building-3"></div>
        </div>
      </div>

      {/* Corporate Branding */}
      <div className="flex flex-col items-center gap-1.5 select-none">
        <span className="text-3xl font-black tracking-[0.3em] ml-[0.3em] text-gray-900 dark:text-white uppercase leading-none">
          ROMAA
        </span>
        <span className="text-[11px] font-semibold tracking-[0.4em] ml-[0.4em] text-blue-600/80 dark:text-blue-400/80 uppercase">
          Construction ERP
        </span>
      </div>

      {/* Dynamic Status Text */}
      <div className="h-6 flex items-center justify-center overflow-hidden">
        <p
          className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide transition-all duration-500 ease-in-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(10px)",
          }}
        >
          {displayMessage}
        </p>
      </div>
    </div>
  );

  if (!fullScreen) return content;

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 flex items-center justify-center bg-white/40 dark:bg-gray-900/60 backdrop-blur-sm z-[9999] font-sans animate-bg-fade"
    >
      {content}
    </div>
  );
};

export default Loader;
