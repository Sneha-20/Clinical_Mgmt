// src/lib/redux/ui/uiSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: 0, // global loader counter
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    startLoading(state) {
      state.loading += 1;
    },
    stopLoading(state) {
      if (state.loading > 0) {
        state.loading -= 1;
      }
    },
  },
});

export const { startLoading, stopLoading } = uiSlice.actions;

export const selectLoader = (state) => state.ui.loading;

export default uiSlice.reducer;
