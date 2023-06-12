import { createSlice } from "@reduxjs/toolkit";

export interface IAnnouncement {
  message: string;
  type: string;
}

export interface IAction {
  type: string;
  message: string;
}

const initialState: IAnnouncement = {
  message: "No announcement...",
  type: "info",
};

export const announcementSlice = createSlice({
  name: "announcement",
  initialState: {
    message: "No announcement...",
    type: "info",
  },
  reducers: {
    updateAnnouncement: (state, action) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
    },
  },
  extraReducers: {
    // Add reducers for additional action types here, and handle loading state as needed
  },
});

export const { updateAnnouncement } = announcementSlice.actions;

export const announcement = (state: any) => state.announcement;

export default announcementSlice.reducer;
