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
  updateLocations,
} from "@/states/slices/searchSlice";
import { Providers } from "../providers";
import { usePosition } from "@/hooks/useGeoLocation";
import { Button, Dropdown, Modal } from "flowbite-react";
import readXlsxFile from "read-excel-file";
import { BsFillCarFrontFill } from "react-icons/bs";
import { BiWalk } from "react-icons/bi";
import { BsBicycle } from "react-icons/bs";
import { MdDirectionsTransitFilled, MdSort } from "react-icons/md";
import { AiOutlineUpload } from "react-icons/ai";

export default function Places() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACE_API ?? "",
    libraries: ["places"],
  });

  if (!isLoaded) return <div>Loading...</div>;
  return <Map />;
}

function Map() {
  const { error, ...location } = usePosition();
  const [center, setCenter] = useState<{
    lat: number;
    lng: number;
  }>({ lat: location.latitude, lng: location.longitude });
  const locations = useAppSelector((state) => state.searchLocation.places);
  const dispatch = useAppDispatch();
  const [openModal, setOpenModal] = useState<string | undefined>();
  const [direction, setDirection] = useState<any>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileLocations, setFileLocations] = useState<
    {
      lat: number;
      lng: number;
      formatted_address: string;
      place_id: string;
      types: string[];
    }[]
  >([]);
  const [mode, setMode] = useState<
    "DRIVING" | "WALKING" | "BICYCLING" | "BICYCLING" | "TRANSIT"
  >("DRIVING");
  const [directionError, setDirectionError] = useState<{
    message: string;
    error: boolean;
  }>({
    message: "",
    error: false,
  });

  const [fileLoadingError, setFileLoadingError] = useState<{
    message: string;
    error: boolean;
  }>({
    message: "",
    error: false,
  });

  useEffect(() => {
    if (locations && locations?.length > 0) {
      setCenter({
        lat: locations[locations.length - 1].lat,
        lng: locations[locations.length - 1].lng,
      });
    }
  }, [locations]);

  useEffect(() => {
    setDirectionError({
      message: "",
      error: false,
    });
    if (locations && locations?.length >= 2) {
      const origin = locations[0];

      const destination = locations[locations.length - 1];
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin,
          destination,
          waypoints:
            locations.slice(1, locations.length - 1).map((s) => ({
              location: s,
            })) ?? undefined,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode[mode],
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirection(result);
          } else {
            setDirectionError({
              message: "Unable to find directions.",
              error: true,
            });
          }
        }
      );
    }
  }, [locations, mode]);

  const handleRearrange = () => {
    const temp = [...locations];
    dispatch(
      updateLocations({
        places: temp.sort(function (a, b) {
          return 0.5 - Math.random();
        }),
      })
    );
  };

  const handleFileChange = async (e: any) => {
    setFileLocations([]);
    setFileLoadingError({
      message: "",
      error: false,
    });
    setFileLoading(true);
    const file = e.target.files[0];
    readXlsxFile(file).then(async (rows) => {
      for (let i = 0; i < rows.length; i++) {
        const place = rows[i][0] as string;
        if (place) {
          let address = place;
          try {
            const results = await getGeocode({
              address,
            });

            const { lat, lng } = await getLatLng(results[0]);

            setFileLocations((s: any) => [
              ...(s ?? []),
              {
                lat,
                lng,
                formatted_address: results[0].formatted_address,
                place_id: results[0].place_id,
                types: results[0].types,
              },
            ]);
          } catch (error) {
            console.log("error", error);
            setFileLoadingError({
              message:
                "Something went wrong while reading file result might be incomplete!",
              error: true,
            });
          }
        }
      }
    });
    setFileLoading(false);
  };

  const handleImportLocations = () => {
    for (let i = 0; i < fileLocations.length; i++) {
      const place = fileLocations[i];
      dispatch(
        fetchLocationPhotos({
          formatted_address: place.formatted_address,
          place_id: place.place_id,
          lat: place.lat,
          lng: place.lng,
          address_components: [],
          types: place.types,
          photos: [],
        })
      );
    }
    setFileLocations([]);
  };

  return (
    <>
      <head>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.6.5/flowbite.min.css"
          rel="stylesheet"
        />
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.6.5/flowbite.min.js"
          async
        ></script>
      </head>
      <Providers>
        <div className="places-container flex gap-2">
          <PlacesAutocomplete />
          {/* <SideBar /> */}
          <button
            className="
            flex gap-2 items-center justify-center bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition-all duration-200 ease-in-out cursor-pointer shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white
            "
            onClick={() => {
              handleImportLocations();
              setOpenModal(() => "default");
            }}
          >
            <p>Import</p>
            <AiOutlineUpload />
          </button>
        </div>
        <GoogleMap
          zoom={10}
          center={center}
          mapContainerClassName="map-container"
          options={{
            disableDefaultUI: true,
            zoomControl: true,
          }}
          onDblClick={async (e) => {
            e.stop();

            const lat = e.latLng?.lat();
            const lng = e.latLng?.lng();

            const res = await fetch(
              `https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}`
            );

            const data = await res.json();

            if (lat && lng) {
              dispatch(
                fetchLocationPhotos({
                  place_id: data.place_id,
                  formatted_address: data.display_name,
                  types: [],
                  lat,
                  lng,
                  address_components: [data.address],
                })
              );
            }
          }}
        >
          {locations &&
            locations.map((s) => (
              <Marker position={s} key={s.place_id}>
                K cha
              </Marker>
            ))}
          <DirectionsRenderer
            directions={direction}
            options={{
              markerOptions: {
                visible: true,
                animation: google.maps.Animation.DROP,
                title: "Hello",
              },
              polylineOptions: {
                strokeColor: "#000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
              },
            }}
          />
        </GoogleMap>
        <div id="locations-list" className="absolute z-[999] bottom-2 left-2 ">
          <ModeOfTransport
            mode={mode}
            setMode={setMode}
            directionError={directionError}
          />

          <ul>
            {locations &&
              locations.map((s, i) => (
                <>
                  <li
                    key={s.place_id}
                    className="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer flex justify-between
                  px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-64 h-12 items-center overflow-hidden bg-gray-50 dark:bg-gray-800 rounded my-1 shadow
                  "
                  >
                    <span
                      onClick={() => {
                        setCenter({ lat: s.lat, lng: s.lng });
                      }}
                    >
                      {s.formatted_address.length > 30
                        ? s.formatted_address.slice(0, 30) + "..."
                        : s.formatted_address}
                    </span>
                    <div className="flex">
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
                      <button
                        className="
                    cursor-move text-gray-400 hover:text-gray-600 dark:text-gray-200 dark:hover:text-gray-400 focus:outline-none focus:text-gray-600 dark:focus:text-gray-400 transition duration-150 ease-in-out
                    "
                      >
                        {/* drag icon*/}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          className="w-6 h-6 "
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3.75 9h16.5m-16.5 6.75h16.5"
                          />
                        </svg>
                      </button>
                    </div>
                  </li>
                  {direction &&
                    direction?.routes.length > 0 &&
                    direction.routes[0].legs &&
                    direction.routes[0].legs[i] && (
                      <li>
                        <div className="flex justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-64 h-12 items-center overflow-hidden bg-gray-50 border-t-2 dark:bg-gray-800 border-gray-500 rounded my-1 shadow border-dotted">
                          <span>
                            {direction.routes[0].legs[i]?.distance.text}
                          </span>
                          <span>
                            {direction.routes[0].legs[i]?.duration.text}
                          </span>
                        </div>
                      </li>
                    )}
                </>
              ))}
          </ul>

          <button
            className={`
          flex gap-2 items-center justify-center bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition-all duration-200 ease-in-out cursor-pointer shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${
            directionError.error ||
            directionError.message === "Please add at least 2 locations" ||
            locations.length < 2
              ? "opacity-50 cursor-not-allowed"
              : ""
          }
          `}
            onClick={handleRearrange}
            disabled={
              directionError.error ||
              directionError.message === "Please add at least 2 locations" ||
              locations.length < 2
            }
          >
            <MdSort size={24} fill="current" />
            Rearrange
          </button>
          <p className="text-xs text-gray-700 mb-7">
            Sort places by minial distance travelled
          </p>
        </div>
        <Modal
          show={openModal === "default"}
          onClose={() => setOpenModal(undefined)}
        >
          <Modal.Header>Import Trip Plan</Modal.Header>
          <Modal.Body>
            {fileLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {/* loading icon */}
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>{" "}
                Loading...
              </div>
            ) : (
              <div className="space-y-4">
                {fileLocations.length === 0 ? (
                  <>
                    <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                      {/* import trip using excel file */}
                      Upload a file to import your trip plan.
                    </p>
                    <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                      {/* import trip using excel file */}
                      Currently only excel(.xlsx, .xls) file is supported.
                    </p>
                  </>
                ) : (
                  fileLocations &&
                  fileLocations.length > 0 &&
                  fileLocations.map((s, i) => (
                    <>
                      <li
                        key={s.place_id}
                        className="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer flex justify-between
                  px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-64 h-12 items-center overflow-hidden bg-gray-50 dark:bg-gray-800 rounded my-1 shadow
                  "
                      >
                        {s.formatted_address.length > 30
                          ? s.formatted_address.slice(0, 30) + "..."
                          : s.formatted_address}
                        <div className="flex">
                          <button
                            className="bg-red-500
                    hover:bg-red-600 text-white px-2 py-1 rounded mr-2 text-xs font-bold
                    "
                            onClick={() => {
                              setFileLocations(
                                fileLocations.filter((_, index) => index !== i)
                              );
                            }}
                          >
                            Delete
                          </button>
                          <button
                            className="
                    cursor-move text-gray-400 hover:text-gray-600 dark:text-gray-200 dark:hover:text-gray-400 focus:outline-none focus:text-gray-600 dark:focus:text-gray-400 transition duration-150 ease-in-out"
                          >
                            {/* drag icon*/}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke-width="1.5"
                              stroke="currentColor"
                              className="w-6 h-6 "
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M3.75 9h16.5m-16.5 6.75h16.5"
                              />
                            </svg>
                          </button>
                        </div>
                      </li>
                    </>
                  ))
                )}
                <div className="flex items-center justify-center">
                  <label className="flex flex-col border-4 border-dashed w-full h-32 hover:bg-gray-100 hover:border-blue-300 group">
                    <div className="flex flex-col items-center justify-center pt-7">
                      {fileLoadingError.error && (
                        <p className="text-red-500 text-xs italic">
                          {fileLoadingError.message}
                        </p>
                      )}
                      <svg
                        className="w-10 h-10 text-blue-400 group-hover:text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* upload icon */}
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        ></path>
                      </svg>
                      <p className="lowercase text-sm text-gray-400 group-hover:text-blue-600 pt-1 tracking-wider">
                        Select a file
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".xlsx, .xls"
                    />
                  </label>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() => {
                handleImportLocations();
                setOpenModal(undefined);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded mr-2 text-xs font-bold"
            >
              Import
            </Button>
            <Button
              color="gray"
              onClick={() => {
                setFileLocations([]);
                setOpenModal(undefined);
              }}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </Providers>
    </>
  );
}

const ModeOfTransport = ({
  mode,
  setMode,
  directionError,
}: {
  mode: string;
  setMode: React.Dispatch<
    React.SetStateAction<"DRIVING" | "WALKING" | "BICYCLING" | "TRANSIT">
  >;
  directionError: { error: boolean; message: string };
}) => (
  <div className="relative w-full">
    <div className="w-full justify-between bg-white border rounded flex transition-all">
      {directionError.error && (
        <div className="absolute -top-4 right-0 -mt-2 -mr-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
          {directionError.message}
        </div>
      )}
      <div
        className={`p-4 cursor-pointer hover:bg-slate-600 transition-all rounded hover:text-white ${
          mode === "DRIVING"
            ? "bg-slate-800 text-white"
            : "border-r border-gray-100"
        }`}
        onClick={() => setMode("DRIVING")}
      >
        <BsFillCarFrontFill size={24} />
      </div>
      <div
        className={`p-4 cursor-pointer hover:bg-slate-600 transition-all rounded hover:text-white  ${
          mode === "WALKING"
            ? "bg-slate-800 text-white"
            : "border-r border-gray-100"
        }`}
        onClick={() => setMode("WALKING")}
      >
        <BiWalk size={24} />
      </div>
      <div
        className={`p-4 cursor-pointer hover:bg-slate-600 transition-all rounded hover:text-white  ${
          mode === "BICYCLING"
            ? "bg-slate-800 text-white"
            : "border-r border-gray-100"
        }`}
        onClick={() => setMode("BICYCLING")}
      >
        <BsBicycle size={24} />
      </div>
      <div
        className={`p-4 cursor-pointer hover:bg-slate-600 transition-all rounded hover:text-white ${
          mode === "TRANSIT"
            ? "bg-slate-800 text-white"
            : "border-r border-gray-100"
        }`}
        onClick={() => setMode("TRANSIT")}
      >
        <MdDirectionsTransitFilled size={24} />
      </div>
    </div>

    {/* <select
      className="peer h-full w-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 empty:!bg-red-500 focus:border-2 focus:border-pink-500 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
      onChange={(e) => setMode(e.target.value as any)}
    >
      <option value="DRIVING">Driving</option>
      <option value="WALKING">Walking</option>
      <option value="BICYCLING">Cycling</option>
      <option value="TRANSIT">Transit</option>
    </select> */}
    <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-blue-gray-400 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-pink-500 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-pink-500 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-pink-500 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
      Select a mode
    </label>
  </div>
);
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

const SideBar = () => {
  return (
    <>
      <div className="text-center">
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          type="button"
          data-drawer-target="drawer-navigation"
          data-drawer-show="drawer-navigation"
          aria-controls="drawer-navigation"
        >
          Show navigation
        </button>
      </div>

      <div
        id="drawer-navigation"
        className="fixed top-0 left-0 z-40 h-screen p-4 overflow-y-auto transition-transform -translate-x-full bg-white w-80 dark:bg-gray-800"
        tabIndex={-1}
        aria-labelledby="drawer-navigation-label"
      >
        <h5
          id="drawer-navigation-label"
          className="text-base font-semibold text-gray-500 uppercase dark:text-gray-400"
        >
          Menu
        </h5>
        <button
          type="button"
          data-drawer-hide="drawer-navigation"
          aria-controls="drawer-navigation"
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 absolute top-2.5 right-2.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg
            aria-hidden="true"
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <span className="sr-only">Close menu</span>
        </button>
        <div className="py-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  aria-hidden="true"
                  className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                </svg>
                <span className="ml-3">Dashboard</span>
              </a>
            </li>
            <li>
              <button
                type="button"
                className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                aria-controls="dropdown-example"
                data-collapse-toggle="dropdown-example"
              >
                <svg
                  aria-hidden="true"
                  className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span className="flex-1 ml-3 text-left whitespace-nowrap">
                  E-commerce
                </span>
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>
              <ul id="dropdown-example" className="hidden py-2 space-y-2">
                <li>
                  <a
                    href="#"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Products
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Billing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Invoice
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  aria-hidden="true"
                  className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
                <span className="flex-1 ml-3 whitespace-nowrap">Kanban</span>
                <span className="inline-flex items-center justify-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">
                  Pro
                </span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  aria-hidden="true"
                  className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z"></path>
                  <path d="M3 5a2 2 0 012-2h1a1 1 0 010 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 110-2h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"></path>
                </svg>
                <span className="flex-1 ml-3 whitespace-nowrap">Inbox</span>
                <span className="inline-flex items-center justify-center w-3 h-3 p-3 ml-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                  3
                </span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  aria-hidden="true"
                  className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span className="flex-1 ml-3 whitespace-nowrap">Users</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  aria-hidden="true"
                  className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span className="flex-1 ml-3 whitespace-nowrap">Products</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  aria-hidden="true"
                  className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span className="flex-1 ml-3 whitespace-nowrap">Sign In</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  aria-hidden="true"
                  className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span className="flex-1 ml-3 whitespace-nowrap">Sign Up</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};
