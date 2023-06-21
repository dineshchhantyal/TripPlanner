"use client";

import { useState, useEffect } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
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
import { addPlace } from "@/states/slices/placesSlice";
import {
  Location,
  addLocation,
  fetchLocationPhotos,
  removeLocation,
} from "@/states/slices/searchSlice";
import { Providers } from "../providers";

export default function Places() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACE_API ?? "",
    libraries: ["places"],
  });

  if (!isLoaded) return <div>Loading...</div>;
  return <Map />;
}

function Map() {
  const [center, setCenter] = useState<{
    lat: number;
    lng: number;
  }>({ lat: 43.45, lng: -80.49 });
  const locations = useAppSelector((state) => state.searchLocation.places);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (locations && locations?.length > 0) {
      setCenter({
        lat: locations[locations.length - 1].lat,
        lng: locations[locations.length - 1].lng,
      });
    }
  }, [locations]);
  return (
    <>
      <Providers>
        <div className="places-container">
          <PlacesAutocomplete />
        </div>
        <GoogleMap
          zoom={10}
          center={center}
          mapContainerClassName="map-container"
        >
          {locations &&
            locations.map((s) => <Marker position={s}>K cha</Marker>)}
        </GoogleMap>
        <div id="locations-list" className="absolute z-[999] bottom-2 left-2 ">
          <ul>
            {locations &&
              locations.map((s) => (
                <li
                  key={s.place_id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer flex justify-between
                  px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-64 h-12 items-center overflow-hidden bg-gray-50 dark:bg-gray-800 rounded my-1 shadow
                  "
                >
                  <span
                    onClick={() => {
                      console.log(s);
                      setCenter({ lat: s.lat, lng: s.lng });
                    }}
                  >
                    {s.formatted_address}
                  </span>
                  <div>
                    <button
                      className="bg-red-500
                    hover:bg-red-600 text-white px-2 py-1 rounded mr-2 text-xs font-bold
                    "
                      onClick={() => {
                        dispatch(removeLocation({ place_id: s.place_id }));
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </Providers>
    </>
  );
}

const PlacesAutocomplete = ({}: {}) => {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();
  const dispatch = useAppDispatch();

  const handleSelect = async (address: string) => {
    setValue(address, false);
    clearSuggestions();

    const results = await getGeocode({ address });
    console.log(results[0]);
    const { lat, lng } = await getLatLng(results[0]);

    dispatch(
      fetchLocationPhotos({
        lat,
        lng,
        address_components: results[0].address_components,
        formatted_address: results[0].formatted_address,
        place_id: results[0].place_id,
        types: results[0].types,
      })
    );
  };

  return (
    <Combobox onSelect={handleSelect}>
      <ComboboxInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!ready}
        className="combobox-input rounded"
        placeholder="Search an address"
      />
      <ComboboxPopover>
        <ComboboxList>
          {status === "OK" &&
            data.map(({ place_id, description }) => (
              <ComboboxOption key={place_id} value={description} />
            ))}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
  );
};
