import React, { createContext, useContext } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";

interface GoogleMapsProviderProps {
  children: React.ReactNode;
}

const GoogleMapsContext = createContext<{ isLoaded: boolean }>({
  isLoaded: true,
});

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({
  children,
}) => {
  return (
    <GoogleMapsContext.Provider value={{ isLoaded: true }}>
      <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ""}>
        {children}
      </APIProvider>
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => useContext(GoogleMapsContext);
