import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // 1. Import
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // 2. DevTools
import "./index.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { setupAxiosInterceptors } from "./services/setupAxios.js";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { SearchProvider } from "./context/SearchBar.jsx";
import { ProjectProvider } from "./context/ProjectContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

// Set up 401 interceptor for all direct axios calls (non-TanStack files)
setupAxiosInterceptors();

// 3. Create the Client with default stale times
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // Data stays fresh for 1 minute
      gcTime: 5 * 60 * 1000, // Unused data is garbage collected after 5 mins
      refetchOnWindowFocus: false, // Don't refetch on alt-tab (optional)
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            <AuthProvider>
              <SearchProvider>
                <ProjectProvider>
                  <App />
                </ProjectProvider>
              </SearchProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
        {/* DevTools only show in development */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);