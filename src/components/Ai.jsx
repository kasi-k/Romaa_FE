import { useState, useEffect, useCallback, useRef } from "react";
import {
  Sparkles,
  X,
  Send,
  Bot,
  Zap,
  RefreshCcw,
  AlertTriangle,
} from "lucide-react";
import { API } from "../constant";

const Ai = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [alertCount, setAlertCount] = useState(0); // NEW: Tracks active risks
  const chatEndRef = useRef(null);

  const fetchSuggestions = useCallback(async () => {
    // 1. Check if we already have insights cached for this session
    const cachedInsights = sessionStorage.getItem("romaa_ai_insights");
    if (cachedInsights) {
      const parsedData = JSON.parse(cachedInsights);
      setChat([
        {
          role: "ai",
          text: parsedData.answer,
          isInsight: true,
          modules: parsedData.alertModules || [],
        },
      ]);
      if (parsedData.alertModules?.length > 0)
        setAlertCount(parsedData.alertModules.length);
      return; // Stop here, don't hit the API!
    }

    setIsSuggesting(true);
    try {
      const res = await fetch(`${API}/ai/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();

      if (data.status) {
        // 2. Save the successful response to the cache
        sessionStorage.setItem("romaa_ai_insights", JSON.stringify(data));

        setChat([
          {
            role: "ai",
            text: data.answer,
            isInsight: true,
            modules: data.alertModules || [],
          },
        ]);

        if (data.alertModules?.length > 0) {
          setAlertCount(data.alertModules.length);
        }
      } else if (res.status === 429) {
        // Handle 429 cleanly in the UI
        setChat([
          {
            role: "ai",
            text: "AI limit reached. Insights will refresh later.",
            isInsight: true,
          },
        ]);
      }
    } catch (err) {
      console.error("Proactive Insight Error:", err);
    } finally {
      setIsSuggesting(false);
    }
  }, []);

  // --- 2. Auto-trigger on first load ---
  useEffect(() => {
    // Fetch silently in the background when component mounts to populate the badge
    if (chat.length === 0) {
      fetchSuggestions();
    }
  }, [chat.length, fetchSuggestions]);

  // --- 3. Auto-scroll to latest message ---
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat, isOpen]);

  const handleSend = async () => {
    if (!query.trim()) return;
    const userMessage = { role: "user", text: query };
    setChat((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/ai/general-query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
        credentials: "include",
      });
      const data = await res.json();
      setChat((prev) => [...prev, { role: "ai", text: data.answer }]);
    } catch  {
      setChat((prev) => [
        ...prev,
        { role: "ai", text: "Error connecting to AI." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWindow = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setAlertCount(0); // Clear badge when opened
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">
      {isOpen && (
        <div className="w-96 h-[550px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-violet-600 p-4 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-bold text-sm tracking-tight">
                ROMAA Intelligence
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  sessionStorage.removeItem("romaa_ai_insights");
                  fetchSuggestions();
                }}
                title="Refresh Insights"
                className={`transition-transform duration-500 ${isSuggesting ? "animate-spin" : "hover:rotate-180"}`}
              >
                <RefreshCcw size={16} />
              </button>
              <X
                size={20}
                className="cursor-pointer hover:scale-110 transition-transform"
                onClick={() => setIsOpen(false)}
              />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 no-scrollbar">
            {isSuggesting && (
              <div className="flex items-center gap-2 text-[10px] text-violet-500 font-bold uppercase tracking-widest animate-pulse">
                <Zap size={12} /> Scanning ERP for Risks...
              </div>
            )}

            {chat.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`p-4 rounded-2xl max-w-[90%] text-xs leading-relaxed whitespace-pre-line shadow-sm ${
                    msg.role === "user"
                      ? "bg-violet-600 text-white rounded-tr-none"
                      : msg.isInsight
                        ? "bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {/* Insight Header */}
                  {msg.isInsight && (
                    <div className="flex justify-between items-start mb-2 border-b border-violet-200/50 pb-2">
                      <span className="flex items-center gap-1 text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-tighter">
                        <Zap size={12} fill="currentColor" /> Priority
                        Intelligence
                      </span>
                      {msg.modules?.length > 0 && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-red-500 uppercase">
                          <AlertTriangle size={10} /> {msg.modules.length} Risks
                        </span>
                      )}
                    </div>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-[10px] text-slate-400 animate-pulse self-start ml-2">
                Assistant is analyzing...
              </div>
            )}
            {/* Auto-scroll target */}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2 bg-slate-50/50 dark:bg-slate-900/50">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about tenders, BOQ, or site progress..."
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-violet-500 outline-none transition-all"
            />
            <button
              onClick={handleSend}
              className="bg-violet-600 hover:bg-violet-700 p-2.5 rounded-xl text-white transition-colors shadow-md hover:shadow-lg"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button with Notification Badge */}
      <button
        onClick={handleToggleWindow}
        className="relative w-14 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}

        {/* Red Risk Badge */}
        {!isOpen && alertCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white items-center justify-center text-[8px] font-bold">
              {alertCount}
            </span>
          </span>
        )}
      </button>
    </div>
  );
};

export default Ai;
