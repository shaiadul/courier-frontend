"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
const MapSelector = dynamic(() => import("@/app/components/MapSelector"), {
  ssr: false,
});
import { fetchApi } from "@/utils/FetchApi";


export default function BookParcelPage() {
  const [form, setForm] = useState({
    recipientName: "",
    recipientEmail: "",
    pickupAddress: "",
    deliveryAddress: "",
    parcelType: "Small Box",
    isCOD: false,
  });

  const [pickupPosition, setPickupPosition] = useState(null);
  const [deliveryPosition, setDeliveryPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sender = JSON.parse(localStorage.getItem("userInfo"))?.id;
    if (!sender) return alert("User not logged in");

    if (!pickupPosition || !deliveryPosition) {
      return alert("Please select pickup and delivery locations on the map.");
    }

    const dataToSend = {
      ...form,
      pickupLat: pickupPosition.lat,
      pickupLng: pickupPosition.lng,
      deliveryLat: deliveryPosition.lat,
      deliveryLng: deliveryPosition.lng,
      sender,
    };

    console.log("Data to send:", dataToSend);

    try {
      setIsLoading(true);
      const res = await fetchApi("/parcels/book", "POST", dataToSend);

      if (res) {
        console.log("Parcel booked successfully:", res);
        setIsLoading(false);
        setForm({
          recipientName: "",
          recipientEmail: "",
          pickupAddress: "",
          deliveryAddress: "",
          parcelType: "Small Box",
          isCOD: false,
        });
        setPickupPosition(null);
        setDeliveryPosition(null);
      }
    } catch (err) {
      console.log("Failed to book parcel.", err);
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 max-w-6xl mx-auto bg-white space-y-6 pt-10 md:pt-30"
    >
      <h2 className="text-3xl font-bold text-blue-600 text-center mb-6">
        📦 Book a Parcel
      </h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side: form inputs */}
        <div className="md:w-1/2 grid grid-cols-1 gap-4">
          <input
            name="recipientName"
            value={form.recipientName}
            onChange={handleChange}
            placeholder="Recipient Name"
            className="border p-3 rounded w-full"
            required
          />
          <input
            name="recipientEmail"
            type="email"
            value={form.recipientEmail}
            onChange={handleChange}
            placeholder="Recipient Email"
            className="border p-3 rounded w-full"
            required
          />
          <input
            name="pickupAddress"
            value={form.pickupAddress}
            onChange={handleChange}
            placeholder="Pickup Address"
            className="border p-3 rounded w-full"
            required
          />
          <input
            name="deliveryAddress"
            value={form.deliveryAddress}
            onChange={handleChange}
            placeholder="Delivery Address"
            className="border p-3 rounded w-full"
            required
          />
          <select
            name="parcelType"
            value={form.parcelType}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          >
            <option>Small Box</option>
            <option>Medium Box</option>
            <option>Large Box</option>
            <option>Envelope</option>
          </select>

          <label className="flex items-center gap-3 font-medium">
            <input
              type="checkbox"
              name="isCOD"
              checked={form.isCOD}
              onChange={handleChange}
              className="accent-blue-600 w-5 h-5"
            />
            Cash on Delivery
          </label>

          <button
            type="submit"
            className="mt-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded text-lg font-semibold hover:shadow-lg transition"
          >
            {isLoading ? "🚚 Booking..." : "🚚 Book Parcel"}
          </button>
        </div>
        {/* Right side: Maps */}
        <div className="md:w-1/2 flex flex-col gap-6">
          <MapSelector
            title="📍 Select Pickup Location"
            position={pickupPosition}
            setPosition={setPickupPosition}
          />
          <MapSelector
            title="📦 Select Delivery Location"
            position={deliveryPosition}
            setPosition={setDeliveryPosition}
          />
        </div>
      </div>
    </form>
  );
}
