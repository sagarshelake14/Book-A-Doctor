import { createSlice } from "@reduxjs/toolkit";

export const alertsSlice = createSlice({
  name: "alerts",
  initialState: {
    loading: true,
  },
  reducers: {
    showLoading: (state) => {
      state.loading = true;
    },
    hideLoading: (state) => {
      state.loading = false;
    },
  },
});

export const { showLoading, hideLoading } = alertsSlice.actions;