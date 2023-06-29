import { useState, useEffect } from "react";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";

import "@reach/combobox/styles.css";

import { useAppDispatch, useAppSelector } from "@/states/hooks";
import { fetchLocationPhotos } from "@/states/slices/searchSlice";
import { usePosition } from "@/hooks/useGeoLocation";

import { AiFillDelete, AiOutlineUpload } from "react-icons/ai";
import { Providers } from "@/app/providers";
import PlacesAutoComplete from "../SearchBar/PlaceAutoComplete";
import SideBar from "../Sidebar/MapSidebar";
import { Button, Modal } from "flowbite-react";
import readXlsxFile from "read-excel-file";
import { getGeocode, getLatLng } from "use-places-autocomplete";

function Map() {
  const { error, ...location } = usePosition();
  const [center, setCenter] = useState<{
    lat: number;
    lng: number;
  }>({ lat: location.latitude, lng: location.longitude });
  const locations = useAppSelector((state) => state.searchLocation.places);
  const dispatch = useAppDispatch();
  const [direction, setDirection] = useState<any>(null);
  const [openModal, setOpenModal] = useState<string | undefined>();
  const [waypointsOrder, setWaypointsOrder] = useState<number[]>([]);
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
    setDirection(null);
    if (locations && locations?.length >= 2) {
      const origin = locations[0];
      console.log(locations);
      const destination = origin;
      // const destination = locations[locations.length - 1];
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin,
          destination,
          waypoints:
            locations.slice(1).map((s) => ({
              location: s,
            })) ?? undefined,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode[mode],
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirection(result);

            setWaypointsOrder(result?.routes[0]?.waypoint_order ?? []);
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
          <PlacesAutoComplete />
          {/* <SideBar /> */}
          <button
            className="
            flex gap-2 items-center justify-center bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition-all duration-200 ease-in-out cursor-pointer shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white
            "
            onClick={() => {
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
            keyboardShortcuts: true,
            tilt: 45,
            mapTypeControl: true,
            noClear: false,
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
          {/* {locations &&
            locations.map((place) => (
              <Marker
                position={place}
                key={place.place_id}
                title={place.formatted_address}
              >
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold">
                    {place.formatted_address}
                  </p>
                  <p className="text-xs">{place.types.join(", ")}</p>
                </div>
              </Marker>
            ))} */}
          {locations.at(0) && (
            <Marker
              position={locations[0]}
              key={locations[0].place_id}
              title={locations[0].formatted_address}
            >
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold">
                  {locations[0].formatted_address}
                </p>
                <p className="text-xs">{locations[0].types.join(", ")}</p>
              </div>
            </Marker>
          )}

          {waypointsOrder.length > 0 &&
            waypointsOrder.map((waypoint: number) => (
              <Marker
                position={locations[waypoint + 1]}
                key={locations[waypoint + 1].place_id}
                title={locations[waypoint + 1].formatted_address}
              >
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold">
                    {locations[waypoint + 1].formatted_address}
                  </p>
                  <p className="text-xs">
                    {locations[waypoint + 1].types.join(", ")}
                  </p>
                </div>
              </Marker>
            ))}

          <DirectionsRenderer
            directions={directionError.error ? undefined : direction}
            options={{
              markerOptions: {
                visible: true,
                animation: google.maps.Animation.DROP,
              },
              polylineOptions: {
                strokeColor: "#000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
              },
            }}
            // show distance and duration
            panel={document.getElementById("panel") as HTMLElement}
          />
        </GoogleMap>

        <SideBar
          direction={direction}
          directionError={directionError}
          mode={mode}
          setMode={setMode}
          setCenter={setCenter}
          waypointsOrder={waypointsOrder}
          key={waypointsOrder.join("")}
        />

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
                    strokeWidth="4"
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
                  px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-72 h-12 items-center overflow-hidden bg-gray-50 dark:bg-gray-800 rounded my-1 shadow
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
                            <AiFillDelete />
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
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="w-6 h-6 "
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
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
                    <div className="flex flex-col items-center justify-center pt-7  cursor-pointer">
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

export default Map;
