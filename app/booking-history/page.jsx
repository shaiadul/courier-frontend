"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const ParcelMap = dynamic(() => import("@/app/components/ParcelMap"), {
  ssr: false,
})
import { fetchApi } from "@/utils/FetchApi";

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

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center mt-20">
        📋 My Parcel Bookings
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
              className="bg-white rounded shadow p-4 space-y-2 border border-gray-200"
            >
              <div className="flex justify-between items-center">
                <div>
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
                <div>
                  <p className="text-right text-xl font-bold">
                    <strong>Tracking Id:</strong>{" "}
                    <strong className="text-teal-600">{parcel._id}</strong>
                  </p>
                </div>
              </div>

              {/* Map preview */}
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
