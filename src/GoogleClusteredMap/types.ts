import { Feature, Point, FeatureCollection } from "geojson";
import { ExtendedEntity } from "@dimension/inspections-ts-models";

export interface MapEntity extends ExtendedEntity {
  coordinates: {
    lat: number;
    long: number;
  };
}

export type MapFeature = Feature<Point, MapEntity>;

export type EntityCollection = FeatureCollection<Point, MapEntity>;
