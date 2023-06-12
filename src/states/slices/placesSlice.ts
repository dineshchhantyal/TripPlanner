import { Prediction } from "@/components/SearchBar/SearchBar";
import { createSlice } from "@reduxjs/toolkit";

export interface IPlaces {
  places: Prediction[];
}

export interface IAction {
  type: string;
  message: string;
}

const initialState: IPlaces = {
  places: [],
};

export const placesSlice = createSlice({
  name: "places",
  initialState: initialState,
  reducers: {
    updatePlaces: (state, action) => {
      state.places = action.payload.places;
    },
    getPlaces: (state, action) => {
      state.places = action.payload.places;
    },
    addPlace: (state, action) => {
      state.places.push(action.payload.place);
    },
  },
  extraReducers: {
    // Add reducers for additional action types here, and handle loading state as needed
  },
});

export const { updatePlaces, getPlaces, addPlace } = placesSlice.actions;

export const places = (state: any) => state.places;

export default placesSlice.reducer;
