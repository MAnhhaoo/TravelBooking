import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice"; 
import hotelReducer from "./slices/hotelSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer, 
    hotels: hotelReducer,
  },
});