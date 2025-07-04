"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchApi } from "@/utils/FetchApi";
import QRCode from "react-qr-code";
const ParcelMap = dynamic(() => import("@/app/components/ParcelMap"), {
  ssr: false,
});

import dynamic from "next/dynamic";

export default function ParcelTrackingPage() {
  const { id } = useParams();
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParcel = async () => {
      try {
        const data = await fetchApi(`/parcels/${id}`, "GET");
        setParcel(data);
      } catch (error) {
        console.error("Failed to fetch parcel", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchParcel();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  if (!parcel)
    return <p className="text-center mt-10 text-red-600">Parcel not found.</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        📦 Parcel Tracking
      </h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-4 border">
        <div className="space-y-1 text-gray-800">
          <p>
            <strong>Recipient:</strong> {parcel.recipientName} (
            {parcel.recipientEmail})
          </p>
          <p>
            <strong>Parcel Type:</strong> {parcel.parcelType}
          </p>
          <p>
            <strong>Payment Mode:</strong> {parcel.isCOD ? "COD" : "Prepaid"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="font-semibold text-blue-600">{parcel.status}</span>
          </p>
        </div>

        <div className="pt-6 text-center">
          <QRCode
            value={`${process.env.NEXT_PUBLIC_URL}/booking-history/${parcel._id}`}
            size={160}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            includeMargin
          />
          <p className="text-xs text-gray-500 mt-2">Scan to track</p>
        </div>
        {parcel?.pickupLocation?.lat != null &&
        parcel?.pickupLocation?.lng != null &&
        parcel?.deliveryLocation?.lat != null &&
        parcel?.deliveryLocation?.lng != null ? (
          <div className="mt-6">
            <ParcelMap parcel={parcel} />
          </div>
        ) : (
          <p className="text-red-600 text-center mt-4">
            Location data is missing
          </p>
        )}
      </div>
    </div>
  );
}
