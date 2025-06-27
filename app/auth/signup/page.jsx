"use client";

import { fetchApi } from "@/utils/FetchApi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer", // default
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("formData", formData);
    try {
      const res = await fetchApi("/auth/register", "POST", {
        ...formData,
      });

      const result = await res;

      // console.log(result);

      if (res) {
        setMessage("Registration successful!");
        setFormData({ name: "", email: "", password: "", role: "customer" });
        router.push("/auth/signin");
      } else {
        setMessage(result.message || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <Link href="/" className="text-2xl font-extrabold text-blue-600">
          CourierX
        </Link>
        <h2 className="text-2xl font-bold mb-6">Register as Customer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded"
          />

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
            Register
          </button>

          {message && (
            <p className="text-center text-sm mt-2 text-gray-700">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
