import React from "react";
import {
  Typography,
  Link,
  List,
  ListItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { MapFeature, MapEntity } from "../types";
import { Link as RouterLink } from "react-router-dom";
import CopyLinkIconButton from "./CopyLinkIconButton";
import { MarkerType } from "../enums";

type InfoWindowContentProps<T extends MapEntity> = {
  features: MapFeature[];
  maxItemsToShow?: number;
  getItemUrl: (item: T) => string;
  getItemTitle: (item: T) => string;
  getItemSubTitle?: (item: T) => string;
  getItemInformation: (item: T) => string;
  isCluster: (props: any) => boolean;
};

const numFmt = new Intl.NumberFormat();

const InfoWindowContent = <T extends MapEntity>({
  features,
  maxItemsToShow = 10,
  getItemUrl,
  getItemTitle,
  getItemSubTitle,
  getItemInformation,
  isCluster,
}: InfoWindowContentProps<T>) => {
  if (features.length === 1 && !isCluster(features[0].properties)) {
    const f = features[0];
    const props = f.properties as T;
    const isPersonMarker = props.id === MarkerType.USER_LOCATION;

    return (
      <>
        <Typography variant="h6">{getItemTitle(props)}</Typography>
        {getItemSubTitle && (
          <Typography variant="caption">{getItemSubTitle(props)}</Typography>
        )}
        {isPersonMarker ? (
          <Typography variant="caption">
            <strong>
              This is your approximate location depending on the location
              settings of your device.
            </strong>
          </Typography>
        ) : (
          <>
            <Typography
              align="left"
              variant="body2"
              dangerouslySetInnerHTML={{ __html: getItemInformation(props) }}
            />
            <Typography>
              <Tooltip title="View details" arrow placement="top">
                <IconButton component={RouterLink} to={getItemUrl(props)}>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
              <CopyLinkIconButton link={getItemUrl(props)} />
            </Typography>
          </>
        )}
      </>
    );
  }

  return (
    <>
      <Typography variant="h6">
        {numFmt.format(features.length)} items
      </Typography>
      <Typography variant="caption">
        Zoom to see individual items or click to view details.
      </Typography>

      <List>
        {features.slice(0, maxItemsToShow).map((feature, index) => {
          const props = feature.properties as T;

          return (
            <ListItem key={`li-${feature.id}-${index}`}>
              <Link href={getItemUrl(props)}>{getItemTitle(props)}</Link>
            </ListItem>
          );
        })}

        {features.length > maxItemsToShow && (
          <ListItem>
            and {numFmt.format(features.length - maxItemsToShow)} more.
          </ListItem>
        )}
      </List>
    </>
  );
};

export default InfoWindowContent;
