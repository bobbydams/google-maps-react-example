import React, { useCallback, useEffect, useState } from "react";
import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import CategoryIcon from "@mui/icons-material/Category";
import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";
import { useSpring, animated } from "@react-spring/web";

type TreeClusterMarkerProps = {
  clusterId: number;
  onMarkerClick?: (
    marker: google.maps.marker.AdvancedMarkerElement,
    clusterId: number
  ) => void;
  position: google.maps.LatLngLiteral;
  size: number;
  sizeAsText: string;
};

const StyledAdvancedMarker = styled(AdvancedMarker)(({ theme }) => ({
  width: 40,
  height: 40,
  backgroundColor: theme.palette.primary.main,
  filter:
    theme.palette.mode === "dark"
      ? "drop-shadow(1px 2px 3px rgba(0, 0, 0, 0.7))"
      : "drop-shadow(1px 2px 3px rgba(0, 0, 0, 0.3))",
  color: theme.palette.getContrastText(theme.palette.primary.main),
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  justifyContent: "center",
  borderRadius: "50%",
  overflow: "hidden",
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: "0.8rem",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  padding: "0 8px",
  width: "calc(100% + 16px)",
  textAlign: "center",
  marginTop: "6px",
  height: "100%",
}));

const StyledCategoryIcon = styled(CategoryIcon)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
}));

const AnimatedAdvancedMarker = animated(StyledAdvancedMarker);

export const FeaturesClusterMarker = ({
  position,
  size,
  sizeAsText,
  onMarkerClick,
  clusterId,
}: TreeClusterMarkerProps) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const handleClick = useCallback(
    () => onMarkerClick && onMarkerClick(marker!, clusterId),
    [onMarkerClick, marker, clusterId]
  );
  const markerSize = Math.floor(48 + Math.sqrt(size) * 2);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const springProps = useSpring({
    from: { opacity: 1, transform: "scale(1)" },
    to: {
      opacity: isMounted ? 1 : 0,
      transform: isMounted ? "scale(1)" : "scale(0)",
    },
    config: { tension: 170, friction: 26 },
  });

  return (
    <AnimatedAdvancedMarker
      ref={markerRef}
      position={position}
      zIndex={size}
      onClick={handleClick}
      style={{ ...springProps, width: markerSize, height: markerSize }}
      anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
    >
      <StyledCategoryIcon fontSize="small" />
      <StyledTypography>{sizeAsText}</StyledTypography>
    </AnimatedAdvancedMarker>
  );
};
