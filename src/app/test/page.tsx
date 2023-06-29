"use client";

import { useState, useEffect } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  DirectionsService,
  DirectionsRenderer,
  DistanceMatrixService,
} from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
  getDetails,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";

import { useAppDispatch, useAppSelector } from "@/states/hooks";
import {
  fetchLocationPhotos,
  removeLocation,
  sortLocations,
  updateLocations,
} from "@/states/slices/searchSlice";
import { Providers } from "../providers";
import { usePosition } from "@/hooks/useGeoLocation";
import { Button, Dropdown, Modal } from "flowbite-react";
import readXlsxFile from "read-excel-file";
import { BsArrowDown, BsFillCarFrontFill } from "react-icons/bs";
import { BiWalk } from "react-icons/bi";
import { BsBicycle } from "react-icons/bs";
import {
  MdDirectionsTransitFilled,
  MdFileDownload,
  MdOpenInNew,
  MdSort,
} from "react-icons/md";
import {
  AiFillDelete,
  AiOutlineArrowDown,
  AiOutlineArrowUp,
  AiOutlineUpload,
} from "react-icons/ai";
import Map from "@/components/Locations/Map";

export default function Places() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACE_API ?? "",
    libraries: ["places"],
  });

  if (!isLoaded) return <div>Loading...</div>;
  return <Map />;
}
