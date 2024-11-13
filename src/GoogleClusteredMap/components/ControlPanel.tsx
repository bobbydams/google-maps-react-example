import * as React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
} from "@mui/material";
import { MapTypeId } from "../enums";
import CloseIcon from "@mui/icons-material/Close";
import { useCallback, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";

type ControlPanelProps = {
  numClusters: number;
  numFeatures: number;
  mapId: string;
  mapTypeId?: MapTypeId;
  onClose: () => void;
};

const numberFormat = new Intl.NumberFormat();

function ControlPanel(props: ControlPanelProps) {
  const [currentMapTypeId, setCurrentMapTypeId] = useState<MapTypeId>(
    props?.mapTypeId ?? MapTypeId.ROADMAP
  );

  const map = useMap(props.mapId);
  const handleMapTypeChange = useCallback(
    (event: SelectChangeEvent<MapTypeId>) => {
      const newMapTypeId = event.target.value as MapTypeId;
      setCurrentMapTypeId(newMapTypeId);
      if (map) {
        map.setMapTypeId(newMapTypeId);
      }
    },
    [map]
  );
  return (
    <Box p={2} boxShadow={3} borderRadius={2} bgcolor="background.paper">
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h6" gutterBottom>
          Map Control
        </Typography>
        <IconButton onClick={() => props.onClose()} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Select
        value={currentMapTypeId}
        onChange={handleMapTypeChange}
        variant="standard"
        sx={{ mt: 1 }}
        fullWidth
      >
        <MenuItem value={MapTypeId.ROADMAP}>Roadmap</MenuItem>
        <MenuItem value={MapTypeId.SATELLITE}>Satellite</MenuItem>
        <MenuItem value={MapTypeId.HYBRID}>Hybrid</MenuItem>
        <MenuItem value={MapTypeId.TERRAIN}>Terrain</MenuItem>
      </Select>
      <List>
        <ListItem>
          <ListItemText
            primary={<strong>{numberFormat.format(props.numFeatures)}</strong>}
            secondary="Total map items"
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={<strong>{props.numClusters}</strong>}
            secondary="Total map clusters"
          />
        </ListItem>
      </List>
    </Box>
  );
}

export default React.memo(ControlPanel);
