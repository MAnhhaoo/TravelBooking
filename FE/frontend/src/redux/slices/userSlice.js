import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
  },
  reducers: {
    setUsers: (state, action) => {
      state.list = action.payload; // Nạp dữ liệu vào kho lưu trữ Redux
    },
  },
});

export const { setUsers } = userSlice.actions;
export default userSlice.reducer;