import "@reach/combobox/styles.css";

import { useAppDispatch, useAppSelector } from "@/states/hooks";
import {
  randomSort,
  removeLocation,
  removeWaypoint,
  updateEndPlace,
  updateLocations,
  updateStartPlace,
  updateWaypointsOrder,
} from "@/states/slices/searchSlice";

import { BsArrowDown } from "react-icons/bs";
import { MdFileDownload, MdSort } from "react-icons/md";
import { AiFillDelete } from "react-icons/ai";
import ModeOfTransport from "./ModeOfTransport";

const SideBar = ({
  mode,
  setMode,
  directionError,
  setCenter,
  direction,
}: {
  mode: string;
  setMode: React.Dispatch<
    React.SetStateAction<"DRIVING" | "WALKING" | "BICYCLING" | "TRANSIT">
  >;
  directionError: { error: boolean; message: string };
  setCenter: React.Dispatch<
    React.SetStateAction<{
      lat: number;
      lng: number;
    }>
  >;
  direction: google.maps.DirectionsResult | undefined;
}) => {
  const locations = useAppSelector((state) => state.searchLocation.places);
  const waypoints = useAppSelector(
    (state) => state.searchLocation.waypoints_order
  );
  const dispatch = useAppDispatch();

  const handleRearrange = () => {
    // const temp = [...locations];
    // dispatch(
    //   updateLocations({
    //     places: temp.sort(function (a, b) {
    //       return 0.5 - Math.random();
    //     }),
    //   })
    // );
    dispatch(randomSort());
  };

  const handleDownload = () => {};
  return (
    <>
      <div id="locations-list" className="absolute z-[999] bottom-2 left-2 ">
        <ModeOfTransport
          mode={mode}
          setMode={setMode}
          directionError={directionError}
        />

        <ul className="max-h-96 overflow-y-scroll">
          {/* if waypointsOrder is empty then print all continuously else print based on first point followed by waypointOrder */}
          {waypoints?.length === 0 ? (
            locations.map((location, index) => (
              <li key={location.place_id}>
                <div
                  className="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer flex justify-between
                  px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-72 h-12 items-center overflow-hidden bg-gray-50 dark:bg-gray-800 rounded my-1 shadow
                  "
                  onClick={() => {
                    setCenter({ lat: location.lat, lng: location.lng });
                  }}
                >
                  <span>
                    {location.formatted_address.length > 30
                      ? location.formatted_address.slice(0, 30) + "..."
                      : location.formatted_address}
                  </span>
                  <div className="flex">
                    <button
                      className="bg-red-500
                    hover:bg-red-600 text-white px-2 py-1 rounded mr-2 text-xs font-bold
                    "
                      onClick={() => {
                        dispatch(
                          removeLocation({ place_id: location.place_id })
                        );
                      }}
                    >
                      <AiFillDelete />
                    </button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <>
              <li
                key={locations[0].place_id}
                className="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer flex justify-between
                  px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-72 h-12 items-center overflow-hidden bg-gray-50 dark:bg-gray-800 rounded my-1 shadow
                  "
              >
                <span
                  onClick={() => {
                    setCenter({ lat: locations[0].lat, lng: locations[0].lng });
                  }}
                >
                  {locations[0].formatted_address.length > 30
                    ? locations[0].formatted_address.slice(0, 30) + "..."
                    : locations[0].formatted_address}
                </span>
                <div className="flex">
                  <button
                    className="bg-red-500
                    hover:bg-red-600 text-white px-2 py-1 rounded mr-2 text-xs font-bold
                    "
                    onClick={() => {
                      dispatch(
                        removeLocation({ place_id: locations[0].place_id })
                      );
                    }}
                  >
                    <AiFillDelete />
                  </button>
                </div>
              </li>
              {direction &&
                direction.routes.at(0) &&
                direction?.routes.at(0)?.legs.at(0) && (
                  <li>
                    <div className="flex justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-72 h-12 items-center overflow-hidden bg-slate-50 rounded my-1 shadow border-dotted">
                      <span>
                        {direction.routes[0]?.legs[0]?.distance?.text}
                      </span>
                      <span
                        className="
                          text-green-500 dark:text-green-400 transition duration-150 ease-in-out hover:text-green-600 dark:hover:text-green-500 cursor-pointer
                          "
                      >
                        <BsArrowDown size={21} />
                      </span>
                      <span>
                        {direction.routes[0]?.legs[0]?.duration?.text}
                      </span>
                    </div>
                  </li>
                )}

              {waypoints?.map((s, i) => (
                <>
                  <li
                    key={locations[s + 1].place_id}
                    className="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer flex justify-between
                  px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-72 h-12 items-center overflow-hidden bg-gray-50 dark:bg-gray-800 rounded my-1 shadow
                  "
                  >
                    <span
                      onClick={() => {
                        setCenter({
                          lat: locations[s + 1].lat,
                          lng: locations[s + 1].lng,
                        });
                      }}
                    >
                      {locations[s + 1].formatted_address.length > 30
                        ? locations[s + 1].formatted_address.slice(0, 30) +
                          "..."
                        : locations[s + 1].formatted_address}
                    </span>
                    <div className="flex">
                      <button
                        className="bg-red-500
                    hover:bg-red-600 text-white px-2 py-1 rounded mr-2 text-xs font-bold
                    "
                        onClick={() => {
                          dispatch(
                            removeLocation({
                              place_id: locations[s + 1].place_id,
                            })
                          );
                          dispatch(
                            updateWaypointsOrder({ waypoints_order: [] })
                          );
                        }}
                      >
                        <AiFillDelete />
                      </button>
                    </div>
                  </li>
                  {direction &&
                    direction?.routes.length > 0 &&
                    direction.routes[0].legs &&
                    direction.routes[0].legs[i] && (
                      <li>
                        <div className="flex justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-72 h-12 items-center overflow-hidden bg-slate-50 rounded my-1 shadow border-dotted">
                          <span>
                            {direction?.routes[0].legs[i + 1]?.distance?.text}
                          </span>
                          <span
                            className="
                          text-green-500 dark:text-green-400 transition duration-150 ease-in-out hover:text-green-600 dark:hover:text-green-500 cursor-pointer
                          "
                          >
                            <BsArrowDown size={21} />
                          </span>
                          <span>
                            {direction?.routes[0].legs[i + 1]?.duration?.text}
                          </span>
                        </div>
                      </li>
                    )}
                </>
              ))}
            </>
          )}

          {locations.length > 1 && (
            <li
              key={locations[0].place_id}
              className="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer flex justify-between
                  px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-72 h-12 items-center overflow-hidden bg-gray-50 dark:bg-gray-800 rounded my-1 shadow
                  "
            >
              <span
                onClick={() => {
                  setCenter({ lat: locations[0].lat, lng: locations[0].lng });
                }}
              >
                {locations[0].formatted_address.length > 30
                  ? locations[0].formatted_address.slice(0, 30) + "..."
                  : locations[0].formatted_address}
              </span>
            </li>
          )}
        </ul>
        <div className="flex gap-2 items-center justify-center py-2  transition-all duration-200 ease-in-out cursor-pointer  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800">
          {/* <button
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
          </button> */}
          {/* download formatted maps and direction data */}
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
            onClick={handleDownload}
            disabled={
              directionError.error ||
              directionError.message === "Please add at least 2 locations" ||
              locations.length < 2 ||
              true
            }
          >
            <MdFileDownload size={24} fill="current" />
            Download
          </button>
        </div>
        <p className="text-xs text-gray-700 mb-7">
          Sort places by minial time covered
        </p>
      </div>
    </>
  );
};

export default SideBar;
