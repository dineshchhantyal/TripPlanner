import { useState, useEffect } from "react";
export const usePosition = () => {
  const [position, setPosition] = useState({
    latitude: 43.65,
    longitude: -80.49,
  });
  const [error, setError] = useState<{
    code: any;
    message: string;
  }>({
    code: null,
    message: "",
  });

  const onChange = ({
    coords,
  }: {
    coords: { latitude: any; longitude: any };
  }) => {
    setPosition({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  };
  const onError = (error: { message: string }): any => {
    setError((err) => ({ ...err, message: error.message }));
  };
  useEffect(() => {
    const geo = navigator.geolocation;
    if (!geo) {
      setError({ code: 14442, message: "Geolocation is not supported" });
      return;
    }
    const watcher = geo.watchPosition(onChange, onError);
    return () => geo.clearWatch(watcher);
  }, []);
  return { ...position, error };
};
