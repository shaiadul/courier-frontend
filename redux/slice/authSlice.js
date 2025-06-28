import { createSlice } from "@reduxjs/toolkit";

const getInitialState = () => {
  if (typeof window !== "undefined") {
    const storedCart = localStorage.getItem("userInfo");
    return storedCart ? JSON.parse(storedCart) : [];
  }
  return [];
};

const initialState = {
  user: getInitialState(),
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },
    clearUser(state) {
      state.user = {};
      localStorage.removeItem("userInfo");
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
