import { Prediction } from "@/components/SearchBar/SearchBar";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface IPlaces {
  places: Prediction[];
}

export interface IAction {
  type: string;
  message: string;
}
export interface Photo {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: Src;
  liked: boolean;
  alt: string;
}

export interface Src {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

const initialState: IPlaces = {
  places: [],
};

export const placesSlice = createSlice({
  name: "places",
  initialState: initialState,
  reducers: {
    updatePlaces: (
      state,
      action: PayloadAction<{
        places: Prediction[];
      }>
    ) => {
      state.places = action.payload.places;
    },

    addPlace: (
      state,
      action: PayloadAction<{
        place: Prediction;
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
  },
  extraReducers: {
    // Add reducers for additional action types here, and handle loading state as needed
  },
});

export const { updatePlaces, addPlace } = placesSlice.actions;

export default placesSlice.reducer;

// export function fetchTodoById(todoId) {
//   // fetchTodoByIdThunk is the "thunk function"
//   return async function fetchTodoByIdThunk(dispatch, getState) {
//     const response = await client.get(`/fakeApi/todo/${todoId}`);
//     dispatch(todosLoaded(response.todos));
//   };
// }

export function fetchAboutPlace(place: Prediction) {
  return async function fetchAboutPlaceThunk(
    dispatch: (arg0: {
      payload: { places: Prediction[] } | { place: Prediction };
      type: "places/addPlace" | "places/updatePlaces";
    }) => void,
    getState: any
  ) {
    try {
      const response = await fetch(`/api/images?query=${place.description}`);
      const data = await response.json();
      dispatch(addPlace({ place: { ...place, photos: data.photos } }));
    } catch (e: any) {
      confirm(e.message);
    }
  };
}
