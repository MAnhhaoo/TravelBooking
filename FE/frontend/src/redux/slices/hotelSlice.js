import { createSlice } from "@reduxjs/toolkit";

const hotelSlice = createSlice({
  name: "hotels",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    setHotels: (state, action) => {
      state.list = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setHotels, setLoading, setError } = hotelSlice.actions;
export default hotelSlice.reducer;
