import { createSlice } from "@reduxjs/toolkit";

// const getInitialState = () => {
//   if (typeof window !== "undefined") {
//     const storedCart = localStorage.getItem("userInfo");
//     return storedCart ? JSON.parse(storedCart) : [];
//   }
//   return [];
// };

const getInitialState = () => {
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.expiry && Date.now() > parsedUser.expiry) {
        localStorage.removeItem("userInfo"); // auto-logout
        return {};
      }
      return parsedUser;
    }
  }
  return {};
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
    // setUser(state, action) {
    //   state.user = action.payload;
    //   localStorage.setItem("userInfo", JSON.stringify(action.payload));
    // },
    setUser(state, action) {
      const expiryTime = Date.now() + 60 * 60 * 1000; // 1 hour from now
      const userData = {
        ...action.payload,
        expiry: expiryTime,
      };
      state.user = userData;
      localStorage.setItem("userInfo", JSON.stringify(userData));
    },

    clearUser(state) {
      state.user = {};
      localStorage.removeItem("userInfo");
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
