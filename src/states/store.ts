"use client";

import announcementReducer from "./slices/announcementSlice";
import searchLocationReducer from "./slices/searchSlice";
import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import placesReducer from "./slices/placesSlice";

export const store = configureStore({
  reducer: {
    announcement: announcementReducer,
    places: placesReducer,
    searchLocation: searchLocationReducer,
  },
  // devTools: process.env.NODE_ENV !== "production",
  devTools: true,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action
>;
