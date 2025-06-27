"use client";
import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { fetchApi } from "@/utils/FetchApi";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issues with Leaflet + Webpack:
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const center = [23.8103, 90.4125]; // Dhaka

function LocationSelector({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

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
          <div>
            <h3 className="font-semibold mb-2 text-gray-700">
              📍 Select Pickup Location
            </h3>
            <MapContainer
              center={center}
              zoom={12}
              style={{ height: "300px", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <LocationSelector
                position={pickupPosition}
                setPosition={setPickupPosition}
              />
            </MapContainer>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-gray-700">
              📦 Select Delivery Location
            </h3>
            <MapContainer
              center={center}
              zoom={12}
              style={{ height: "300px", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <LocationSelector
                position={deliveryPosition}
                setPosition={setDeliveryPosition}
              />
            </MapContainer>
          </div>
        </div>
      </div>
    </form>
  );
}
