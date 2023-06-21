import { GeoReturn } from "use-places-autocomplete";

export interface SearchLocation {
  address_components: AddressComponent[];
  formatted_address: string;
  // geometry: Geometry;
  place_id: string;
  types: string[];
}

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface Geometry {
  bounds: Bounds | undefined;
  location_type: string;
  viewport: Viewport;
}

export interface Bounds {
  Ua: Ua;
  Ha: Ha;
}

export interface Ua {
  lo: number;
  hi: number;
}

export interface Ha {
  lo: number;
  hi: number;
}

export interface Viewport {
  Ua: Ua2;
  Ha: Ha2;
}

export interface Ua2 {
  lo: number;
  hi: number;
}

export interface Ha2 {
  lo: number;
  hi: number;
}
