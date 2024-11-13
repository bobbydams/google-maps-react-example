import React, { useCallback, useMemo, useState } from "react";
import _ from "lodash";
import { InfoWindow, Map, useMap } from "@vis.gl/react-google-maps";
import { ClusteredMarkers } from "./components/ClusteredMarkers";
import InfoWindowContent from "./components/InfoWindowContent";
import { EntityCollection, MapEntity, MapFeature } from "./types";
import ControlPanel from "./components/ControlPanel";
import { ButtonGroup, Box, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ReplayIcon from "@mui/icons-material/Replay";
import InfoIcon from "@mui/icons-material/Info";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import GpsNotFixedIcon from "@mui/icons-material/GpsNotFixed";
import { MapTypeId, MarkerType } from "./enums";
import { useSpring, animated } from "@react-spring/web";

interface InfoWindowContentProps<T> {
  itemUrlTemplate?: string;
  itemInfoTemplate?: string;
  getItemTitle?: (item: T) => string;
  getItemSubTitle?: (item: T) => string;
}

interface GoogleClusteredMapProps<T extends MapEntity = MapEntity> {
  items: T[];
  selectedItems?: T[];
  mapId: string;
  mapTypeId?: MapTypeId;
  infoWindowContentProps?: InfoWindowContentProps<T>;
}

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const convertItemsToGeojson = (items: MapEntity[]): EntityCollection => {
  return {
    type: "FeatureCollection",
    features: items.map((item) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [item.coordinates.long, item.coordinates.lat],
      },
      properties: item,
    })),
  };
};

const GoogleClusteredMap = <T extends MapEntity = MapEntity>({
  items: initialItems,
  selectedItems = [],
  mapId,
  mapTypeId = MapTypeId.ROADMAP,
  infoWindowContentProps = {},
}: GoogleClusteredMapProps<T>) => {
  const [items, setItems] = useState<T[]>(initialItems);
  const [numClusters, setNumClusters] = useState<number>(0);
  const [showControlPanel, setShowControlPanel] = useState<boolean>(false);
  const [locateUserGPS, setLocateUserGPS] = useState<boolean>(false);
  const [userLocationFound, setUserLocationFound] = useState<boolean>(false);

  const gpsIconAnimation = useSpring({
    enter: { opacity: 1 },
    from: { opacity: 1 },
    to: { opacity: 0 },
    loop: locateUserGPS, // loop animation while locating
    config: { duration: 1000 }, // controls blink speed
  });

  const map = useMap(mapId);

  const [infowindowData, setInfowindowData] = useState<{
    anchor: google.maps.marker.AdvancedMarkerElement;
    features: MapFeature[];
  } | null>(null);

  const handleInfoWindowClose = useCallback(
    () => setInfowindowData(null),
    [setInfowindowData]
  );

  const mapCenter = useMemo(
    () => ({
      lat: items.length ? items[0].coordinates.lat : 0,
      lng: items.length ? items[0].coordinates.long : 0,
    }),
    [items]
  );

  const geojson = useMemo(() => convertItemsToGeojson(items), [items]);

  const handleZoomIn = useCallback(() => {
    if (map) {
      setInfowindowData(null);
      map.setZoom((map.getZoom() || 0) + 1);
    }
  }, [map, setInfowindowData]);

  const handleZoomOut = useCallback(() => {
    if (map) {
      setInfowindowData(null);
      map.setZoom((map.getZoom() || 0) - 1);
    }
  }, [map, setInfowindowData]);

  const handleResetMap = useCallback(() => {
    if (map) {
      map.setZoom(10);
      map.panTo(mapCenter);
      setInfowindowData(null);
    }
  }, [map, mapCenter, setInfowindowData]);

  const handleToggleControlPanel = useCallback(() => {
    setShowControlPanel((show) => !show);
  }, [setShowControlPanel]);

  const handleGetGPSLocation = useCallback(() => {
    if (navigator.geolocation) {
      setLocateUserGPS(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCurrentPosition = {
            lat: position.coords.latitude,
            long: position.coords.longitude,
          };
          const userLocation: T = {
            id: MarkerType.USER_LOCATION,
            name: "Your Approximate Location",
            coordinates: userCurrentPosition,
          } as T;

          const isUserLocationPresent = items.some(
            (item) => item.id === userLocation.id
          );

          if (!isUserLocationPresent) {
            setItems((prevItems) => [...prevItems, userLocation]);
          }
          setLocateUserGPS(false); // stop blinking after location is found
          setUserLocationFound(true);
        },
        () => {
          setLocateUserGPS(false);
          setUserLocationFound(false);
        }
      );
    }
  }, [items]);

  return (
    <>
      <Map
        mapId={mapId}
        mapTypeId={mapTypeId}
        id={mapId}
        defaultCenter={mapCenter}
        defaultZoom={10}
        gestureHandling="greedy"
        disableDefaultUI
        style={mapContainerStyle}
      >
        <ClusteredMarkers
          geojson={geojson}
          setNumClusters={setNumClusters}
          setInfowindowData={setInfowindowData}
          selectedItems={selectedItems}
        />
        {infowindowData && (
          <InfoWindow
            onCloseClick={handleInfoWindowClose}
            anchor={infowindowData.anchor}
            maxWidth={350}
          >
            <InfoWindowContent
              features={infowindowData.features}
              getItemUrl={function (item: T): string {
                try {
                  const template = _.template(
                    infoWindowContentProps.itemUrlTemplate || ""
                  );
                  return template(item);
                } catch (error) {
                  console.error("Error generating item URL template:", error);
                  return "";
                }
              }}
              getItemInformation={function (item: T): string {
                try {
                  const template = _.template(
                    infoWindowContentProps.itemInfoTemplate || ""
                  );
                  return template(item);
                } catch (error) {
                  console.error(
                    "Error generating item information template:",
                    error
                  );
                  return "";
                }
              }}
              getItemTitle={function (item: T): string {
                if (infoWindowContentProps.getItemTitle) {
                  return infoWindowContentProps.getItemTitle(item);
                }
                return item.name;
              }}
              getItemSubTitle={infoWindowContentProps.getItemSubTitle}
              isCluster={(props: any) => !!props.cluster}
            />
          </InfoWindow>
        )}
        <Box sx={{ position: "absolute", top: 10, left: 10 }}>
          <ButtonGroup orientation="vertical">
            <Button onClick={handleZoomIn} variant="contained">
              <AddIcon />
            </Button>
            <Button onClick={handleZoomOut} variant="contained">
              <RemoveIcon />
            </Button>
            <Button onClick={handleResetMap} variant="contained">
              <ReplayIcon />
            </Button>
            {!userLocationFound ? (
              <Button onClick={handleGetGPSLocation} variant="contained">
                {!locateUserGPS ? (
                  <GpsNotFixedIcon />
                ) : (
                  <animated.div style={gpsIconAnimation}>
                    <GpsFixedIcon />
                  </animated.div>
                )}
              </Button>
            ) : (
              <Button onClick={handleGetGPSLocation} variant="contained">
                {!locateUserGPS ? (
                  <GpsFixedIcon />
                ) : (
                  <animated.div style={gpsIconAnimation}>
                    <GpsFixedIcon />
                  </animated.div>
                )}
              </Button>
            )}
            <Button onClick={handleToggleControlPanel} variant="contained">
              <InfoIcon />
            </Button>
          </ButtonGroup>
        </Box>
        <Box sx={{ position: "absolute", top: 10, right: 10 }}>
          {showControlPanel && (
            <ControlPanel
              mapId={mapId}
              mapTypeId={mapTypeId}
              numClusters={numClusters}
              numFeatures={geojson?.features.length || 0}
              onClose={() => setShowControlPanel(false)}
            />
          )}
        </Box>
      </Map>
    </>
  );
};

export default GoogleClusteredMap;
