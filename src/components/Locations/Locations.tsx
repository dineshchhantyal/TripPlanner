"use client";

import { useAppSelector } from "@/states/hooks";
import Image from "next/image";

import React from "react";

const Locations = () => {
  const locations = useAppSelector((state) => state.places.places);
  console.log(locations);
  return (
    // this will render all the locations as a card component, user can drag and drop to change the order of the locations and the map will update accordingly to the new order of the locations. Also, one arrow will be displayed on the left and right side of the card to allow user to move the card up and down. Also long arrow will connect the cards to show the direction of the route.

    <div className="flex flex-col items-center justify-center w-full h-full">
      {locations.map((location) => (
        <div
          className="flex flex-col items-center justify-between w-80 h-80 pt-4 m-4 rounded
        bg-gray-100 dark:bg-gray-800 shadow-md dark:shadow-lg text-gray-800 dark:text-gray-100 text-center text-sm font-medium transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110 hover:shadow-xl cursor-pointer"
          style={{
            background: `url(${location.photos[0].src.portrait})`,
            backgroundSize: "auto",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
          key={location.place_id}
        >
          <h2 className="flex flex-row items-center justify-center w-full min-h-10 px-2 text-xl font-bold text-center text-white bg-gray-800 bg-opacity-50 rounded-t">
            {location.description}
          </h2>
          <div className="flex flex-row items-center justify-center overflow-x-scroll self-end rounded-b">
            {location?.photos.map((photo) => (
              <Image
                src={photo.src.tiny}
                alt={location.description}
                width={"280"}
                key={photo.src.tiny}
                height={"200"}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Locations;
