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
import { fetchLocationPhotos } from "@/states/slices/searchSlice";

const PlacesAutoComplete = ({}: {}) => {
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
    <Combobox onSelect={handleSelect} className="relative">
      <ComboboxInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!ready}
        className="combobox-input rounded"
        placeholder="Search an address"
      />
      <p className="absolute text-xs font-bold text-gray-600 -z-50">
        Select to add a new location
      </p>
      <ComboboxPopover className="z-10">
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

export default PlacesAutoComplete;
