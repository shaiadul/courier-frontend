"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { fetchApi } from "@/utils/FetchApi";
import io from "socket.io-client";

const ParcelMap = dynamic(() => import("@/app/components/ParcelMap"), {
  ssr: false,
});

const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"
);

export default function AgentAssignedParcels() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationUpdating, setLocationUpdating] = useState(false);

  useEffect(() => {
    const fetchAssignedParcels = async () => {
      const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
      if (!user?.id) return alert("Agent not logged in");

      try {
        setLoading(true);
        const res = await fetchApi(`/parcels/agent/${user.id}`, "GET");
        setParcels(res || []);
      } catch (err) {
        console.error("Error fetching assigned parcels", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedParcels();
  }, []);

  const handleLocationUpdate = async (parcelId) => {
    if (!navigator.geolocation) return alert("Geolocation not supported");

    setLocationUpdating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;

        try {
          await fetchApi(`/parcels/${parcelId}/location`, "PUT", {
            lat,
            lng,
          });

          socket.emit("location-update", {
            parcelId,
            lat,
            lng,
          });

          alert("📍 Location updated successfully!");
        } catch (err) {
          console.error("Failed to update location", err);
          alert("❌ Failed to update location");
        } finally {
          setLocationUpdating(false);
        }
      },
      (error) => {
        console.error("Geolocation error", error);
        setLocationUpdating(false);
        alert("❌ Failed to get your current location");
      }
    );
  };

  const handleStatusUpdate = async (parcel, newStatus) => {
    try {
      const res = await fetchApi(`/parcels/${parcel._id}/status`, "PUT", {
        recipientName: parcel.recipientName,
        recipientEmail: parcel.recipientEmail,
        status: newStatus,
      });
      console.log("Status update response:", res);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-green-600 mb-6 text-center mt-20">
        🚚 Assigned Parcels
      </h1>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : parcels.length === 0 ? (
        <p className="text-center">No assigned parcels.</p>
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
                    <strong>To:</strong> {parcel.recipientName} ({parcel.recipientEmail})
                  </p>
                  <p>
                    <strong>Type:</strong> {parcel.parcelType}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className="text-blue-600 font-semibold">
                      {parcel.status}
                    </span>
                  </p>
                  <p>
                    <strong>Pickup:</strong> {parcel.pickupAddress}
                  </p>
                </div>
                <div className="mt-4">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Update Status
                  </label>
                  <div className="relative inline-block w-52">
                    <select
                      defaultValue={parcel.status}
                      onChange={(e) =>
                        handleStatusUpdate(parcel, e.target.value)
                      }
                      className="block w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-8 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Picked Up">🚚 Picked Up</option>
                      <option value="In Transit">📦 In Transit</option>
                      <option value="Delivered">✅ Delivered</option>
                      <option value="Failed">❌ Failed</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg
                        className="h-4 w-4 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M5.516 7.548a.75.75 0 0 1 1.06.056L10 11.44l3.424-3.836a.75.75 0 1 1 1.112 1.004l-4 4.5a.75.75 0 0 1-1.112 0l-4-4.5a.75.75 0 0 1 .056-1.06z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-right text-sm font-semibold">
                    📦 Tracking ID:{" "}
                    <span className="text-indigo-600">{parcel._id}</span>
                  </p>
                  <button
                    disabled={locationUpdating}
                    onClick={() => handleLocationUpdate(parcel._id)}
                    className="mt-2 px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    {locationUpdating ? "Updating..." : "Update My Location"}
                  </button>
                </div>
              </div>

              {parcel?.pickupLocation?.lat && parcel?.deliveryLocation?.lat ? (
                <ParcelMap parcel={parcel} />
              ) : (
                <p className="text-red-500">No map data</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
