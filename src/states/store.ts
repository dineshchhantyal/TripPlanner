import announcementReducer from "./slices/announcementSlice";
import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";
import placesReducer from "./slices/placesSlice";

const makeStore = () =>
  configureStore({
    reducer: {
      announcement: announcementReducer,
      places: placesReducer,
    },
    devTools: true,
  });
export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore["getState"]>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

export const wrapper = createWrapper<AppStore>(makeStore);
