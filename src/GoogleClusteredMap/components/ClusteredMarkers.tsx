import React, { useCallback, useEffect } from "react";
import CategoryIcon from "@mui/icons-material/Category";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import Supercluster, { ClusterProperties } from "supercluster";
import { FeaturesClusterMarker } from "./FeaturesClusterMarker";
import { FeatureMarker } from "./FeatureMarker";
import { useSupercluster } from "../hooks/use-supercluster";
import { FeatureCollection, GeoJsonProperties, Point } from "geojson";
import { MapEntity, MapFeature } from "../types";
import { MarkerType } from "../enums";

type ClusteredMarkersProps = {
  geojson: FeatureCollection<Point>;
  setNumClusters: (n: number) => void;
  setInfowindowData: (
    data: {
      anchor: google.maps.marker.AdvancedMarkerElement;
      features: MapFeature[];
    } | null
  ) => void;
  selectedItems?: MapEntity[];
};

const superclusterOptions: Supercluster.Options<
  GeoJsonProperties,
  ClusterProperties
> = {
  extent: 256,
  radius: 80,
  maxZoom: 12,
};

export const ClusteredMarkers = ({
  geojson,
  setNumClusters,
  setInfowindowData,
  selectedItems = [],
}: ClusteredMarkersProps) => {
  const { clusters, getLeaves } = useSupercluster(geojson, superclusterOptions);

  useEffect(() => {
    setNumClusters(clusters.length);
  }, [setNumClusters, clusters.length]);

  const handleClusterClick = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement, clusterId: number) => {
      const leaves = getLeaves(clusterId);

      setInfowindowData({ anchor: marker, features: leaves as MapFeature[] });
    },
    [getLeaves, setInfowindowData]
  );

  const handleMarkerClick = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement, featureId: string) => {
      const feature = clusters.find(
        (feat) => feat.id === featureId
      ) as MapFeature;

      setInfowindowData({ anchor: marker, features: [feature] });
    },
    [clusters, setInfowindowData]
  );

  return (
    <>
      {clusters.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const isCluster = feature.properties?.cluster;
        const clusterProperties = isCluster
          ? (feature.properties as ClusterProperties)
          : null;
        const featureProperties = !isCluster
          ? (feature.properties as MapEntity)
          : null;
        const isPersonMarker =
          featureProperties?.id === MarkerType.USER_LOCATION;

        return isCluster ? (
          <FeaturesClusterMarker
            key={`fcm-${feature.id}-${clusterProperties?.cluster_id}`}
            clusterId={clusterProperties!.cluster_id}
            position={{ lat, lng }}
            size={clusterProperties!.point_count}
            sizeAsText={String(clusterProperties!.point_count_abbreviated)}
            onMarkerClick={handleClusterClick}
          />
        ) : (
          <FeatureMarker
            key={`fm-${featureProperties!.id || ""}-${feature.id}`}
            Icon={isPersonMarker ? PersonPinIcon : CategoryIcon}
            featureId={feature.id as string}
            position={{ lat, lng }}
            onMarkerClick={handleMarkerClick}
            isSelected={selectedItems.some(
              (item) => item.id === featureProperties!.id
            )}
          />
        );
      })}
    </>
  );
};
