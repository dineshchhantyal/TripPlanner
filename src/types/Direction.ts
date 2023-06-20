export interface Direction {
  geocoded_waypoints: GeocodedWaypoint[];
  routes: Route[];
  status: string;
}

export interface GeocodedWaypoint {
  geocoder_status: string;
  place_id: string;
  types: string[];
}

export interface Route {
  bounds: Bounds;
  copyrights: string;
  legs: Leg[];
  overview_polyline: OverviewPolyline;
  summary: string;
  warnings: any[];
  waypoint_order: any[];
}

export interface Bounds {
  northeast: Northeast;
  southwest: Southwest;
}

export interface Northeast {
  lat: number;
  lng: number;
}

export interface Southwest {
  lat: number;
  lng: number;
}

export interface Leg {
  distance: Distance;
  duration: Duration;
  end_address: string;
  end_location: EndLocation;
  start_address: string;
  start_location: StartLocation;
  steps: Step[];
  traffic_speed_entry: any[];
  via_waypoint: any[];
}

export interface Distance {
  text: string;
  value: number;
}

export interface Duration {
  text: string;
  value: number;
}

export interface EndLocation {
  lat: number;
  lng: number;
}

export interface StartLocation {
  lat: number;
  lng: number;
}

export interface Step {
  distance: Distance2;
  duration: Duration2;
  end_location: EndLocation2;
  html_instructions: string;
  polyline: Polyline;
  start_location: StartLocation2;
  travel_mode: string;
  maneuver?: string;
}

export interface Distance2 {
  text: string;
  value: number;
}

export interface Duration2 {
  text: string;
  value: number;
}

export interface EndLocation2 {
  lat: number;
  lng: number;
}

export interface Polyline {
  points: string;
}

export interface StartLocation2 {
  lat: number;
  lng: number;
}

export interface OverviewPolyline {
  points: string;
}
