"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet marker icon
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function ParcelMap({ parcel }) {
  if (
    !parcel?.pickupLocation?.lat ||
    !parcel?.pickupLocation?.lng ||
    !parcel?.deliveryLocation?.lat ||
    !parcel?.deliveryLocation?.lng
  ) {
    return <p className="text-red-600">Location data is missing</p>;
  }

  const positions = [
    [parcel.pickupLocation.lat, parcel.pickupLocation.lng],
    ...(parcel.currentLocation?.lat
      ? [[parcel.currentLocation.lat, parcel.currentLocation.lng]]
      : []),
    [parcel.deliveryLocation.lat, parcel.deliveryLocation.lng],
  ];

  return (
    <MapContainer
      center={[
        parcel.currentLocation?.lat || parcel.deliveryLocation.lat,
        parcel.currentLocation?.lng || parcel.deliveryLocation.lng,
      ]}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: "200px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <Marker position={[parcel.pickupLocation.lat, parcel.pickupLocation.lng]}>
        <Popup>Pickup Location</Popup>
      </Marker>

      <Marker
        position={[parcel.deliveryLocation.lat, parcel.deliveryLocation.lng]}
      >
        <Popup>Delivery Location</Popup>
      </Marker>

      {parcel.currentLocation?.lat && parcel.currentLocation?.lng && (
        <Marker
          position={[parcel.currentLocation.lat, parcel.currentLocation.lng]}
        >
          <Popup>Current Location</Popup>
        </Marker>
      )}

      <Polyline
        positions={positions}
        pathOptions={{ color: "skyblue", weight: 5 }}
      />
    </MapContainer>
  );
}
