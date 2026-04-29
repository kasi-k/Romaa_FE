import { createContext, useContext, useState } from "react";


const SearchBar = createContext();


export const useSearch = () => {
  const context = useContext(SearchBar);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <SearchBar.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </SearchBar.Provider>
  );
};
