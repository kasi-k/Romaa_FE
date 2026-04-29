import React from "react";
import AppRoutes from "./routes/AppRoutes";
import NetworkOfflineBanner from "./components/NetworkOfflineBanner";

const App = () => {
  return (
    <>
    <NetworkOfflineBanner />
      <AppRoutes />
    </>
  );
};

export default App;
