import { Prediction } from "@/components/SearchBar/SearchBar";
import { SearchLocation } from "@/types/SearchLocation";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Photo } from "./placesSlice";
import { stat } from "fs";

export interface Location extends SearchLocation {
  lat: number;
  lng: number;
  photos?: Photo[];
}

interface IPlaces {
  places: Location[];
  waypoints_order?: number[];
  start: string | undefined; // place_id
  end: string | undefined; // place_id
}

const initialState: IPlaces = {
  places: [],
  waypoints_order: [],
  start: undefined,
  end: undefined,
};

export const searchLocationSlice = createSlice({
  name: "searchLocation",
  initialState: initialState,
  reducers: {
    updateLocations: (
      state,
      action: PayloadAction<{
        places: Location[];
      }>
    ) => {
      state.places = action.payload.places;
    },

    addLocation: (
      state,
      action: PayloadAction<{
        place: Location;
      }>
    ) => {
      const { place } = action.payload;
      const index = state.places.findIndex(
        (p) => p.place_id === place.place_id
      );
      if (index === -1) {
        state.places.push(place);
      } else {
        state.places[index] = place;
      }
    },

    updateStartPlace: (
      state,
      action: PayloadAction<{
        place_id: string;
      }>
    ) => {
      const { place_id } = action.payload;
      state.start = place_id;
    },
    updateEndPlace: (
      state,
      action: PayloadAction<{
        place_id: string;
      }>
    ) => {
      const { place_id } = action.payload;
      state.end = place_id;
    },
    removeLocation: (
      state,
      action: PayloadAction<{
        place_id: string;
      }>
    ) => {
      const p = state.places.filter(
        (s) => s.place_id != action.payload.place_id
      );

      state.places = p;
    },
    sortLocations: (
      state,
      action: PayloadAction<{
        waypoints_order: number[];
      }>
    ) => {
      const { waypoints_order } = action.payload;
      const newPlaces = [
        state.places[0],
        ...waypoints_order.map((i) => state.places[i]),
      ];

      state.places = newPlaces;
    },
    updateWaypointsOrder: (
      state,
      action: PayloadAction<{
        waypoints_order: number[];
      }>
    ) => {
      const { waypoints_order } = action.payload;
      state.waypoints_order = waypoints_order;
    },
    removeWaypoint: (
      state,
      action: PayloadAction<{
        index: number;
      }>
    ) => {
      const { index } = action.payload;
      const new_points = state.waypoints_order?.filter((_, i) => i !== index);
      state.waypoints_order = new_points;
    },
  },
  extraReducers: {
    // Add reducers for additional action types here, and handle loading state as needed
  },
});

export const {
  updateLocations,
  addLocation,
  removeLocation,
  sortLocations,
  updateWaypointsOrder,
  removeWaypoint,
  updateStartPlace,
  updateEndPlace,
} = searchLocationSlice.actions;

export default searchLocationSlice.reducer;

export function fetchLocationPhotos(place: Location) {
  return async function fetchAboutPlaceThunk(
    dispatch: (arg0: {
      payload: { places: Location[] } | { place: Location };
      type: "searchLocation/addLocation" | "searchLocation/updateLocation";
    }) => void,
    getState: any
  ) {
    try {
      const response = await fetch(
        `/api/images?query=${place.formatted_address}`
      );

      const images = await response.json();
      dispatch(
        addLocation({
          place: {
            ...place,
            photos: images.photos,
          },
        })
      );
    } catch (e: any) {
      confirm(e.message);
    }
  };
}
