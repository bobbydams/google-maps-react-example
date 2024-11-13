import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import GoogleClusteredMap from "./GoogleClusteredMap/GoogleClusteredMap";
import { GoogleMapsProvider } from "./GoogleClusteredMap/provider/GoogleMapsProvider";
import { MapEntity } from "./GoogleClusteredMap/types";
import { Grid2, Paper, styled } from "@mui/material";
import { ExtendedEntity } from "@dimension/inspections-ts-models";
import { MapTypeId } from "./GoogleClusteredMap/enums";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  ...theme.applyStyles("dark", {
    backgroundColor: "#1A2027",
  }),
}));

interface AssetType extends ExtendedEntity {}

interface Asset extends MapEntity {
  children?: Asset[];
  assetType: AssetType;
}

function App() {
  const created = {
    action: "",
    user: { username: "", email: "" },
    date: "",
  };

  const assetType = {
    id: "AT0",
    name: "Asset Type 0",
    description: "",
    created,
    updated: created,
    active: true,
  };

  const londonItems: Asset[] = Array.from({ length: 100 }, (_, i) => ({
    id: `1A${i}`,
    name: `Location 1A${i}`,
    description: `Location 1A${i}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
    active: true,
    created,
    coordinates: {
      lat: 51.505 + Math.random() * 0.1,
      long: -0.09 + Math.random() * 0.1,
    },
    children: Array.from({ length: 10 }, (_, j) => ({
      id: `C1A${i}${j}`,
      name: `Location Child C1A${i}${j}`,
      active: true,
      created,
      coordinates: {
        lat: 51.505 + Math.random() * 0.1,
        long: -0.09 + Math.random() * 0.1,
      },
      assetType,
    })),
    assetType,
  }));

  // Data for Amsterdam
  const amsterdamItems: Asset[] = Array.from({ length: 100 }, (_, i) => ({
    id: `2A${i}`,
    name: `Location 2A${i}`,
    description: `Location 2A${i}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
    active: true,
    created,
    children: undefined,
    coordinates: {
      lat: 52.379189 + Math.random() * 0.1,
      long: 4.899431 + Math.random() * 0.1,
    },
    assetType,
  }));

  return (
    <Router>
      <GoogleMapsProvider>
        <div className="App">
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <Item>
                <h1>Google Clustered Map #1 - London</h1>
                <GoogleClusteredMap<Asset>
                  items={londonItems}
                  selectedItems={[
                    londonItems[0],
                    londonItems[1],
                    londonItems[2],
                  ]}
                  mapTypeId={MapTypeId.TERRAIN}
                  mapId="1b4f14dfadfcbf7"
                  infoWindowContentProps={{
                    itemUrlTemplate:
                      "https://apps.maince.ai/asset-viewer/assets/<%= id %>",
                    itemInfoTemplate:
                      "<%= description %><br/><br/><% if (children) { %>Children: <%= children.length %><% } %>",
                    getItemSubTitle(item) {
                      return `Asset Type: ${item.assetType.name}`;
                    },
                  }}
                />
              </Item>
            </Grid2>
            <Grid2 size={6}>
              <Item>
                <h1>Google Clustered Map #2 - Amsterdam</h1>
                <GoogleClusteredMap<Asset>
                  items={amsterdamItems}
                  selectedItems={[
                    amsterdamItems[2],
                    amsterdamItems[3],
                    amsterdamItems[4],
                  ]}
                  mapId="f8278b65a6996853"
                  infoWindowContentProps={{
                    itemUrlTemplate:
                      "https://apps.maince.ai/asset-viewer/assets/<%= id %>",
                    itemInfoTemplate:
                      "<%= description %><br/><br/><% if (children) { %>Children: <%= children.length %><% } %>",
                  }}
                />
              </Item>
            </Grid2>
          </Grid2>
        </div>
      </GoogleMapsProvider>
    </Router>
  );
}

export default App;
