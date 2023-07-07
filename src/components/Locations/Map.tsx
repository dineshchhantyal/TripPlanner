import { useState, useEffect } from "react";
import { GoogleMap, DirectionsRenderer, Marker } from "@react-google-maps/api";

import "@reach/combobox/styles.css";

import { useAppDispatch, useAppSelector } from "@/states/hooks";
import {
  fetchLocationPhotos,
  updateEndPlace,
  updateStartPlace,
  updateWaypointsOrder,
} from "@/states/slices/searchSlice";
import { usePosition } from "@/hooks/useGeoLocation";
import { FaLocationArrow } from "react-icons/fa";
import { AiFillDelete, AiOutlineUpload } from "react-icons/ai";
import { Providers } from "@/app/providers";
import PlacesAutoComplete from "../SearchBar/PlaceAutoComplete";
import SideBar from "../Sidebar/MapSidebar";
import { Button, Modal } from "flowbite-react";
import readXlsxFile from "read-excel-file";
import { getGeocode, getLatLng } from "use-places-autocomplete";
import { updatePlaces } from "@/states/slices/placesSlice";
import { Head } from "next/document";

function Map() {
  const { error, ...location } = usePosition();
  const [center, setCenter] = useState<{
    lat: number;
    lng: number;
  }>({ lat: location.latitude, lng: location.longitude });
  const locations = useAppSelector((state) => state.searchLocation.places);
  const dispatch = useAppDispatch();
  const [direction, setDirection] =
    useState<google.maps.DirectionsResult | null>(null);
  const [openModal, setOpenModal] = useState<string | undefined>();
  const places = useAppSelector((state) => state.searchLocation);

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
    console.log("current location", location);
    if (location.latitude && location.longitude) {
    }
  }, [location]);
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
    if (locations && locations?.length > 1) {
      const origin = places.start
        ? locations.find((s) => s.place_id === places.start) ?? locations[0]
        : locations[0];

      const destination = places.end
        ? locations.find((s) => s.place_id === places.end) ?? locations[0]
        : locations[0];
      // const destination = locations[locations.length - 1];
      const directionsService = new google.maps.DirectionsService();
      console.log(
        "fill loc",
        locations
          .filter(
            (l) => l.place_id !== places?.end || l.place_id !== places.start
          )
          .map((l) => ({
            location: l,
            stopover: true,
          })) ?? []
      );
      directionsService.route(
        {
          origin,
          destination,
          waypoints:
            locations.length > 1
              ? locations
                  .filter(
                    (l) =>
                      l.place_id !== places?.end || l.place_id !== places.start
                  )
                  .map((l) => ({
                    location: l,
                    stopover: true,
                  })) ?? []
              : [],
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode[mode],
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            console.log(result);
            setDirection(result);
            console.log(result);
            if (locations.length >= 2) {
              dispatch(
                updateWaypointsOrder({
                  waypoints_order: result?.routes[0]?.waypoint_order ?? [],
                })
              );
            }
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
    if (fileLocations.length < 1) {
      return;
    }
    dispatch(
      updateStartPlace({
        place_id: fileLocations[0].place_id,
      })
    );
    dispatch(
      updateEndPlace({
        place_id: fileLocations[0].place_id,
      })
    );
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
      {/* <Head>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.6.5/flowbite.min.css"
          rel="stylesheet"
        />
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.6.5/flowbite.min.js"
          async
        ></script>
      </Head> */}
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
          <DirectionsRenderer
            directions={
              directionError.error ? undefined : direction ?? undefined
            }
            options={{
              markerOptions: {
                visible: true,
                animation: google.maps.Animation.DROP,
                anchorPoint: new google.maps.Point(0, -29),
                collisionBehavior:
                  google.maps.CollisionBehavior
                    .OPTIONAL_AND_HIDES_LOWER_PRIORITY,
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

          {locations && locations?.length === 1 && (
            <Marker
              position={{
                lat: locations[0].lat,
                lng: locations[0].lng,
              }}
              // icon={{
              //   url: "/icons/placeholder.svg",
              //   scaledSize: new google.maps.Size(30, 30),
              // }}
            />
          )}
        </GoogleMap>

        <SideBar
          direction={direction as google.maps.DirectionsResult}
          directionError={directionError}
          mode={mode}
          setMode={setMode}
          setCenter={setCenter}
        />

        <div
          className="absolute bottom-2 right-12 mr-4 mb-4 z-10
          bg-white dark:bg-gray-800  shadow-lg p-2 grid place-items-center hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-200 rounded-full cursor-pointer
        "
        >
          <button
            onClick={() => {
              setCenter({
                lat: location.latitude,
                lng: location.longitude,
              });
            }}
          >
            <FaLocationArrow size={18} />
          </button>
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
