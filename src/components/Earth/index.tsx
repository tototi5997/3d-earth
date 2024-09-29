import { useEffect, useRef } from "react";
import { EarthScene } from "./earth-scene";

const Earth3D = () => {
  const earthRef = useRef(null);

  useEffect(() => {
    if (earthRef.current) {
      new EarthScene(earthRef.current, 1200);
    }
  }, [earthRef]);
  return <div ref={earthRef}></div>;
};

export default Earth3D;
