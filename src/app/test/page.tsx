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
import { useAppDispatch } from "@/states/hooks";
import { addPlace } from "@/states/slices/placesSlice";
import { addLocation, fetchLocationPhotos } from "@/states/slices/searchSlice";
import ts from "typescript";
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
  const [selected, setSelected] = useState<
    | {
        lat: number;
        lng: number;
      }[]
    | null
  >([]);

  useEffect(() => {
    if (selected && selected?.length > 0) {
      setCenter({
        lat: selected[selected.length - 1].lat,
        lng: selected[selected.length - 1].lng,
      });
    }
  }, [selected]);
  return (
    <>
      <Providers>
        <div className="places-container">
          <PlacesAutocomplete setSelected={setSelected} />
        </div>
        <GoogleMap
          zoom={10}
          center={center}
          mapContainerClassName="map-container"
        >
          {selected && selected.map((s) => <Marker position={s}>K cha</Marker>)}
        </GoogleMap>
      </Providers>
    </>
  );
}

const PlacesAutocomplete = ({
  setSelected,
}: {
  setSelected: (selected: any) => void;
}) => {
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
    setSelected((prev: any) => [...prev, { lat, lng }]);
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
