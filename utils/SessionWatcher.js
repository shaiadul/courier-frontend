"use client";
import { clearUser } from "@/redux/slice/authSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";


export default function SessionWatcher() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user?.expiry) {
      const remaining = user.expiry - Date.now();
      if (remaining > 0) {
        const timeout = setTimeout(() => {
          dispatch(clearUser());
          alert("Session expired. Please login again.");
        }, remaining);
        return () => clearTimeout(timeout);
      } else {
        dispatch(clearUser());
      }
    }
  }, [user]);

  return null;
}
