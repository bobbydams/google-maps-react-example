import React, { useCallback, useEffect, useState } from "react";
import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { styled } from "@mui/material/styles";
import { useSpring, animated } from "@react-spring/web";

type FeatureMarkerProps = {
  position: google.maps.LatLngLiteral;
  featureId: string;
  onMarkerClick?: (
    marker: google.maps.marker.AdvancedMarkerElement,
    featureId: string
  ) => void;
  isSelected: boolean;
  Icon: React.ElementType;
};

const StyledAdvancedMarker = styled(AdvancedMarker, {
  shouldForwardProp: (prop) => prop !== "isSelected",
})<{ isSelected: boolean }>(({ theme, isSelected }) => ({
  minWidth: 40,
  minHeight: 40,
  backgroundColor: isSelected
    ? theme.palette.secondary.main
    : theme.palette.primary.main,
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

const AnimatedAdvancedMarker = animated(StyledAdvancedMarker);

export const FeatureMarker = ({
  position,
  featureId,
  onMarkerClick,
  isSelected,
  Icon,
}: FeatureMarkerProps) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const handleClick = useCallback(
    () => onMarkerClick && onMarkerClick(marker!, featureId),
    [onMarkerClick, marker, featureId]
  );

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
      onClick={handleClick}
      anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
      style={springProps}
      isSelected={isSelected}
    >
      <Icon />
    </AnimatedAdvancedMarker>
  );
};
