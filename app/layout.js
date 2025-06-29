import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Navbar from "./components/Navbar";
import { Providers } from "@/redux/providers";
import SessionWatcher from "@/utils/SessionWatcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CourierX",
  description:
    "CourierX is a courier service application developed by CourierX Team",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <SessionWatcher />
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
