"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Menu,
  X,
  LogOut,
  Settings,
  LayoutDashboard,
  HistoryIcon,
  ThermometerSnowflake,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, setUser } from "@/redux/slice/authSlice";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      try {
        dispatch(setUser(JSON.parse(storedUser)));
      } catch (err) {
        console.error("Failed to parse userInfo");
      }
    }
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    dispatch(clearUser());
    setDropdownOpen(false);
    router.push("/auth/signin");
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">
          CourierX
        </Link>

        <div className="hidden md:flex items-center gap-6 font-bold text-blue-400">
          <Link className="hover:text-blue-600 duration-700" href="/">
            Home
          </Link>

          {!user?.name ? (
            <>
              <Link
                className="hover:text-blue-600 duration-700"
                href="/auth/signin"
              >
                Sign In
              </Link>
              <Link
                className="hover:text-blue-600 duration-700"
                href="/auth/signup"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-8 h-8 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center"
              >
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md py-2 z-50">
                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </Link>
                  <Link
                    href="/booking-history"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <HistoryIcon className="w-4 h-4 mr-2" /> My Bookings
                  </Link>
                  <Link
                    href="/agent-assigned"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <ThermometerSnowflake className="w-4 h-4 mr-2" /> My
                    Assigned
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" /> My Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-blue-600 font-bold"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden bg-white px-4 pb-4 pt-2"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col space-y-3 font-bold text-blue-400">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="hover:text-blue-600 duration-700"
              >
                Home
              </Link>
              {!user ? (
                <>
                  <Link
                    href="/auth/signin"
                    onClick={() => setIsOpen(false)}
                    className="hover:text-blue-600 duration-700"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="hover:text-blue-600 duration-700"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/settings"
                    onClick={() => setIsOpen(false)}
                    className="hover:text-blue-600 duration-700"
                  >
                    Settings
                  </Link>
                  <Link
                    href="/booking-history"
                    onClick={() => setIsOpen(false)}
                    className="hover:text-blue-600 duration-700"
                  >
                    History
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="text-left hover:text-red-600 duration-700"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
