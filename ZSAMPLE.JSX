import { Router } from "express";
import { verifyJWT, verifyPermission } from "../middleware/auth.middleware.js";
import { 
  createEmployee, 
  getAllEmployees, 
  deleteEmployee 
} from "./employee.controller.js";

const employeeRoute = Router();

// 1. Public Routes (No Protection)
employeeRoute.post("/login", login); 

// 2. Protected Routes (Need Valid Token)
// Apply verifyJWT to all routes below this line
employeeRoute.use(verifyJWT); 

// 3. RBAC Protected Routes (Need Specific Role Permissions)

// Only HR with 'Read' access can list employees
employeeRoute.get("/list", 
  verifyPermission("hr", "employee", "read"), 
  getAllEmployees
);

// Only HR with 'Create' access can add employees
employeeRoute.post("/add", 
  verifyPermission("hr", "employee", "create"), 
  createEmployee
);

// Only HR with 'Delete' access can remove employees
employeeRoute.delete("/:employeeId", 
  verifyPermission("hr", "employee", "delete"), 
  deleteEmployee
);

// npm install @react-google-maps/api

import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "12px",
};

// Default center (e.g., Chennai). 
const defaultCenter = {
  lat: 13.0827,
  lng: 80.2707,
};

const GoogleLocationPicker = ({ onLocationSelect, initialLat, initialLng }) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY_HERE", // <--- REPLACE THIS
  });

  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Set initial marker if editing
  useEffect(() => {
    if (initialLat && initialLng) {
      setSelectedLocation({ lat: initialLat, lng: initialLng });
    }
  }, [initialLat, initialLng]);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    // Update local state for marker
    setSelectedLocation({ lat, lng });
    
    // Send data to parent
    if (onLocationSelect) {
      onLocationSelect({ lat, lng });
    }
  };

  if (!isLoaded) return <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-xl">Loading Map...</div>;

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={selectedLocation || defaultCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false, // Cleaner UI
        }}
      >
        {selectedLocation && (
          <Marker position={selectedLocation} />
        )}
      </GoogleMap>

      <div className="absolute top-2 right-2 bg-white px-3 py-1 text-xs font-bold rounded shadow z-10">
        Click to pin location
      </div>
    </div>
  );
};



import React from "react";
import { useForm } from "react-hook-form";
import GoogleLocationPicker from "./GoogleLocationPicker"; 

const AddSiteWithGoogle = () => {
  const { register, handleSubmit, setValue, watch } = useForm();
  
  // Watch values just to display them in the UI (optional)
  const lat = watch("latitude");
  const lng = watch("longitude");

  const handleLocationSelect = ({ lat, lng }) => {
    // Update Hidden Form Fields
    setValue("latitude", lat);
    setValue("longitude", lng);
  };

  const onSubmit = (data) => {
    console.log("Submitting:", data);
    // Call your API here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto p-6 space-y-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-xl font-bold mb-4">Add New Site</h2>

      {/* --- GOOGLE MAP --- */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">Pin Location</label>
        
        <GoogleLocationPicker 
            onLocationSelect={handleLocationSelect} 
            // initialLat={13.08} // Pass these if editing an existing site
            // initialLng={80.27}
        />
        
        {/* Visual Feedback */}
        <div className="grid grid-cols-2 gap-4 mt-2">
           <div className="bg-gray-50 p-2 rounded border text-xs">
             <span className="text-gray-500 block">Lat</span>
             <span className="font-mono">{lat || "-"}</span>
           </div>
           <div className="bg-gray-50 p-2 rounded border text-xs">
             <span className="text-gray-500 block">Lng</span>
             <span className="font-mono">{lng || "-"}</span>
           </div>
        </div>

        {/* Hidden Inputs for Form Submission */}
        <input type="hidden" {...register("latitude")} />
        <input type="hidden" {...register("longitude")} />
      </div>

      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">
        Save Location
      </button>
    </form>
  );
};



