"use client";
import { useAppDispatch } from "@/states/hooks";
import { Photo, addPlace, fetchAboutPlace } from "@/states/slices/placesSlice";
import React, { useState } from "react";

interface SearchBarProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

const SearchBar = ({ ...props }: SearchBarProps) => {
  const [options, setOptions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  return (
    <div {...props}>
      <h2
        className="mb-2 text-4xl font-bold tracking-tight text-gray-900 decoration-pink-500/30 dark:text-white sm:text-5xl md:text-6xl
      "
      >
        Your Trip Planner
      </h2>
      <form
        id="dropdownDefaultButton"
        data-dropdown-toggle="dropdown"
        data-dropdown-trigger="hover"
      >
        <label
          htmlFor="default-search"
          className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
        >
          Search
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              aria-hidden="true"
              className="w-5 h-5 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search Place..."
            required
            autoComplete="off"
            onKeyUp={async (e) => {
              if (e.currentTarget.value === "") {
                setOptions([]);
                return;
              }
              setLoading(true);
              try {
                const data = fetch(
                  `/api/places?query=${e.currentTarget.value}`
                );
                const res = await data;
                const json = await res.json();
                setOptions(json.predictions);
              } catch (err) {
                console.log(err);
              } finally {
                setLoading(false);
              }
            }}
          />
        </div>
      </form>

      <div
        id="dropdown"
        className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-full dark:bg-gray-700"
      >
        {" "}
        {!loading || !options ? (
          <ul
            className="py-2 text-sm text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdownDefaultButton"
          >
            {options &&
              options.map((option) => (
                <li
                  key={option.place_id}
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                  onClick={() => {
                    dispatch(fetchAboutPlace(option));
                  }}
                >
                  {option.description}
                </li>
              ))}
          </ul>
        ) : (
          <p className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
            Loading...
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchBar;

export interface Prediction {
  description: string;
  matched_substrings: MatchedSubstring[];
  place_id: string;
  reference: string;
  structured_formatting: StructuredFormatting;
  terms: Term[];
  types: string[];
  photos: Photo[];
  lat: number;
  lon: number;
}

export interface MatchedSubstring {
  length: number;
  offset: number;
}

export interface StructuredFormatting {
  main_text: string;
  main_text_matched_substrings: MatchedSubstring[];
  secondary_text: string;
}

export interface Term {
  offset: number;
  value: string;
}
