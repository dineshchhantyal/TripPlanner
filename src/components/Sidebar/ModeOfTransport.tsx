import { useState, useEffect } from "react";

import "@reach/combobox/styles.css";

import { useAppSelector } from "@/states/hooks";

import { BsFillCarFrontFill } from "react-icons/bs";
import { BiWalk } from "react-icons/bi";
import { BsBicycle } from "react-icons/bs";
import { MdDirectionsTransitFilled, MdOpenInNew } from "react-icons/md";
import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";

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
}) => {
  const locations = useAppSelector((state) => state.searchLocation.places);

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    const win = window.open("");
    if (win) {
      win.document.write(document.getElementById("panel")?.innerHTML || "");
    }
  };

  return (
    <div className="relative w-full">
      {!directionError.error && locations && locations.length > 1 && (
        <>
          <div>
            <div
              className="absolute right-1/2 -top-1 -mt-2 -mr-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 p-2 rounded text-xs font-bold cursor-pointer translate-x-1/2 -translate-y-1/2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all
          "
            >
              {open ? (
                <AiOutlineArrowDown onClick={() => setOpen(!open)} />
              ) : (
                <AiOutlineArrowUp onClick={() => setOpen(!open)} />
              )}
            </div>
            <div
              id="panel"
              className={`bg-white dark:bg-gray-800 shadow-md rounded-md p-2 w-72 mb-1 overflow-y-scroll transition-all
            ${open ? "h-40 opacity-100" : "h-0 opacity-0"}
            `}
            >
              <span
                className={`
              block cursor-pointer w-max hover:bg-gray-100 dark:hover:bg-gray-700 transition-all rounded p-2
            `}
                onClick={() => handleOpen()}
              >
                <MdOpenInNew />
              </span>
            </div>
          </div>
        </>
      )}
      <div className="w-full justify-between bg-white border rounded flex transition-all">
        {directionError.error && (
          <div className="absolute -top-4 right-0 -mt-2 -mr-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            {directionError.message}
          </div>
        )}
        <div
          className={`p-4 cursor-pointer hover:bg-slate-600 transition-all rounded hover:text-white ${
            mode === "DRIVING" ? "bg-slate-800 text-white" : " border-gray-100"
          }`}
          onClick={() => setMode("DRIVING")}
        >
          <BsFillCarFrontFill size={24} />
        </div>
        <div
          className={`p-4 cursor-pointer hover:bg-slate-600 transition-all rounded hover:text-white  ${
            mode === "WALKING" ? "bg-slate-800 text-white" : ""
          }`}
          onClick={() => setMode("WALKING")}
        >
          <BiWalk size={24} />
        </div>
        <div
          className={`p-4 cursor-pointer hover:bg-slate-600 transition-all rounded hover:text-white  ${
            mode === "BICYCLING" ? "bg-slate-800 text-white" : ""
          }`}
          onClick={() => setMode("BICYCLING")}
        >
          <BsBicycle size={24} />
        </div>
        <div
          className={`p-4 cursor-pointer hover:bg-slate-600 transition-all rounded hover:text-white ${
            mode === "TRANSIT" ? "bg-slate-800 text-white" : ""
          }`}
          onClick={() => setMode("TRANSIT")}
        >
          <MdDirectionsTransitFilled size={24} />
        </div>
      </div>
    </div>
  );
};

export default ModeOfTransport;
