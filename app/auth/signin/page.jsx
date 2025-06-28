"use client";

import { useState } from "react";
import { fetchApi } from "@/utils/FetchApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setUser } from "@/redux/slice/authSlice";
import { useDispatch } from "react-redux";

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetchApi("/auth/login", "POST", formData);

      console.log("Login response:", res);

      if (res?.access_token && res?.user) {
        localStorage.setItem("accessToken", res.access_token);
        dispatch(setUser(res.user));
        setMessage("Login successful!");
        router.push("/");
      } else {
        setMessage(res.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Something went wrong.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <Link href="/" className="text-2xl font-extrabold text-blue-600">
          CourierX
        </Link>
        <h2 className="text-2xl font-bold mb-6">Sign In</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border px-4 py-2 rounded"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-sm text-blue-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Sign In
          </button>

          {message && (
            <p className="text-center text-sm mt-2 text-gray-700">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
