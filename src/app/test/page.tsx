"use client";

import { useLoadScript } from "@react-google-maps/api";

import "@reach/combobox/styles.css";

import Map from "@/components/Locations/Map";

export default function Places() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACE_API ?? "",
    libraries: ["places"],
  });
  if (!isLoaded) return <div>Loading...</div>;
  return <Map />;
}
