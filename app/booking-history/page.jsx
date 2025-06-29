"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const ParcelMap = dynamic(() => import("@/app/components/ParcelMap"), {
  ssr: false,
});
import { fetchApi } from "@/utils/FetchApi";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";

export default function UserBookingHistory() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchParcels = async () => {
      const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
      if (!user?.id) return alert("User not logged in");

      try {
        setLoading(true);
        console.log("user id", user.id);
        const res = await fetchApi(`/parcels/sender/${user.id}`, "GET");
        if (res) {
          console.log("parcels res", res);
          setParcels(res);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching parcels", err);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchParcels();
  }, []);

  const handleDownloadQRCode = async (id) => {
    const qrElement = document.getElementById(`qr-${id}`);
    if (!qrElement) return;

    const canvas = await html2canvas(qrElement);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `qr-code-${id}.png`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center mt-20">
        📋 My Bookings Parcel
      </h1>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : parcels.length === 0 ? (
        <p className="text-center">No parcels found.</p>
      ) : (
        <div className="grid gap-6">
          {parcels.map((parcel) => (
            <div
              key={parcel._id}
              className="bg-white rounded-lg shadow-md p-4 space-y-4 border border-gray-200"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                {/* Parcel Info */}
                <div className="flex-1 space-y-1">
                  <p>
                    <strong>To:</strong> {parcel.recipientName} (
                    {parcel.recipientEmail})
                  </p>
                  <p>
                    <strong>Parcel Type:</strong> {parcel.parcelType}
                  </p>
                  <p>
                    <strong>COD:</strong> {parcel.isCOD ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className="text-blue-600 font-semibold">
                      {parcel.status || "Pending"}
                    </span>
                  </p>
                </div>

                {/* QR Code + Tracking */}
                <div className="flex flex-col items-center md:items-end">
                  <div
                    className="bg-white p-2 rounded-lg shadow-sm mb-2"
                    id={`qr-${parcel._id}`}
                  >
                    <QRCode
                      value={`https://yourdomain.com/track/${parcel._id}`}
                      size={100}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <button
                    onClick={() => handleDownloadQRCode(parcel._id)}
                    className="text-sm text-white bg-teal-600 px-4 py-1.5 rounded hover:bg-teal-700 transition-colors duration-200"
                  >
                    ⬇️ Download QR
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    Parcel ID:{" "}
                    <span className="font-mono text-teal-700">
                      {parcel._id}
                    </span>
                  </p>
                </div>
              </div>

              {parcel?.pickupLocation?.lat != null &&
              parcel?.pickupLocation?.lng != null &&
              parcel?.deliveryLocation?.lat != null &&
              parcel?.deliveryLocation?.lng != null ? (
                <ParcelMap parcel={parcel} />
              ) : (
                <p className="text-red-600">Location data is missing</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
