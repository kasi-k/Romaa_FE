// src/context/ProjectContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [tenderId, setTenderId] = useState(() => {
    return localStorage.getItem("tenderId") || null;
  });

  useEffect(() => {
    if (tenderId) {
      localStorage.setItem("tenderId", tenderId);
    } else {
      localStorage.removeItem("tenderId");
    }
  }, [tenderId]);

  return (
    <ProjectContext.Provider value={{ tenderId, setTenderId }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
