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
}

const initialState: IPlaces = {
  places: [],
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
  },
  extraReducers: {
    // Add reducers for additional action types here, and handle loading state as needed
  },
});

export const { updateLocations, addLocation, removeLocation, sortLocations } =
  searchLocationSlice.actions;

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
